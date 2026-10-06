// Show an honestly unsatisfiable synthetic assignment, without executing actions.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {solve} from '../src/index.mjs';

const base = JSON.parse(await readFile(new URL('./problem.json', import.meta.url), 'utf8'));
const problem = structuredClone(base);
problem.constraints.push({type: 'budget', resource: 'energy', limit: 0});
problem.constraints.push({type: 'forbid', assignments: {guard: 'wait', merchant: 'wait'}});
const result = solve(problem);
assert.equal(result.status, 'unsatisfiable');
assert.equal(result.assignment, null);
assert.equal(result.complete, true);
console.log(JSON.stringify({source: 'synthetic finite problem', ...result}, null, 2));
