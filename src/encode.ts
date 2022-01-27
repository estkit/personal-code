import { ActualNumber, EncoderCallback, IsikukoodData, IsikukoodParsed, MinMax } from "./types";
import { asStrSlice, calculateChecksum, getMonthMaxDay, hasLeapYears, isInteger } from "./utils";
import { isValidYear, isValidShortYear, isValidMonth, isValidDay, isValidSerial } from "./validate";

const encodingTable: EncoderCallback[] = [
    encodeGenderAndCentury,
    encodeYear,
    encodeMonth,
    encodeDay,
    encodeSerial,
    encodeChecksum
];

function randomIntegerBetween(start: number, end: number): number {
    return Math.round(start + (Math.random() * (end - start)));
}

/**
 * Randomizes a decoded Estonian personal identification code
 * by converting `minmax` and `undefined` fields into `actual` fields.
 * 
 * Modifies the input data object.
 * Checksum will be calculated automatically
 * 
 * @param {IsikukoodData} data - IsikukoodData object containing data to be randomized
 * @returns {IsikukoodData} Returns the modified `data` parameter
 */
export function randomize(data: IsikukoodData): IsikukoodData {
    const { gender, year, shortYear, month, day, serial, checksum } = data;
    if(!(gender?.actual === "male" || gender?.actual === "female")) {
        data.gender = { actual: Math.random() < 0.5 ? "male" : "female" };
    }

    if(!year?.actual) {
        const currentYear = new Date().getFullYear();
        const maxYears = 150;
        if(year?.min && year?.max) {
            data.year = { actual: Math.round(year.min + (Math.random() * (year.max - year.min))) };
        } else {
            const century = (new Date().getFullYear()).toString().slice(0, 2);

            if(shortYear?.actual) {
                data.year = { actual: parseInt(century + shortYear.actual) };
            } else if(shortYear?.min && shortYear?.max) {
                data.year = { actual: parseInt(century + (Math.random() * (shortYear.max - shortYear.min))) };
            } else {
                data.year = { actual: Math.round(currentYear - (Math.random() * maxYears)) };
            }
        }
    }
    data.shortYear = { actual: parseInt(data.year?.actual?.toString().slice(2, 4) as string) };

    if(!month?.actual) {
        data.month = { actual: randomIntegerBetween(month?.min || 1, month?.max || 12)}
    }
    if(!day?.actual) {
        data.day = { actual: randomIntegerBetween(day?.min || 1, day?.max || getMonthMaxDay(data?.month?.actual as number, data?.year?.actual as number)) };
    }
    if(!serial?.actual) {
        data.serial = { actual: randomIntegerBetween(serial?.min || 1, serial?.max || 999) };
    }
    data.checksum = { actual: calculateChecksum(encode(data).slice(0, 10)) };
    return data;
}

/**
 * Encodes an Estonian personal identification code.
 * 
 * Checksum may be omitted, in which case it will be calculated automatically
 * 
 * @param {IsikukoodData} data - IsikukoodData object containing data to be encoded
 * @returns {string} Returns encoded personal identification code.
 */
export function encode(data: IsikukoodData | IsikukoodParsed) {
    const newData = ((data as any).results || data || {}) as IsikukoodData;
    return encodingTable.map(fn => fn(newData)).join("");
}

export function encodeGenderAndCentury(data: IsikukoodData) {
    const { gender, year } = data;
    const genderOffset = gender?.actual.startsWith("m") ? 0 : (gender?.actual.startsWith("f") ? 1 : NaN);

    let century = NaN;
    const { min, max, actual } = year!;
    if(isInteger(actual)) {
        century = parseInt(asStrSlice(actual, 0, 2));
    } else if(isInteger(min) && isInteger(max)) {
        const minCentury = asStrSlice(min, 0, 2);
        const maxCentury = asStrSlice(max, 0, 2);
        if(minCentury === maxCentury) {
            century = parseInt(minCentury);
        }
    }

    if(century < 18 || century > 21) throw new Error("Invalid year");
    return ((1 + genderOffset + (century - 18) * 2) || "x").toString();
}

