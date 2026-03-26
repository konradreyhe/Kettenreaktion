---
description: "When you need to verify that existing tests are real — not fake, not hollow, not silently passing while testing nothing. Trust but verify."
---

# Audit Tests for Fakes

**When to use:** When you need to verify that existing tests are real — not fake, not hollow, not silently passing while testing nothing. Trust but verify.

**Role:** You are a test auditor. Your job is to find tests that LIE. Tests that exist to inflate coverage numbers. Tests that would still pass if you deleted the feature they claim to test. Find them. Expose them. Fix them.

---

**Audit target:** $ARGUMENTS

## What Makes a Test Fake?

A fake test is one that passes WHETHER OR NOT the code works. Common patterns:

- **No assertions** — test runs code but never checks the result
- **Tautological assertions** — `expect(true).toBe(true)`, `expect(1).toEqual(1)`
- **Assert on the mock, not the behavior** — you set up a mock to return X, then assert you got X. Congratulations, you tested your mock.
- **Commented-out assertions** — the real checks are commented out, test still "passes"
- **Try-catch swallowing** — errors are caught and silently ignored, test passes regardless
- **Assertion in dead code** — assertion exists but is never reached (wrong branch, early return)
- **Over-mocked** — everything is mocked, test only proves mocks work together
- **Copy-paste with same assertion** — 10 tests that all check the same trivial thing
- **Snapshot without review** — snapshot was auto-generated and auto-accepted, nobody verified the content
- **Async tests without await** — promise fires but test exits before assertion runs

## Step 1: Inventory

Scan ALL test files in the target. For each test file, list:
- Number of test cases
- Number of assertions per test
- What is actually being asserted (behavior vs. implementation detail vs. nothing)

Flag any test with 0 assertions immediately.

## Step 2: The Mutation Test (Manual)

For each test file, pick the 3 most critical tests. For each one:

1. Read the test and the code it tests
2. Ask: **"If I deleted the function body and replaced it with `return null`, would this test fail?"**
3. Ask: **"If I introduced an off-by-one error, would this test catch it?"**
4. Ask: **"If I swapped two parameters, would this test notice?"**

If the answer to ALL THREE is "no" — the test is fake. Mark it.

## Step 3: Pattern Detection

Search for these specific anti-patterns across all test files:

- [ ] `expect(` appears 0 times in a test block
- [ ] `.toEqual(` or `.toBe(` comparing to a hardcoded value that matches a mock setup
- [ ] `catch` blocks that don't re-throw or assert
- [ ] `async` test functions that never `await` the thing they're testing
- [ ] `.toMatchSnapshot()` with no surrounding context assertions
- [ ] Tests where the describe/it name doesn't match what's actually tested
- [ ] `expect(mock).toHaveBeenCalled()` as the ONLY assertion (proves nothing about correctness)
- [ ] Tests that only check `.length` but not content
- [ ] Tests that assert on type only (`toBeDefined`, `toBeInstanceOf`) without checking value

## Step 4: Coverage vs. Confidence Audit

- [ ] Identify lines/branches with "coverage" that comes only from fake tests
- [ ] Find critical code paths that have NO real test (even if coverage report says 100%)
- [ ] Check: are error paths tested with REAL error conditions, or just mocked errors?

## Step 5: Fix or Flag

For each fake test found:

1. **If fixable** — rewrite it with real assertions that would fail if behavior broke
2. **If the test is testing the wrong thing** — delete it and write the right test
3. **If the code is untestable** — flag the CODE as the problem, not just the test

Every fixed test MUST be verified by intentionally breaking the code it covers and confirming the test fails.

## Step 6: Prevent Recurrence

Recommend one or more of:
- Mutation testing tool integration (Stryker, mutmut, cargo-mutants)
- CI rule: minimum assertions per test
- Pre-commit hook: flag tests with no assertions
- Review checklist item: "Did you verify the test fails when the code breaks?"

## Output

```
## Test Audit Report

### Summary
- Tests audited: [N]
- Fake tests found: [N]
- Tests fixed: [N]
- Tests deleted: [N]
- Tests flagged for code redesign: [N]

### Fake Tests Found
| Test File | Test Name | Fake Pattern | Action Taken |
|-----------|-----------|-------------|--------------|
| ... | ... | ... | Fixed/Deleted/Flagged |

### Most Dangerous Fakes
[Top 3 tests that gave false confidence in critical code paths]

### Recommendations
[Specific actions to prevent fake tests going forward]
```

## Success Criteria

- Every test in the codebase has at least one meaningful assertion
- No test passes when its target code is deliberately broken
- Coverage numbers reflect REAL confidence, not theater
- A prevention mechanism is in place for future tests
