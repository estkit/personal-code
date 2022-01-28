export type IsikukoodParsed = {
    errors: IsikukoodErrors,
    results: IsikukoodResults
}

export type MinMax = { min?: number, max?: number };
export type ActualNumber = { actual?: number };
export type CodePattern = { pattern?: string };

export type DataField = MinMax & ActualNumber & CodePattern;

export type RequiredNumber = { required?: number };

export type IsikukoodData = {
    gender?: { actual: "male" | "female" | "any", pattern?: string },
    year?: DataField,
    shortYear?: DataField,
    month?: DataField,
    day?: DataField,
    serial?: DataField,
    checksum?: ActualNumber & CodePattern
}

export type IsikukoodResults = IsikukoodData & {
    code: string;
    valid: boolean;
}

export type IsikukoodErrors = {
    length?: LengthError
    genderAndCentury?: GenderAndCenturyError
    shortYear?: ShortYearError
    month?: MonthError
    day?: DayError
    serial?: SerialError
    checksum?: ChecksumError
}

export type LengthError = {
    required: 11,
    actual: number
}

export type GenderAndCenturyError = {
    min: 1,
    max: 6,
    actual: string
}

export type ShortYearError = {
    min: 0,
    max: 99,
    actual: string
}

export type MonthError = {
    min: 1,
    max: 12,
    actual: string
}

export type DayError = {
    min: 1,
    max: number,
    actual: string
}

export type SerialError = {
    min: 1,
    max: 999,
    actual: string
}

export type ChecksumError = {
    required: number,
    actual: string
} | {
    min: number,
    max: number,
    actual: string,
}

export type ParseOptions = {
    placeholders: boolean,
    checklength: boolean
}

export type ConsumeCallback = (amount: number) => string;
export type DecoderCallback = (str: string, obj: IsikukoodParsed) => void;
export type EncoderCallback = (data: IsikukoodData) => string;