import { getMonthMaxDay } from "./utils";

export function isValidSerial(serial: number) {
    return serial > 0 && serial <= 999;
}
export function isValidMonth(month: number) {
    return month > 0 && month < 13;
}
export function isValidShortYear(year: number) {
    return year >= 0 && year <= 99;
}
export function isValidYear(year: number) {
    return year > 1799 && year < 2200;
}
export function isValidDay(day: number, month: number, year: number) {
    const maxDay = getMonthMaxDay(month, year);
    return day > 0 && day <= maxDay;
}