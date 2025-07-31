# TODO

- [x] Run `yarn test --coverage` to generate the coverage report.
- [x] Analyze the coverage output and identify missing unit tests; record all untested files and code paths in `MISSING_TESTS.md`. [MISSING_TESTS.md](./MISSING_TESTS.md)
- [x] Implement Jest unit tests for each scenario listed in `MISSING_TESTS.md`, placing tests under `__tests__/` and writing all test names, comments, and messages in English. [__tests__/i18n.test.ts](./__tests__/i18n.test.ts) [__tests__/object-mutation.test.ts](./__tests__/object-mutation.test.ts)
- [x] Ensure overall test coverage reaches at least 80% after adding the missing tests. [src/i18n.ts](./src/i18n.ts) [src/object-mutation.ts](./src/object-mutation.ts) [__tests__/i18n.test.ts](./__tests__/i18n.test.ts) [__tests__/object-mutation.test.ts](./__tests__/object-mutation.test.ts)
- [x] Add TypeDoc comments with usage examples to every source file in `src/`, writing all comments in English. [src/event-handler.ts](./src/event-handler.ts) [src/extract-react-node-text.ts](./src/extract-react-node-text.ts) [src/fetch-queue.ts](./src/fetch-queue.ts) [src/flat.ts](./src/flat.ts) [src/format-value.ts](./src/format-value.ts) [src/i18n.ts](./src/i18n.ts) [src/index.ts](./src/index.ts) [src/object-mutation.ts](./src/object-mutation.ts) [src/purge-css.ts](./src/purge-css.ts) [src/purge-css-cli.ts](./src/purge-css-cli.ts) [src/resolve-refs.ts](./src/resolve-refs.ts) [src/resolve-refs-try2.ts](./src/resolve-refs-try2.ts) [src/types.d.ts](./src/types.d.ts) [src/utils.ts](./src/utils.ts)
- [x] Generate and validate the TypeDoc documentation by running `yarn typedoc` (or `npm run docs`) and ensure there are no errors. [docs](./docs)
- [x] Update all variables, inline comments, and terminal output messages across the codebase to use English exclusively. [src/flat.ts](./src/flat.ts)
- [x] When developing or debugging tests, use `yarn test -- <pattern>` to run only the relevant test cases. [README.md](./README.md)
