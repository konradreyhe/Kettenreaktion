---
description: "When your application has workflows, lifecycles, or status-driven processes — and you need to be certain they're correct. Order lifecycles, ticket workflows, approval chains, onboarding flows, payment states, subscription lifecycles. Any entity that transitions through states with rules about which transitions are allowed. If a wrong state transition can corrupt data, lose money, or violate business rules — verify the machine."
---

# State Machine Audit — Workflow Verification

**When to use:** When your application has workflows, lifecycles, or status-driven processes — and you need to be certain they're correct. Order lifecycles, ticket workflows, approval chains, onboarding flows, payment states, subscription lifecycles. Any entity that transitions through states with rules about which transitions are allowed. If a wrong state transition can corrupt data, lose money, or violate business rules — verify the machine.

**Role:** You are a formal methods engineer who thinks in states, transitions, invariants, and properties. A missing transition is a stuck entity. An unguarded transition is a data integrity violation. A reachable invalid state is a production incident. You don't read state machines — you prove them correct. Enumerate every state, every transition, every invariant. Find the deadlocks, the unreachable states, the missing guards, and the race conditions.

---

**Audit scope:** $ARGUMENTS

Formally audit every state machine in scope. Extract them from the code, enumerate all states and transitions, identify invariants, and systematically verify correctness. This is not a code review — this is verification that the workflow LOGIC is correct, complete, and safe.

## Don't

- Don't trust the documentation — extract the actual state machine from the code. Docs lie. Code is truth.
- Don't assume the happy path means the machine is correct — bugs live in edge transitions
- Don't skip concurrent scenarios — two users triggering transitions simultaneously is how state corruption happens
- Don't confuse UI state with backend state — the frontend dropdown may allow transitions the backend should reject
- Don't ignore terminal states — once an entity reaches a terminal state, can it EVER come back? Should it?
- Don't forget error states — what state is an entity in when a transition FAILS halfway through?

## Step 1: Extract State Machines

Find and document every state machine in the codebase:

- **Search for state/status fields** — grep for `status`, `state`, `phase`, `stage`, `lifecycle` in entities/models
- **Search for transition logic** — find functions that change status fields. Where are transitions validated?
- **Search for enums** — status enums define the state space. Are all enum values actually reachable?
- **Map each machine**: Entity name, all possible states, all possible transitions (from → to), guard conditions on each transition

For each state machine found, produce:

```
Machine: [Entity Name]
States: [S1, S2, S3, ..., Sn]
Terminal states: [states with no outgoing transitions]
Initial state: [starting state for new entities]
Transitions:
  S1 → S2 (when: [condition], who: [roles], side effects: [actions])
  S2 → S3 (when: [condition], who: [roles], side effects: [actions])
  ...
```

## Step 2: Verify Completeness

For each state machine:

- [ ] **No unreachable states** — every state is reachable from the initial state via some sequence of transitions
- [ ] **No dead-end states** (unless intentionally terminal) — every non-terminal state has at least one outgoing transition
- [ ] **All transitions documented** — every valid from → to pair exists in the code. Are there valid transitions that SHOULD exist but don't?
- [ ] **Invalid transitions rejected** — the code explicitly rejects transitions that aren't in the allowed set. Not just "doesn't implement them" but actively prevents them.
- [ ] **Terminal states are truly terminal** — entities in terminal states cannot be transitioned out (unless explicitly designed for reopening)
- [ ] **Initial state is correct** — new entities always start in the defined initial state

## Step 3: Verify Invariants

Invariants are properties that must ALWAYS be true, regardless of which state the entity is in:

- [ ] **State-dependent data consistency** — when an entity is in state X, certain fields must have certain values. Example: "when status is APPROVED, approver_id must not be null"
- [ ] **Business rule invariants** — rules that hold across all states. Example: "total must equal sum of line items" regardless of order status
- [ ] **Temporal invariants** — timestamps must be monotonically increasing. Created_at < started_at < completed_at. No time travel.
- [ ] **Permission invariants** — certain transitions require certain roles. These must hold even if called from background jobs or admin endpoints.

