export type IsikukoodParsed = {
    errors?: IsikukoodErrors,
    data?: IsikukoodData
}

export type IsikukoodData = {
    gender?: "male" | "female",
    year?: number,
    month?: number,
    day?: number,
    id?: number,
    checksum?: number
}

export type IsikukoodErrors = {
    length?: LengthError
    gender?: GenderError
    year?: YearError
    month?: MonthError
    day?: DayError
    id?: IdError
    checksum?: ChecksumError
}

export type LengthError = {
    required: 11,
    actual: number
}

export type GenderError = {
    min: 1,
    max: 9,
    actual: string
}

export type YearError = {
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

export type IdError = {
    min: 0,
    max: 999,
    actual: string
}

export type ChecksumError = {
    required: number,
    actual: string
}