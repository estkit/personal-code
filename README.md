# @estkit/personal-code

A Javascript library to work with Estonian Personal Codes (isikukood).

Read about what's stored in the personal code [here](https://www.evs.ee/et/evs-585-2007).

## Features
- Encoding/decoding + validation
- Free-standing functions + class

## Usage
Install from npm
```sh
npm install @estkit/personal-code
```

ESM usage (**recommended**):
```javascript
import { parse } from "@estkit/personal-code";
const { data, errors } = parse("39112120752");
```

CJS usage:
```javascript
const { parse } = require("@estkit/personal-code");
const { data, errors } = parse("39112120752");
```

## Browser script usage
```html
<script src="personalcode.js"></script>
<script>
    const { parse } = EstonianPersonalCode;
    const { data, errors } = parse("39112120752");
</script>
``` 

## Personal code parsing algorithm

- If placeholders are on, every "x" is consumed from the end of the given field. "5xx" becomes "5", "x" becomes ""
- Every input field must be numeric or empty after the placeholder conversion and must return an error if not. Empty shall be interpreted as 0.
- Str at the end of a field name refers to its string form after placeholder conversion but before padding or integer conversion
- ```padded``` version of a variable means that if there are missing positions in a variable then those are assumed to be zeroes or nines, accordingly
### Gender
If ```code.length > 0```, then ```genderCode = code[0]```

   1. If ```genderCode in range(1, 8)```
      1. If ```genderCode % 2``` then ```gender = "male"```
      2. Else ```gender = "female"```
   2. Else if ```genderCodeStr === ""``` then ```gender = "any"```
   3. Else set ```genderAndCentury``` error
   
Else nothing is returned

### Year
If ```code.length > 1```, then ```shortYear = code[1:2]``` and ```centuryCode = code[0]```

  1. If ```centuryCodeStr === ""``` then the year is between 1800-2199
  2. Else if ```centuryCode in range(1, 8)``` and ```isNumeric(shortYearStr)```
     1. Calculate century 
        ```javascript 
        const mul = Math.floor((centuryCode + 1) / 2) - 1;
        const century = 1800 + mul * 100;
        ```
     2. Calculate ```minYear``` and ```maxYear```
        ```javascript
        const delta = 2 - shortYearStr.length;
        const minYear = (century + shortYear0Padded) || 1800;
        const maxYear = minYear + Number("9".repeat(delta));
        ```
     3. If ```delta === 0``` then return minYear as year, else return minYear and maxYear
  3. Else set ```shortYear``` error

Else nothing is returned

### Month
If ```code.length > 3```, then ```monthStr = code[3:4]```

  1. If ```monthStr === ""``` then the month is between 1-12
  2. Else if ```isNumeric(monthNr)```
     1. Calculate ```minMonth``` and ```maxMonth```
        ```javascript
        const delta = 2 - monthStr.length;
        const minMonth = month0Padded || 1;
        const maxMonth = Math.min(month9Padded, 12);
        ```
     2. If ```delta === 0``` then return minMonth as month, else return minMonth and maxMonth
  3. Else set ```month``` error

Else nothing is returned

### Day
If ```code.length > 5```, then ```dayStr = code[5:6]```

  1. If ```dayStr === ""``` then the day is between 1-TODO
  2. Else if ```isNumeric(dayNr)``` and ```!errors.month``` and ```!errors.year``` if ```monthNr === 2```
     1. Calculate ```minDay``` and ```maxDay```
        ```javascript
        const delta = 2 - dayStr.length;
        const maxMonthDay = TODO;
        const minDay = day0Padded || 1;
        const maxDay = Math.min(day9Padded, maxMonthDay);
        ```
     2. If ```delta === 0``` then return minDay as day, else return minDay and maxDay
   3. Else set ```day``` error

Else nothing is returned

### Serial
If ```code.length > 7```, then ```serialStr = code[7:9]```

  1. If ```serialStr === ""``` then the serial is between 1-999
  2. Else if ```isNumeric(serialNr)``` and ```serialStr !== "000"```
     1. Calculate ```minSerial``` and ```maxSerial```
        ```javascript
        const delta = 2 - serialStr.length;
        const minSerial = serial0Padded;
        const maxSerial = serial9Padded;
        ```
     2. If ```delta === 0``` then return minSerial as serial, else return minSerial and maxSerial
  3. Else set ```serial``` error

Else nothing is returned

### Checksum
If ```code.length > 10```, then ```checksumStr = code[10]```

  1. idk

## Standard compliance
This library complies with [EVS 585:2007](https://www.evs.ee/et/evs-585-2007) except for one case.

According to the standard, the first number of the personal code has to be between 1-6, but this library supports 1-8.

To comply with the standard, you should check that year.max and year.actual are smaller than 2100.