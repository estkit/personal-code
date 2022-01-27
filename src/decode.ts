import { ConsumableString } from "./consumablestring";
import { IsikukoodParsed, DecoderCallback, ParseOptions } from "./types";
import { calculateChecksum, getMonthMaxDay, intOrNaN } from "./utils";

const decodingTable: [DecoderCallback, number][] = [
    [decodeGenderAndCentury, 1],
    [decodeYear, 2],
    [decodeMonth, 2],
    [decodeDay, 2],
    [decodeSerial, 3],
    [decodeChecksum, 1]
];

function consumeWithPlaceholders(consumable: ConsumableString, amount: number) {
    return consumable.consumeStart(amount).trimSliceEnd("x").get();
}
function consumeWithoutPlaceholders(consumable: ConsumableString, amount: number) {
    return consumable.consumeStart(amount).get();
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
    const data: IsikukoodParsed = { results: { code, valid: false }, errors: {} };
    const consumable = new ConsumableString(code);
    const consume = (placeholders ? consumeWithPlaceholders : consumeWithoutPlaceholders).bind(null, consumable);

    for (let [decoder, positions] of decodingTable) {
        if (consumable.parsed()) break;
        decoder(consume(positions), data);
    }
    // if checklength is omitted then the length should be checked
    if (checklength !== false && code.length !== 11) {
        data.errors.length = { required: 11, actual: code.length };
    }

    const hasErrors = !!Object.keys(data.errors).length;
    data.results.valid = !(hasErrors || code.length < 11);
    return data;
}

export function decodeGenderAndCentury(str = "", obj: IsikukoodParsed) {
    if (str === "") {
        obj.results.gender = { actual: "any" };
        obj.results.year = { min: 1800, max: 2199 };
        return;
    }

    const genderNr = intOrNaN(str);
    if (genderNr >= 1 && genderNr <= 8) {
        const mul = Math.floor((genderNr + 1) / 2) - 1;
        const century = 1800 + mul * 100;

        obj.results.gender = { actual: genderNr % 2 ? "male" : "female" };
        obj.results.year = { min: century, max: century + 99 };
        return;
    }

    obj.errors.genderAndCentury = { min: 1, max: 8, actual: str };
}

export function decodeYear(str = "", obj: IsikukoodParsed) {
    if (str === "") {
        obj.results.shortYear = { min: 0, max: 99 };
        return;
    }

    const shortYearNr = intOrNaN(str);
    if (!isNaN(shortYearNr)) {
        const shortYear = str.length === 2 ?
            { actual: shortYearNr } :
            { min: intOrNaN(str.padEnd(2, "0")), max: intOrNaN(str.padEnd(2, "9")) };
        obj.results.shortYear = shortYear;

        if ((obj.results.year as any)?.max - (obj.results.year as any)?.min === 99) {
            const century: number = (obj.results.year as any).min
            obj.results.year = shortYear.actual ?
                { actual: century + shortYear.actual } :
                { min: century + (shortYear.min || 0), max: century + (shortYear.max || 99) };
        }
        return;
    }

    obj.errors.shortYear = { min: 0, max: 99, actual: str };
}

export function decodeMonth(str = "", obj: IsikukoodParsed) {
    if (str === "") {
        obj.results.month = { min: 1, max: 12 };
        return;
    }

    const monthNr = intOrNaN(str);
    const minMonth = intOrNaN(str.padEnd(2, "0"));
    const maxMonth = intOrNaN(str.padEnd(2, "9"));

    if (!isNaN(monthNr) && minMonth <= 12) {
        if (str.length === 2) {
            if (minMonth > 0) {
                obj.results.month = { actual: monthNr };
                return;
            }
        } else {
            const min = minMonth || 1;
            const max = Math.min(maxMonth, 12);
            obj.results.month = { min, max };
            return;
        }
    }

    obj.errors.month = { min: 1, max: 12, actual: str };
}

// NB: months, where min and max are the same will result in erroneous results
export function decodeDay(str = "", obj: IsikukoodParsed) {
    const month = obj.results.month as any;
    const year = obj.results.year as any;
    const shortYear = obj.results.shortYear as any;

    let maxMonthDay = getMonthMaxDay(month, year || shortYear);

    if (str === "") {
        obj.results.day = { min: 1, max: maxMonthDay };
        return;
    }

    const dayNr = intOrNaN(str);
    const minDay = intOrNaN(str.padEnd(2, "0"));
    const maxDay = intOrNaN(str.padEnd(2, "9"));
    if (!isNaN(dayNr) && minDay <= maxMonthDay) {
        if (str.length === 2) {
            if (minDay > 0) {
                obj.results.day = { actual: dayNr };
                return;
            }
        } else {
            const min = minDay || 1;
            const max = Math.min(maxDay, maxMonthDay);
            obj.results.day = { min, max };
            return;
        }
    }

    obj.errors.day = { min: 1, max: maxMonthDay, actual: str };
}

export function decodeSerial(str = "", obj: IsikukoodParsed) {
    if (str === "") {
        obj.results.serial = { min: 1, max: 999 };
        return;
    }

    const serialNr = intOrNaN(str);
    if (!isNaN(serialNr)) {
        if (str.length === 3) {
            if (serialNr > 0) {
                obj.results.serial = { actual: serialNr };
                return;
            }
        } else {
            const min = intOrNaN(str.padEnd(3, "0")) || 1;
            const max = intOrNaN(str.padEnd(3, "9")) || 999;
            obj.results.serial = { min, max };
            return;
        }
    }

    obj.errors.serial = { min: 1, max: 999, actual: str };
}

export function decodeChecksum(str = "", obj: IsikukoodParsed) {
    if (str === "") {
        obj.results.checksum = { min: 0, max: 9 };
        return;
    }

    const checksumNr = intOrNaN(str);
    if (!isNaN(checksumNr)) {
        const correctChecksum = calculateChecksum(obj.results.code);
        if (checksumNr === correctChecksum) {
            obj.results.checksum = { actual: checksumNr };
            return;
        } else {
            obj.errors.checksum = { required: correctChecksum, actual: str };
            return;
        }
    }

    obj.errors.checksum = { min: 0, max: 9, actual: str };
}
