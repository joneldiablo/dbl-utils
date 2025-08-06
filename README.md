# dbl-utils

`dbl-utils` is a JavaScript/TypeScript utility library designed to simplify common application development tasks. This collection includes functions for event handling, queue processing, text manipulation, and date and currency formatting, among others.

[![Documentation](https://img.shields.io/badge/docs-view-green.svg)](https://joneldiablo.github.io/dbl-utils/modules.html)

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Main Modules](#main-modules)
- [Utilities](#utilities)
- [Documentation](#documentation)
- [License](#license)

## Installation

You can install `dbl-utils` via npm:

```bash
npm install dbl-utils
```

Or using yarn:

```bash
yarn add dbl-utils
```

## Usage

Import the modules and functions in your project as needed. Below is a basic example of how to use `dbl-utils`:

```javascript
// Import individual functions
import { formatCurrency, flatten, t } from 'dbl-utils';
// Use functions
console.log(formatCurrency(1234.56)); // Example of currency formatting
console.log(flatten({ a: { b: { c: 1 } } })); // Converts a nested object into a flat object
```

Imports directly from any file to don't include all:

CommonJS use **/dist/cjs/\***

```javascript
// Import individual functions
const i18n = require('dbl-utils/dist/cjs/i18n');
// Use functions
console.log(i18n.formatCurrency(1234.56));
```

ESM use **/dist/esm/\***

```javascript
// Import individual functions
import t, { formatCurrency } from 'dbl-utils/dist/esm/i18n';
// Use functions
console.log(i18n.formatCurrency(1234.56));
```

TypeScript use **/src/\***

```javascript
// Import individual functions
import t, { formatCurrency } from 'dbl-utils/src/i18n';
// Use functions
console.log(i18n.formatCurrency(1234.56));
```

For a complete reference of all available functions, visit the [full documentation here](https://joneldiablo.github.io/dbl-utils/modules.html).

## Main Modules

Below are the main modules available in `dbl-utils`:

- [event-handler](https://github.com/joneldiablo/dbl-utils/blob/master/src/event-handler.ts)
- [fetch-queue](https://github.com/joneldiablo/dbl-utils/blob/master/src/fetch-queue.ts)
- [flat](https://github.com/joneldiablo/dbl-utils/blob/master/src/flat.ts)
- [format-value](https://github.com/joneldiablo/dbl-utils/blob/master/src/format-value.ts)
- [i18n](https://github.com/joneldiablo/dbl-utils/blob/master/src/i18n.ts)
- [object-mutation](https://github.com/joneldiablo/dbl-utils/blob/master/src/object-mutation.ts)
- [resolve-refs](https://github.com/joneldiablo/dbl-utils/blob/master/src/resolve-refs.ts)
- [utils](https://github.com/joneldiablo/dbl-utils/blob/master/src/utils.ts)

## Utilities

- **event-handler**
  - *eventHandler*
  - *EventHandler*
- **fetch-queue**
  - *FetchQueue*
- **flat**
  - *flatten*
  - *unflatten*
- **format-value**
  - *formatValue*
- **i18n**
  - *trackingTexts*
  - *getTexts*
  - *addDictionary*
  - *addFormatDate*
  - *addFormatTime*
  - *addFormatDateTime*
  - *addFormatNumber*
  - *addFormatNumberCompact*
  - *addFormatCurrency*
  - *addTasks*
  - *removeTask*
  - *setLang*
  - *getLang*
  - *formatDate*
  - *formatTime*
  - *formatDateTime*
  - *formatNumber*
  - *formatNumberCompact*
  - *formatCurrency*
  - *t*
- **object-mutation**
  - *mergeWithMutation*
  - *deepMerge*
  - *transformJson*
- **resolve-refs**
  - *resolveRefs*
- **utils**
  - *sliceIntoChunks*
  - *splitAndFlat*
  - *generateRandomColors*
  - *evaluateColorSimilarity*
  - *normalize*
  - *slugify*
  - *randomS4*
  - *randomString*
  - *timeChunks*
  - *delay*
  - *hash*
  - *LCG*

## Documentation

For a detailed description of each module and function, visit the [full documentation](https://joneldiablo.github.io/dbl-utils/modules.html) automatically generated with Typedoc. The documentation includes usage examples and in-depth explanations of each function.

## Testing

Run the test suite with:

```bash
npm test
```

This project uses Jest with ts-jest. New tests cover the `i18n` and `object-mutation` modules.

## Recent Changes

- Fixed handling of numeric keys in `unflatten` so arrays are reconstructed correctly.
- Added unit tests for the `i18n` and `object-mutation` modules.
- Expanded coverage with additional tests for `utils`, `format-value`, and `i18n`.

## TODO

- Move number compact formatting to the i18n module.

## License

This project is under the ISC license. See the `LICENSE` file for more details.
