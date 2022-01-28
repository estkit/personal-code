import { ConsumableString } from "./consumablestring";
import { IsikukoodParsed, DecoderCallback, ParseOptions } from "./types";
import { asMinMax, calculateChecksum, getMonthMaxDay, hasLeapYears, intersectDecode, intersectDecodeAndRangeIntersect, intOrNaN, isInteger, isNumeric, rangeIntersect, tryIntoActual } from "./utils";

const decodingTable: [DecoderCallback, number][] = [
    [decodeGenderAndCentury, 1],
    [decodeYear, 2],
    [decodeMonth, 2],
    [decodeDay, 2],
    [decodeSerial, 3],
    [decodeChecksum, 1]
];

let log_error: Function = console.error;

function consumeWithPlaceholders(consumable: ConsumableString, amount: number) {
    return consumable.consumeStart(amount).trimSliceEnd("x").get();
}
function consumeWithoutPlaceholders(consumable: ConsumableString, amount: number) {
    return consumable.consumeStart(amount).get();
}

export function setErrorLogger(errFn: Function) {
    log_error = errFn;
}

/**
 * Decodes an Estonian personal identification code.
 * 
 * If a field is incomplete then returns the range in which it could be
 * 
 * @param {string} code - Estonian personal identification code.
 * @param {ParseOptions} options - Options to change the behaviour of the function
 * @returns {IsikukoodParsed} Returns validation errors and parsed data.
 */
export function decode(code: string, options: ParseOptions = { placeholders: false, checklength: true }): IsikukoodParsed {
    const { placeholders, checklength } = options;
    if(placeholders === false && !isNumeric(code)) {
        throw new Error("Input code must contain only numbers");
    }

    const data: IsikukoodParsed = { results: { code, valid: false }, errors: {} };
    const consumable = new ConsumableString(code);
    // const consume = (placeholders ? consumeWithPlaceholders : consumeWithoutPlaceholders).bind(null, consumable);
    const consume = consumeWithoutPlaceholders.bind(null, consumable);

    for (let [decoder, positions] of decodingTable) {
        if (consumable.parsed()) break;
        decoder(consume(positions).padEnd(positions, "x"), data);
    }

    // if checklength is omitted then the length should be checked too
    if (checklength !== false && code.length !== 11) {
        data.errors.length = { required: 11, actual: code.length };
    }

    const hasErrors = !!Object.keys(data.errors).length;
    data.results.valid = !(hasErrors || code.length < 11);

    return data;
}

export function decodeGenderAndCentury(pattern = "x", obj: IsikukoodParsed) {
    try {
        if (pattern === "x") {
            obj.results.gender = { actual: "any", pattern };
            obj.results.year = { min: 1800, max: 2199 };
            return;
        }

        const genderNr = intOrNaN(pattern);
        if (genderNr >= 1 && genderNr <= 6) {
            const mul = Math.floor((genderNr + 1) / 2) - 1;
            const century = 1800 + mul * 100;

            obj.results.gender = { actual: genderNr % 2 ? "male" : "female", pattern };
            obj.results.year = { min: century, max: century + 99 };
            return;
        }
    } catch(e) { log_error(e); }
    obj.errors.genderAndCentury = { min: 1, max: 6, actual: pattern };
}

export function decodeYear(pattern = "xx", obj: IsikukoodParsed) {
    try {
        const { min, max } = intersectDecodeAndRangeIntersect(pattern, "00", "99")!;
        if(isInteger(min) && isInteger(max)) {
            obj.results.shortYear = {...tryIntoActual({ min, max }), pattern };
            if(obj.results.year) {
                const year = asMinMax(obj.results.year);
                const minYear = (Math.floor(year.min / 100) * 100) + min;
                const maxYear = (Math.floor(year.max / 100) * 100) + max;
    
                // TODO: needs pattern probably
                obj.results.year = tryIntoActual(rangeIntersect(minYear, maxYear, obj.results.year.min!, obj.results.year.max!)!);
            }
            return;
        }
    } catch(e) { log_error(e); }

    obj.errors.shortYear = { min: 0, max: 99, actual: pattern };
}

export function decodeMonth(pattern = "xx", obj: IsikukoodParsed) {
    try {
        const { min, max } = intersectDecodeAndRangeIntersect(pattern, "01", "12")!;
        if(isInteger(min) && isInteger(max)) {
            obj.results.month = {...tryIntoActual({ min, max }), pattern };
            return;
        }
    } catch(e) { log_error(e); }
    obj.errors.month = { min: 1, max: 12, actual: pattern };
}

// NB: months, where min and max are the same will result in erroneous results
export function decodeDay(pattern = "xx", obj: IsikukoodParsed) {
    let maxMonthDay = 31;
    try {
        const month = obj.results.month as any;

        const dominantMonth = (month?.max - month?.min) ? 1 : (month?.actual || month?.min || month?.max);
        const dominantYear = 3 + Number(hasLeapYears((obj.results.year || obj.results.shortYear)!));
        maxMonthDay = getMonthMaxDay(dominantMonth, dominantYear);
        console.log(maxMonthDay);

        const { min, max } = intersectDecodeAndRangeIntersect(pattern, "01", maxMonthDay.toString().padStart(2, "x"))!;
        if(isInteger(min) && isInteger(max)) {
            obj.results.day = {...tryIntoActual({ min, max }), pattern };
            return;
        }
    } catch(e) { log_error(e); }

    obj.errors.day = { min: 1, max: maxMonthDay, actual: pattern };
}

export function decodeSerial(pattern = "xxx", obj: IsikukoodParsed) {
    try {
        const { min, max } = intersectDecodeAndRangeIntersect(pattern, "001", "999")!;
        if(max !== undefined && min !== undefined) {
            obj.results.serial = {...tryIntoActual({ min, max }), pattern };
            return;
        }
    } catch(e) { log_error(e); }
    obj.errors.serial = { min: 1, max: 999, actual: pattern };
}

export function decodeChecksum(pattern = "x", obj: IsikukoodParsed) { 
    try {
        const checksumNr = intOrNaN(pattern);
        if (!isNaN(checksumNr) || pattern === "x") {
            const correctChecksum = calculateChecksum(obj.results.code);
            if (checksumNr === correctChecksum || pattern === "x") {
                obj.results.checksum = { actual: checksumNr, pattern };
                return;
            } else {
                obj.errors.checksum = { required: correctChecksum, actual: pattern };
                return;
            }
        }
    } catch(e) { log_error(e); }

    obj.errors.checksum = { min: 0, max: 9, actual: pattern };
}
