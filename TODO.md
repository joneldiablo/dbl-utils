# TODO

- [x] Execute `yarn test --coverage` and analyze the coverage report to identify files in `src/` with less than 80% coverage or without any tests. [COVERAGE-ANALYSIS.md](./COVERAGE-ANALYSIS.md)
- [x] Identify all files requiring additional tests based on the coverage analysis. [COVERAGE-ANALYSIS.md](./COVERAGE-ANALYSIS.md)

- [x] **Task for Agent: `src/event-handler.ts`** [src/event-handler.ts](./src/event-handler.ts), [__tests__/event-handler.test.ts](./__tests__/event-handler.test.ts)
  - Add unit tests to cover all exported functions in `src/event-handler.ts`.
  - Test edge cases and error conditions relevant to each function.
  - Expected coverage for this file: ≥ 80%.
  - Use: `yarn test event-handler`
  - Include TypeDoc comments for parameters, return types, and examples.
  - Follow Jest best practices and write all code and comments in English.

- [x] **Task for Agent: `src/extract-react-node-text.ts`** [src/extract-react-node-text.ts](./src/extract-react-node-text.ts), [__tests__/extract-react-node-text.test.ts](./__tests__/extract-react-node-text.test.ts)
  - Add unit tests to cover all exported functionality in `src/extract-react-node-text.ts`.
  - Include tests for complex tree structures and text extraction edge cases.
  - Expected coverage for this file: ≥ 80%.
  - Use: `yarn test extract-react-node-text`
  - Include TypeDoc comments for parameters, return types, and examples.
  - Follow Jest best practices and write all code and comments in English.

- [x] **Task for Agent: `src/fetch-queue.ts`** [src/fetch-queue.ts](./src/fetch-queue.ts), [__tests__/fetch-queue.test.ts](./__tests__/fetch-queue.test.ts)
  - Add unit tests to cover queueing logic, retry behavior, and error handling in `src/fetch-queue.ts`.
  - Include tests for concurrency scenarios and backoff logic.
  - Expected coverage for this file: ≥ 80%.
  - Use: `yarn test fetch-queue`
  - Include TypeDoc comments for parameters, return types, and examples.
  - Follow Jest best practices and write all code and comments in English.

- [x] **Task for Agent: `src/flat.ts`** [src/flat.ts](./src/flat.ts), [__tests__/flat.test.ts](./__tests__/flat.test.ts)
  - Add unit tests to cover array flattening and recursion logic in `src/flat.ts`.
  - Include tests for nested arrays, empty arrays, and mixed types.
  - Expected coverage for this file: ≥ 80%.
  - Use: `yarn test flat`
  - Include TypeDoc comments for parameters, return types, and examples.
  - Follow Jest best practices and write all code and comments in English.

- [ ] **Task for Agent: `src/format-value.ts`**
  - Add unit tests to cover value formatting logic in `src/format-value.ts`.
  - Include tests for various data types, locale formatting, and edge cases.
  - Expected coverage for this file: ≥ 80%.
  - Use: `yarn test format-value`
  - Include TypeDoc comments for parameters, return types, and examples.
  - Follow Jest best practices and write all code and comments in English.

- [ ] **Task for Agent: `src/i18n.ts`**
  - Add unit tests to cover translation lookup, interpolation, and fallback logic in `src/i18n.ts`.
  - Include tests for missing keys, pluralization, and default values.
  - Expected coverage for this file: ≥ 80%.
  - Use: `yarn test i18n`
  - Include TypeDoc comments for parameters, return types, and examples.
  - Follow Jest best practices and write all code and comments in English.

- [ ] **Task for Agent: `src/index.ts`**
  - Add unit tests to cover the public API surface and initialization logic in `src/index.ts`.
  - Include tests for default configurations and error conditions.
  - Expected coverage for this file: ≥ 80%.
  - Use: `yarn test index`
  - Include TypeDoc comments for parameters, return types, and examples.
  - Follow Jest best practices and write all code and comments in English.

- [ ] **Task for Agent: `src/object-mutation.ts`**
  - Add unit tests to cover deep cloning, merge behavior, and mutation prevention logic in `src/object-mutation.ts`.
  - Include tests for circular references and immutability cases.
  - Expected coverage for this file: ≥ 80%.
  - Use: `yarn test object-mutation`
  - Include TypeDoc comments for parameters, return types, and examples.
  - Follow Jest best practices and write all code and comments in English.

- [ ] **Task for Agent: `src/purge-css.ts`**
  - Add unit tests to cover CSS purging logic, pattern matching, and safelist functionality in `src/purge-css.ts`.
  - Include tests for edge cases and integration with HTML/JSX input.
  - Expected coverage for this file: ≥ 80%.
  - Use: `yarn test purge-css`
  - Include TypeDoc comments for parameters, return types, and examples.
  - Follow Jest best practices and write all code and comments in English.

- [ ] **Task for Agent: `src/purge-css-cli.ts`**
  - Add unit tests to cover CLI argument parsing, validation, and execution flow in `src/purge-css-cli.ts`.
  - Include tests for help output, error messages, and exit codes.
  - Expected coverage for this file: ≥ 80%.
  - Use: `yarn test purge-css-cli`
  - Include TypeDoc comments for parameters, return types, and examples.
  - Follow Jest best practices and write all code and comments in English.

- [ ] **Task for Agent: `src/resolve-refs.ts`**
  - Add unit tests to cover reference resolution logic in `src/resolve-refs.ts`.
  - Include tests for nested references, missing keys, and circular resolution avoidance.
  - Expected coverage for this file: ≥ 80%.
  - Use: `yarn test resolve-refs`
  - Include TypeDoc comments for parameters, return types, and examples.
  - Follow Jest best practices and write all code and comments in English.

- [ ] **Task for Agent: `src/resolve-refs-try2.ts`**
  - Add unit tests to cover alternative resolution strategies in `src/resolve-refs-try2.ts`.
  - Include tests for performance paths and error fallback.
  - Expected coverage for this file: ≥ 80%.
  - Use: `yarn test resolve-refs-try2`
  - Include TypeDoc comments for parameters, return types, and examples.
  - Follow Jest best practices and write all code and comments in English.

- [ ] **Task for Agent: `src/utils.ts`**
  - Add unit tests to cover utility functions (e.g., deep merge, type checks) in `src/utils.ts`.
  - Include tests for edge cases and invalid inputs.
  - Expected coverage for this file: ≥ 80%.
  - Use: `yarn test utils`
  - Include TypeDoc comments for parameters, return types, and examples.
  - Follow Jest best practices and write all code and comments in English.