export function encodeYear(data: IsikukoodData) {
    const { year, shortYear } = data;

    const { encoded, encodedMin, encodedMax } = year ? toEncodableString(year, 2, 4, isValidYear) : (shortYear ? toEncodableString(shortYear, 0, 2, isValidShortYear) : {} as any);
    return encoded || intersectEncode(encodedMin, encodedMax, 2);
}

export function encodeMonth(data: IsikukoodData) {
    const { month } = data;

    const { encoded, encodedMin, encodedMax } = month ? toEncodableString(month, 0, 2, isValidMonth) : {} as any;
    return encoded || intersectEncode(encodedMin, encodedMax, 2);
}

export function encodeDay(data: IsikukoodData) {
    const { day, month, year, shortYear } = data;

    const y = year || shortYear;
    const theoreticalMonth = month?.actual || 1;
    // The actual year doesnt matter here. Will only be 3 if its february and not a leap year, otherwise 4.
    const theoreticalYear = (theoreticalMonth !== 2 || !y) ? 4 : 3 + Number(hasLeapYears(y));

    const validator = (d: number) => isValidDay(d, theoreticalMonth, theoreticalYear);

    const { encoded, encodedMin, encodedMax } = day ? toEncodableString(day, 0, 2, validator) : {} as any;
    return encoded || intersectEncode(encodedMin, encodedMax, 2);
}

export function encodeSerial(data: IsikukoodData) {
    const { serial } = data;

    const { encoded, encodedMin, encodedMax } = serial ? toEncodableString(serial, 0, 3, isValidSerial) : {} as any;
    return encoded || intersectEncode(encodedMin, encodedMax, 3);
}

export function encodeChecksum(data: IsikukoodData) {
    const { checksum } = data;

    const { encoded, encodedMin, encodedMax } = checksum ? toEncodableString(checksum, 0, 1) : {} as any;
    return encoded || intersectEncode(encodedMin, encodedMax, 1);
}

export function intersectEncode(encodedMin: string, encodedMax: string, length: number) {
    const stringBuilder: string[] = [];
    encodedMin = encodedMin || "";
    encodedMax = encodedMax || "";

    // hasBeenUnequal is used to guarantee that every match after the first x also results in a x
    // Incorrect: min: "89", max: "99" => result: "x9"
    // Correct:   min: "89", max: "99" => result: "xx"
    let hasBeenUnequal = false;
    for(let i = 0; i < length; i++) {
        const char1 = encodedMin[i];
        const char2 = encodedMax[i];
        const isEqual: boolean = !hasBeenUnequal && char1 === char2;
        stringBuilder.push(isEqual && char1 !== undefined ? char1 : "x");

        if(!hasBeenUnequal) {
            hasBeenUnequal = isEqual;
        }
    }
    return stringBuilder.join("");
}

export function toEncodableString(minmaxActual: MinMax & ActualNumber, sliceStart: number, sliceEnd: number, validateCb = (_: any) => true) {
    const sliceLength = sliceEnd - sliceStart;
    const { min, max, actual } = minmaxActual!;
    let encoded, encodedMin, encodedMax;
    if(isInteger(actual) && validateCb(actual)) {
        encoded = asStrSlice(actual, sliceStart, sliceEnd).padStart(sliceLength, "0");
    } else if(isInteger(min) && validateCb(min) && isInteger(max) && validateCb(max)) {
        encodedMin = asStrSlice(min, sliceStart, sliceEnd).padStart(sliceLength, "0");
        encodedMax = asStrSlice(max, sliceStart, sliceEnd).padStart(sliceLength, "0");
    } else {
        throw new Error("Invalid input");
    }
    return { encoded, encodedMin, encodedMax };
}