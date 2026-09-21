// Purpose: Compile representative public API usage without producing build output.
import { solve, solveWith, type Problem } from '../src/index.mjs';
import { solveWithJev } from '../src/jev.mjs';
const problem: Problem = { schemaVersion: 1, variables: [{ id: 'actor', options: [{ id: 'wait', description: 'Wait', score: 1, resources: {} }] }], constraints: [] };
solve(problem);
await solveWith(problem, async () => ({ assignment: { actor: 'wait' } }));
await solveWithJev(problem, { situation: 'quiet' });
