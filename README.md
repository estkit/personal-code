# @estkit/personal-code

A Javascript library to work with Estonian Personal Codes (isikukood).

Read about what's stored in the personal code [here](https://www.evs.ee/et/evs-585-2007).

## Features
- Encoding/decoding + validation
- Placeholders(39x1x...)
- Randomizing

## Usage
Install from npm
```sh
npm install @estkit/personal-code
```

ESM usage (**recommended**):
```javascript
import { encode, decode, randomize } from "@estkit/personal-code";
const { results, errors } = decode("39112120752");
```

CJS usage:
```javascript
const { encode, decode, randomize } = require("@estkit/personal-code");
const { results, errors } = decode("39112120752");
```

Browser script usage:
```html
<script src="personalcode.js"></script>
<script>
    const { encode, decode, randomize } = EstonianPersonalCode;
    const { results, errors } = decode("39112120752");
</script>
``` 

## Standard compliance
This library complies with [EVS 585:2007](https://www.evs.ee/et/evs-585-2007) except for one case.

According to the standard, the first number of the personal code has to be between 1-6, but this library supports 1-8.

To comply with the standard, you should check that year.max and year.actual are smaller than 2100.