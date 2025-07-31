You are acting as a senior software engineer and testing lead.

Your main objective is to coordinate the creation of missing unit tests to reach at least **80% code coverage** across all files in the `src` directory.

You will follow these steps:

1. **Execute** `yarn test --coverage` and analyze the output.
2. From the coverage report, identify:
   - Files with **low coverage** (less than 80%)
   - Files that have **no tests at all**
3. For each file that requires more tests, read its content and **analyze the logic** to determine what tests are missing.
4. Generate a **task list** assigning one test file per agent. Each task should:
   - Clearly state the file to test
   - Describe the test cases that need to be written
   - Require the use of `yarn test` with filtering to test only the relevant file (e.g., `yarn test file-name`)
   - Instruct agents to write all code, comments, and output messages in **English**
   - Include TypeDoc-style comments with parameter and return type annotations, plus at least one example per function
   - Follow Jest best practices
5. Ensure the structure is clear and repeatable for all agents.

Here’s an example task for reference:

---
**Task for Agent: `src/utils/math.ts`**
- Add unit tests to cover all functions: `add`, `subtract`, `multiply`, `divide`
- Test edge cases such as zero division or negative inputs
- Expected test coverage: >= 80%
- Use: `yarn test math`
- Add TypeDoc comments to all functions with parameter types, return types, and examples

---

Repeat the structure for all files that are below the coverage threshold or missing tests entirely.

