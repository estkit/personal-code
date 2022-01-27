import { MinMax, ActualNumber } from "./types";

/**
 * Calculates the checksum of an Estonian personal identification code
 * using one or two passes of modulo-11 checkdigit algorithm.
 * 
 * @param {string} code - Estonian personal identification code(isikukood).
 * @returns {Number} The checksum.
 */
 export function calculateChecksum(code: string) {
    code = code.toString();
    if(code.length < 10) throw new Error(`Expected input length of at least 10, got ${code.length}`);
    const data = code.slice(0, 10);
    
    const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
    const weights2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];

    // weights1
    let sum = 0;
    for(let i = 0; i < data.length; i++) {
        sum += parseInt(data[i]) * weights1[i];
    }
    const modulo1 = sum % 11;
    if(modulo1 < 10 || isNaN(modulo1))
        return modulo1;

    // weights2
    sum = 0;
    for(let i = 0; i < data.length; i++) {
        sum += parseInt(data[i]) * weights2[i];
    }
    const modulo2 = sum % 11;
    return modulo2 < 10 ? modulo2 : 0;
}

export function determineHospital(id: number, date: Date) {
    const hospitalStartDate = new Date("1989-10-12");
    const hospitalEndDate = new Date("2013-01-01");

    if(date > hospitalStartDate && date < hospitalEndDate) {
        let location: string;
        let order: number;

        if(id >= 1 && id <= 10) {
            location = "Kuressaare haigla";
            order = id - 0;
        } else if(id <= 19) {
            location = "Tartu Ülikooli Naistekliinik";
            order = id - 10;
        } else if(id >= 21 && id <= 150) {
            location = "Ida-Tallinna keskhaigla, Pelgulinna sünnitusmaja";
            order = id - 20;
        } else if(id <= 160) {
            location = "Keila haigla";
            order = id - 150;
        } else if(id <= 220) {
            location = "Rapla haigla, Loksa haigla, Hiiumaa haigla";
            order = id - 160;
        } else if(id <= 270) {
            location = "Ida-Viru keskhaigla";
            order = id - 220;
        } else if(id <= 370) {
            location = "Maarjamõisa kliinikum (Tartu), Jõgeva haigla";
            order = id - 270;
        } else if(id <= 420) {
            location = "Narva haigla";
            order = id - 370;
        } else if(id <= 470) {
            location = "Pärnu haigla";
            order = id - 420;
        } else if(id <= 490) {
            location = "Haapsalu haigla";
            order = id - 470;
        } else if(id <= 520) {
            location = "Järvamaa haigla";
            order = id - 490;
        } else if(id <= 570) {
            location = "Rakvere haigla, Tapa haigla";
            order = id - 520;
        } else if(id <= 600) {
            location = "Valga haigla";
            order = id - 570;
        } else if(id <= 650) {
            location = "Viljandi haigla";
            order = id - 600;
        } else if(id <= 700) {
            location = "Lõuna-Eesti haigla (Võru), Põlva haigla";
            order = id - 650;
        } else {
            location = "Välismaa";
            order = id - 700;
        }
        return { location, order };
    }
    return null;
}

// export function intOrNaN(str: string, len = 0) {
//     return isNaN(str.replaceAll(".", "") as any) || (len && str.length !== len) ? NaN : parseInt(str, 10);
// }

export function isNumeric(str: string) {
    for(let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        // 47 is one charcode before "0" and 58 is one after "9"
        if(c < 47 || c > 58) 
            return false;
    }
    return !!str.length; // empty string cant be numeric
}

// isNaN() is not used here because it accepts ".", which is not acceptable here.
export function intOrNaN(str: string, len = 0) {
    return isNumeric(str) && (len === 0 || str.length === len) ? parseInt(str, 10) : NaN;
}

export function removeFromEnd(str: string, char: string) {
    let lastIndex = str.length;
    for(let i = lastIndex - 1; i >= 0; i--) {
        if(str[i] !== char) break;
        lastIndex = i;
    }
    return str.slice(0, lastIndex);
}

export function hasLeapYears(year: MinMax & ActualNumber) {
    const { min, max, actual } = year;
    if(isInteger(actual)) return !(actual % 4);
    else if(isInteger(min) && isInteger(max)) {
        const nextLeapYear = min + 3 * (min % 4);
        return min <= nextLeapYear && max >= nextLeapYear;
    }
    throw new Error("Invalid year");
}

// no validity check
export function getMonthMaxDay(month: number, year: number) {
    return month !== 2 ? 30 + ((month || 1) % 2) : (28 + Number(!((year || 0) % 4)));
}

export const isInteger = (v: unknown): v is number => Number.isInteger(v);
export const asStrSlice = (v: any, i1: number, i2: number): string => v.toString().slice(i1, i2);