import { parse, validate, encode, decode } from "./parse";
import { calculateChecksum, determineHospital, intOrNaN } from "./utils";

import type { IsikukoodData } from "./types";

/**
 * Convenience class to work with Estonian Personal Codes.
 * @see {@link https://et.wikipedia.org/wiki/Isikukood}
 */
export class EstonianPersonalCode {
    #code: string;

    /**
     * @param {string=} code - Estonian Personal Code as a string.
     * @returns {EstonianPersonalCode} Returns class instance.
     */
	constructor(code = "") {
		this.#code = code.toString();
	}

    /**
     * Sets the Estonian Personal Code as a string.
     * 
     * @returns {this} Returns instance.
     */
    setCode(code: string) {
        this.#code = code.toString();
        return this;
    }
    /**
     * @returns {string} Returns Estonian Personal Code as a string.
     */
    getCode() {
        return this.#code;
    }

    /**
     * @returns {"male" | "female" | null} Returns gender or null.
     */
    getGender() {
        // Maybe rewrite.

        const genderCharCode = this.#code.charCodeAt(0);
        const zeroCharCode = 48;
        const ninePlusOneCharCode = 58;

        // Check if the characode is between "1" and "9", and return the result.
        if(genderCharCode > zeroCharCode && genderCharCode < ninePlusOneCharCode)
            return (genderCharCode - zeroCharCode) % 2 ? "male" : "female";
        return null; // Invalid character detected
    }
    /**
     * @returns {number | NaN} Returns the last two digits of birth year or NaN.
     */
    getYear() {
        return intOrNaN(this.#code.slice(1, 3), 2);
    }
    /**
     * @returns {number | NaN} Returns the birth month or NaN.
     */
    getMonth() {
		return intOrNaN(this.#code.slice(3, 5), 2);
	}
    /**
     * @returns {number | NaN} Returns the birth day or NaN.
     */
    getDay() {
		return intOrNaN(this.#code.slice(5, 7), 2);
	}
    /**
     * @returns {number | NaN} Returns the id or NaN.
     */
    getId() {
        return intOrNaN(this.#code.slice(7, 10), 3);
    }
    /**
     * @returns {number | NaN} Returns the checksum or NaN.
     */
    getChecksum() {
        return intOrNaN(this.#code.slice(10, 11), 1);
    }
	
    /**
     * @returns {number | NaN} Returns full birth year or NaN.
     */
	getFullYear() {
		const epoch = 1800;
		const multiplier = Math.floor((parseInt(this.#code?.[0]) + 1) / 2) - 1;
        if(multiplier < 0) return NaN;

		const century = epoch + multiplier * 100;
		return century + this.getYear();
	}
    /**
     * @returns {Date} Returns Date object representing the birthday.
     */
	getDate() {
		return new Date(this.getFullYear(), this.getMonth() - 1, this.getDay());
	}

    // getHospital() {
    //     return determineHospital(this.getId(), this.getDate());
    // }
    /**
     * Calculates the checksum of an Estonian personal identification code
     * using one or two passes of modulo-11 checkdigit algorithm.
     * 
     * @returns {Number} The checksum.
     */
    calculateChecksum() {
        return calculateChecksum(this.#code);
    }

    /**
     * Progressively validates and decodes the length, gender, 
     * year, month, day, id and checksum of an 
     * Estonian personal identification code(isikukood).
     * 
     * Incomplete fields will be eagerly validated but wont be decoded.
     * 
     * @returns {IsikukoodParsed} Returns validation errors and parsed data.
     */
    parse() {
        return parse(this.#code);
    }
    /**
     * Progressively validates an Estonian personal identification code(isikukood).
     * 
     * This is a wrapper around {@link EstonianPersonalCode.parse parse} function.
     * 
     * @returns {IsikukoodErrors | null} Returns validation errors or null.
     */
	validate() {
        return validate(this.#code);
	}
    /**
     * Encodes an Estonian personal identification code(isikukood).
     * 
     * Checksum may be omitted, in which case it will be calculated automatically
     * 
     * @param {IsikukoodData} data - IsikukoodData object containing data to be encoded
     * @returns {EstonianPersonalCode} Returns encoded personal identification code.
     */
    encode(data: IsikukoodData) {
        this.#code = encode(data);
        return this;
    }
    /**
     * Progressively decodes an Estonian personal identification code(isikukood).
     * 
     * This is a wrapper around {@link EstonianPersonalCode.parse parse} function.
     * 
     * Incomplete fields will not be parsed.
     * 
     * @returns {IsikukoodData | null} Returns decoded results or null.
     */
    decode() {
        return decode(this.#code);
    }
}

export * from "./types";
export * from "./parse";
export * from "./utils";