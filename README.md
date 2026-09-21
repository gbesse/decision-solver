# Decision Solver

Turn independently scored choices into a globally valid assignment under explicit finite constraints.

[![Tests](https://github.com/gbesse/decision-solver/actions/workflows/test.yml/badge.svg)](https://github.com/gbesse/decision-solver/actions/workflows/test.yml)

**Alpha · MIT · Node.js 22+ · no build required.** A bounded exact enumerator is included. Jev can supply option preferences; code enforces the declared constraints. No actions are executed.

## Try it

```sh
git clone https://github.com/gbesse/decision-solver.git
cd decision-solver
npm ci --ignore-scripts
npm run demo
node bin/decision-solver.mjs examples/problem.json /tmp/assignment.json
```

The example coordinates a guard and merchant under an energy budget: talking plus trading beats an incompatible higher-scoring attack. Results distinguish `optimal`, `unsatisfiable` and `incomplete`. A state-budget cutoff never claims optimality, even when it found a feasible assignment.

Install as a dependency with `npm install github:gbesse/decision-solver#v0.1.0`.

## API and constraints

```js
import { solve, satisfies } from '@gbesse/decision-solver';
const result = solve(problem, { maxStates: 100_000 });
if (result.assignment && satisfies(problem, result.assignment)) {
  console.log(result.status, result.assignment);
}
```

A problem has `schemaVersion: 1`, variables with finite options, and constraints. Each option has an id, description, finite score and nonnegative integer resource costs. See [the executable example](examples/problem.json).

Supported constraints:

- `budget`: summed resource usage cannot exceed a limit.
- `forbid`: a particular combination of assignments is disallowed.
- `requires`: when all antecedent assignments hold, all consequent assignments must hold.

Search maximizes the sum of option scores. Variables are limited to 32, options to 64 each, and explored states to one million. Complexity is exponential; the state budget is the operational bound. This synchronous solver does not yield to timer-based cancellation while searching; a pre-aborted signal is honored. Use an external worker/backend for larger problems.

## Jev and alternative backends

With `TYPESAFE_API_KEY` set:

```sh
node bin/decision-solver.mjs examples/problem.json /tmp/jev-assignment.json --jev my-state.json
```

`solveWithJev(problem, state, { provider, signal, maxStates })` is exported from `@gbesse/decision-solver/jev`. Each nontrivial variable becomes a choice question to pinned `jev-1.13.0`. The solver maximizes the sum of marginal option probabilities. **This is not the joint probability of the complete assignment.** Single-option variables do not require a model call.

[Backend plugins](docs/plugins.md) can connect CP-SAT or another optimizer. Their returned assignments are independently checked against an immutable copy of the original constraints; their optimality claims are not verified. No CP-SAT dependency or integration is included in this release.

## Validation and limits

`npm run typecheck`, `npm run check`, `npm test` and `npm run demo` run without a build. Tests compare small randomized problems against independent exhaustive enumeration and check hostile backends, truncation, deadlines, CLI behavior and loopback HTTP failures. There is no live Jev quality benchmark.

Declared constraints are the complete safety boundary; undeclared real-world rules cannot be inferred. CLI artifacts are private, exclusive writes. Provider calls default to a 30-second timeout; failures propagate. See [SECURITY.md](SECURITY.md).

## Where this can grow

Contributed problem suites, domain constraint schemas and optimizer adapters are the intended shared asset. Prioritize cases with a verifiable optimum and meaningful infeasibility examples over model-specific wrappers.
