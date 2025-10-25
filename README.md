# dbl-utils

`dbl-utils` is a JavaScript/TypeScript utility library designed to simplify common application development tasks. This collection includes functions for event handling, queue processing, text manipulation, and date and currency formatting, among others.

[![Documentation](https://img.shields.io/badge/docs-view-green.svg)](https://joneldiablo.github.io/dbl-utils/modules.html)
[![DeepWiki Analysis](https://img.shields.io/badge/DeepWiki-analysis-blue.svg)](https://deepwiki.com/joneldiablo/dbl-utils)

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

Minimal example of the CLI logic for CSS purging:

```ts
import purgeCss from 'dbl-utils/src/purge-css';
purgeCss('styles.css', 'index.html', 'clean.css');
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

### event-handler

Decouple communication by subscribing to and dispatching custom events.

```ts
import { EventHandler } from 'dbl-utils';

const handler = new EventHandler();
handler.subscribe('ping', msg => console.log(msg), 'id'); // listen to events
await handler.dispatch('ping', 'pong'); // emit an event
handler.unsubscribe('ping', 'id'); // stop listening
```

### fetch-queue

Deduplicate concurrent HTTP calls so the same request is only made once.

```ts
import FetchQueue from 'dbl-utils/src/fetch-queue';

const queue = new FetchQueue(fetch);
const [a, b] = await Promise.all([
  queue.addRequest('https://example.com'),
  queue.addRequest('https://example.com')
]);
// a === b
```

### flat

Convert nested objects to and from dot notation.

```ts
import { flatten, unflatten } from 'dbl-utils';

flatten({ a: { b: 1 } }); // { 'a.b': 1 }
unflatten({ 'a.b': 1 }); // { a: { b: 1 } }
```

### format-value

Format numbers, dates, or dictionary entries using locale-aware helpers.

```ts
import formatValue from 'dbl-utils/src/format-value';

formatValue(1000, { format: 'currency', currency: 'USD' }); // "$1,000.00"
```

### i18n

Manage dictionaries and locale-aware formatting.

```ts
import t, { addDictionary, setLang, formatDate } from 'dbl-utils';

addDictionary({ es: { hello: 'Hola' } });
setLang('es');
t('hello'); // 'Hola'
formatDate(); // date formatted in Spanish
```

### object-mutation

Combine and transform objects without modifying the originals.

```ts
import { deepMerge, mergeWithMutation, transformJson } from 'dbl-utils';

deepMerge({}, { a: 1 }, { b: 2 }); // merge nested structures
await mergeWithMutation({ a: { b: 1 } }, { mutation: () => ({ c: 2 }) }); // async mutation
transformJson({ a: { b: 1 } }, { filter: 'a' }); // extract subset
```

### resolve-refs

Advanced reference resolution with support for global and relative references.

- **Global References**: `"$path/to/value"` - Simple reference to values in the schema
- **String Interpolation**: `"${path/to/value}"` - Embed references within strings
- **Object Templates**: `{ ref: "path/to/template", prop: "value" }` - Extend referenced objects (note: `$` is optional in `ref`)
- **Relative References**: `"$./path"` and `"${./path}"` - Reference values within the current object context
- **Template System**: Use the `"."` key to define relative references that are resolved after object merging

```ts
import resolveRefs from 'dbl-utils';

// Basic usage
const data = { values: { a: 1 } };
const obj = { num: "$values/a" };
resolveRefs(obj, data).num; // 1

// Template system with relative references
const data = {
  user: { ref: "templates/userTemplate", name: "Alice", age: 25 },
  templates: {
    userTemplate: {
      name: "Default",
      age: 0,
      ".": {
        displayName: "User: ${./name}",
        description: "${./name} is ${./age} years old"
      }
    }
  }
};

const result = resolveRefs(data);
// result.user.displayName = "User: Alice"
// result.user.description = "Alice is 25 years old"
```

### utils

#### sliceIntoChunks
Split an array into smaller arrays for batching.

```ts
import { sliceIntoChunks } from 'dbl-utils';
sliceIntoChunks([1,2,3,4],2); // [[1,2],[3,4]]
```

#### splitAndFlat
Turn a list of strings into unique tokens.

```ts
import { splitAndFlat } from 'dbl-utils';
splitAndFlat(['a b','c']); // ['a','b','c']
```

#### generateRandomColors
Generate distinct colors for visualizations.

```ts
import { generateRandomColors } from 'dbl-utils';
generateRandomColors(2); // ['#aabbcc', '#ddeeff']
```

#### evaluateColorSimilarity
Check how close colors are to each other.

```ts
import { evaluateColorSimilarity } from 'dbl-utils';
evaluateColorSimilarity(['#fff','#ffe']); // value near 1
```

#### normalize
Remove accents and lowercase text.

```ts
import { normalize } from 'dbl-utils';
normalize('á'); // 'a'
```

#### slugify
Create URL-friendly slugs.

```ts
import { slugify } from 'dbl-utils';
slugify('Hello World'); // 'hello-world'
```

#### randomS4
Produce a short hex segment.

```ts
import { randomS4 } from 'dbl-utils';
randomS4(); // '9f3b'
```

#### randomString
Generate a random alphanumeric string.

```ts
import { randomString } from 'dbl-utils';
randomString(5); // e.g., 'abcde'
```

#### timeChunks
Build time intervals between two dates.

```ts
import { timeChunks } from 'dbl-utils';
timeChunks({ from:'2020-01-01', to:'2020-01-02', step:3600 }); // [...]
```

#### delay
Pause execution for a given time.

```ts
import { delay } from 'dbl-utils';
await delay(10); // waits 10ms
```

#### hash
Generate a numeric hash.

```ts
import { hash } from 'dbl-utils';
hash('data'); // 123456789
```

#### LCG
Deterministic pseudo-random number generator.

```ts
import { LCG } from 'dbl-utils';
const gen = new LCG(123);
gen.random(); // 0.5967...
```

## Documentation

For a detailed description of each module and function, visit the [full documentation](https://joneldiablo.github.io/dbl-utils/modules.html) automatically generated with Typedoc. The documentation includes usage examples and in-depth explanations of each function.

For an in-depth analysis of the project architecture, codebase structure, and implementation details, check out the comprehensive [DeepWiki analysis](https://deepwiki.com/joneldiablo/dbl-utils).

## Testing

Run the test suite with:

```bash
npm test
```

This project uses Jest with ts-jest. New tests cover the `i18n` and `object-mutation` modules.

## Recent Changes

- **Enhanced resolve-refs module**: Added support for relative references with `$./` and `${./}` syntax
  - New template system using the `"."` key for relative references
  - Ability to create reusable templates that can be extended with different values
  - Support for references that point to other references (recursive resolution)
  - Comprehensive unit tests covering all relative reference scenarios
- Fixed handling of numeric keys in `unflatten` so arrays are reconstructed correctly.
- Added unit tests for the `i18n` and `object-mutation` modules.
- Expanded coverage with additional tests for `utils`, `format-value`, and `i18n`.

## TODO

- Move number compact formatting to the i18n module.

## Development & Testing

When developing or debugging tests, use `yarn test -- <pattern>` to run only the relevant test cases.

## License

This project is under the ISC license. See the `LICENSE` file for more details.