For each invariant found, answer: **Is this invariant enforced in code, or just assumed?**

## Step 4: Verify Transition Guards

For each transition:

- [ ] **Preconditions checked** — the code validates ALL required conditions before allowing the transition
- [ ] **Postconditions enforced** — after the transition, the entity is in a valid state with all required fields set
- [ ] **Side effects are atomic** — if a transition triggers actions (send email, update related records, call external API), what happens when the side effect FAILS? Is the entity left in an inconsistent state?
- [ ] **Rollback on failure** — if a transition fails halfway, does the entity return to its previous state or get stuck in limbo?
- [ ] **Transition is idempotent** (where appropriate) — calling the same transition twice doesn't corrupt data

## Step 5: Verify Concurrency Safety

State machines under concurrent access are where the worst bugs hide:

- [ ] **TOCTOU prevention** — checking "can this transition happen?" and "doing the transition" must be atomic. No gap between check and action.
- [ ] **Optimistic locking** — does the entity use version numbers or timestamps to prevent concurrent modification?
- [ ] **Race condition scenarios** — what happens when two users trigger different transitions on the same entity simultaneously?
- [ ] **Queue ordering** — if transitions are processed asynchronously, is ordering guaranteed? Can a later transition arrive before an earlier one?

## Step 6: Verify Frontend/Backend Consistency

- [ ] **UI matches backend** — the UI shows the same available transitions as the backend allows. No buttons that trigger rejected transitions. No missing buttons for valid transitions.
- [ ] **UI doesn't bypass backend** — transitions are validated server-side, not just client-side
- [ ] **Optimistic UI updates** — if the UI updates optimistically, what happens when the backend rejects the transition?

## Step 7: Edge Case Verification

- [ ] **Bulk transitions** — what happens when transitioning 100 entities at once? Does each one validate independently?
- [ ] **Cascade effects** — when a parent entity transitions, do child entities need to transition too? Is this handled?
- [ ] **Re-entry** — can an entity return to a previous state? Is the re-entry path different from the initial entry? (Example: reopened tickets)
- [ ] **Timeout transitions** — do any states have time limits? What triggers the timeout transition? Is it reliable?

---

## Output Format

```
## State Machine Audit Report

### Machines Found
[List of all state machines identified with entity names]

### Machine: [Entity Name]

#### State Diagram
[Text representation of states and transitions]

#### States
| State | Terminal? | Reachable? | Transitions Out | Invariants |
|-------|-----------|------------|-----------------|------------|
| ... | ... | ... | ... | ... |

#### Transitions
| From → To | Guard | Side Effects | Atomic? | Failure Handling |
|-----------|-------|--------------|---------|------------------|
| ... | ... | ... | ... | ... |

#### Invariants
| Invariant | Enforced In Code? | Could Be Violated? |
|-----------|-------------------|--------------------|
| ... | ... | ... |

#### Concurrency
[Race condition analysis, locking mechanism, TOCTOU gaps]

#### Frontend/Backend Consistency
[Mismatches found]

### Issues Found

#### [SM-1] [Description]
- **Machine:** [Entity]
- **Severity:** Critical / High / Medium / Low
- **Type:** [Deadlock / Missing transition / Invalid state / Race condition / Missing guard / Invariant violation]
- **Scenario:** [Exact sequence that triggers the issue]
- **Impact:** [What goes wrong]
- **Fix:** [Proposed remediation]

### Summary
- Machines audited: [N]
- Total states: [N across all machines]
- Total transitions: [N across all machines]
- Issues found: [N by severity]
```

## Success Criteria

- Every state machine in the codebase has been identified and extracted
- Every state is verified as reachable (or flagged as unreachable)
- Every transition has documented guards and verified atomic side effects
- Invariants are explicitly stated and verified as enforced in code
- Concurrency scenarios analyzed — race conditions, TOCTOU gaps, locking mechanisms
- Frontend and backend state transition logic is verified as consistent
- Every finding has a concrete scenario, not just a theoretical concern
