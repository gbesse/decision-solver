# Plugin contracts

This document defines the version 0.1 extension interfaces and their trust boundaries.

## Backend

CLI: `--backend ./my-backend.mjs`. Export async `solve(problem, { signal })` and return `{ assignment: { variableId: optionId } }`. API: `solveWith(problem, backend, { timeoutMs, signal })`.

The backend receives a deep copy. The host validates the returned complete assignment against its private original problem. Result fields are `assignment`, `constraintsVerified: true`, `optimalityVerified: false` and `execution: "not_executed"`. A backend claiming `optimal` does not change that verification scope. Throw on infeasibility or failure; this initial plugin contract accepts feasible assignments only.

The default enumerator handles the declared finite problem. New constraint kinds require validation and execution support in the host, not arbitrary expressions embedded in JSON. Resource costs must remain nonnegative to preserve pruning correctness.

## Shared rules

Modules loaded by path are trusted executable code, not data or sandboxed extensions. All portable values must be finite acyclic JSON. Async hooks default to a 30-second deadline and receive an AbortSignal. Deadlines stop waiting; synchronous loops or effects that ignore cancellation cannot be forcibly stopped in-process. External requests need explicit network timeouts. Errors propagate to the caller; the embedding application owns administrator alerting and must not silently fabricate a successful result.

Provider injection uses `createJevProvider` from the pinned DecisionPacks dependency. Use loopback HTTP fixtures for integration tests. Do not commit provider keys, production records or personal data in contributed examples.
