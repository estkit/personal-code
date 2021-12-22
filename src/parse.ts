import type { IsikukoodData, IsikukoodErrors, IsikukoodParsed } from "./types";
import { calculateChecksum } from "./utils";

/**
 * Progressively validates an Estonian personal identification code(isikukood).
 * 
 * This is a wrapper around {@link parse} function.
 * 
 * @param {string} code - Estonian personal identification code(isikukood).
 * @returns {IsikukoodErrors | null} Returns validation errors or null.
 */
 export function validate(code: string) {
    const errors = parse(code)?.["errors"];
    for (let _ in errors)
        return errors;
    return null;
}

/**
 * Progressively decodes an Estonian personal identification code(isikukood).
 * 
 * This is a wrapper around {@link parse} function.
 * 
 * Incomplete fields will not be parsed.
 * 
 * @param {string} code - Estonian personal identification code(isikukood).
 * @returns {IsikukoodData | null} Returns decoded results or null.
 */
export function decode(code: string) {
    const data = parse(code)?.["data"];
    for (let _ in data)
        return data;
    return null;
}

/**
 * Encodes an Estonian personal identification code(isikukood).
 * 
 * Checksum may be omitted, in which case it will be calculated automatically
 * 
 * @param {IsikukoodData} data - IsikukoodData object containing data to be encoded
 * @returns {string} Returns encoded personal identification code.
 */
export function encode(data: IsikukoodData) {
    const { gender, year, month, day, id, checksum } = data || {};

    const genderOffset = gender?.startsWith("m") ? 0 : (gender?.startsWith("f") ? 1 : null);
    if(genderOffset === null) throw new Error("Invalid gender");

    if(!year || isNaN(year) || year < 1800 || year > 2199) throw new Error("Invalid year");
    const yearStr = year.toString();
    const century = parseInt(yearStr.slice(0, 2)); // technically century + 1

    const yearShortStr = yearStr.slice(2);
    const first = (1 + genderOffset + (century - 18) * 2).toString();

    if(!month || isNaN(month) || month < 1 || month > 12) throw new Error("Invalid month");
    const monthStr = month.toString().padStart(2, "0");

    const maxDay = month !== 2 ? (30 + (month % 2)) : (28 + Number(!(parseInt(yearStr) % 4)));
    if(!day || isNaN(day) || day < 1 || day > maxDay) throw new Error("Invalid day");
    const dayStr = day.toString().padStart(2, "0");

    if(!id || isNaN(id)) throw new Error("Invalid id");
    const idStr = id.toString().padStart(3, "0").slice(0, 3);

    const partialCode = first + yearShortStr + monthStr + dayStr + idStr;
    const checksum2 = calculateChecksum(partialCode);
    if(checksum && checksum !== checksum2) throw new Error("Invalid checksum");

    return partialCode + checksum2;
}

/**
 * Progressively validates and decodes the length, gender, 
 * year, month, day, id and checksum of an 
 * Estonian personal identification code(isikukood).
 * 
 * Incomplete fields will be eagerly validated but wont be decoded.
 * 
 * @param {string} code - Estonian personal identification code(isikukood).
 * @returns {IsikukoodParsed} Returns validation errors and parsed data.
 */
export function parse(code = ""): IsikukoodParsed {

    // Two reasons why lots of functionality is almost duplicate from EstonianPersonalCode but wont be fixed:
    // 1. This function is supposed to be self-contained(except the calculateChecksum call)
    // 2. The getters in EstonianPersonalCode class are strict, when it comes errors,
    //    which doesnt play well with the eager validation approach that is used in this function

    let errors: IsikukoodErrors = {};
    let data: IsikukoodData = {};
    code = code.toString();

    // Label used to skip to the end when running out of characters to parse
    validate: {

        // Validation 1: The code should be exactly 11 characters long.
        if(code.length !== 11) 
            errors["length"] = { required: 11, actual: code.length };

        // Validation 2: The first character of the code should be between 1-9
        // The check is done using charcodes instead of isNaN because 0 is invalid in this position
        if(!code.length) break validate;
        const genderCharCode = code.charCodeAt(0);
        if(genderCharCode > 48 && genderCharCode < 58)
            data["gender"] = parseInt(code[0]) % 2 ? "male" : "female";
        else
            errors["gender"] = { min: 1, max: 9, actual: code[0] };

        // Validation 3: The year should contain only numeric characters
        if(code.length < 2) break validate;
        const yearStr = code.slice(1, 3);
        if(isNaN(yearStr as any))
            errors["year"] = { min: 0, max: 99, actual: yearStr };
        else if(data["gender"] && yearStr.length === 2) {
            const epoch = 1800;
            const multiplier = Math.floor((parseInt(code[0]) + 1) / 2) - 1;
            const century = epoch + multiplier * 100;
            data["year"] = century + parseInt(yearStr);
        }

        // Validation 4: The month should be between 1-12 and contain only numeric characters
        if(code.length < 4) break validate;
        const monthStr = code.slice(3, 5);
        const month = parseInt(monthStr.padEnd(2, "0")); // trailing zero for validation purposes
        if(isNaN(monthStr as any) || (month < 1 && monthStr.length > 1) || month > 12)
            errors["month"] = { min: 1, max: 12, actual: monthStr };
        else if(monthStr.length === 2)
            data["month"] = month;

        // Validation 5: The day should be between 1-maxDay and contain only numeric characters
        // maxDay is calculated using month, and year, if the month is February
        // maxDay and day may be NaN if the dependencies are also NaNs
        if(code.length < 6) break validate;
        const dayStr = code.slice(5, 7);
        const day = parseInt(dayStr.padEnd(2, "0")); // trailing zero for validation purposes
        const maxDay = month !== 2 ? (30 + (month % 2)) : (28 + Number(!(parseInt(yearStr) % 4)));
        if(isNaN(dayStr as any) || isNaN(maxDay) || (day < 1 && dayStr.length > 1) || day > maxDay) 
            errors["day"] = { min: 1, max: maxDay, actual: dayStr };
        else if(dayStr.length === 2)
            data["day"] = day;

        // Validation 6: The id should contain only numeric characters
        if(code.length < 8) break validate;
        const idStr = code.slice(7, 10);
        if(isNaN(idStr as any))
            errors["id"] = { actual: idStr, min: 0, max: 999 };
        else if(idStr.length === 3)
            data["id"] = parseInt(idStr);

        // Validation 7: The given checksum should match the calculated checksum
        if(code.length < 11) break validate;
        const checksum1 = code[10];
        const checksum2 = calculateChecksum(code);
        if(checksum1 !== checksum2.toString())
            errors["checksum"] = { required: checksum2, actual: checksum1 };
        else 
            data["checksum"] = parseInt(checksum1);
    }

    let returnData: IsikukoodParsed = {};
    for(let _ in errors) {
        returnData["errors"] = errors;
        break;
    }

    for(let _ in data) {
        returnData["data"] = data;
        break;
    }

    return returnData;
}