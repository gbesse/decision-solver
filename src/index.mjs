// Purpose: Solve bounded finite decision problems with exact declared constraints and honest search status.
import { ensure, nonempty, snapshot } from './contracts.mjs';
const safeId = value => nonempty(value) && !['__proto__', 'constructor', 'prototype'].includes(value);
export function validateProblem(problem) {
  snapshot(problem);
  ensure(problem?.schemaVersion === 1 && Array.isArray(problem.variables) && problem.variables.length >= 1 && problem.variables.length <= 32 && Array.isArray(problem.constraints), 'Invalid finite problem');
  const ids = new Set();
  for (const v of problem.variables) {
    ensure(safeId(v.id) && !ids.has(v.id), 'Invalid or duplicate variable'); ids.add(v.id);
    ensure(Array.isArray(v.options) && v.options.length >= 1 && v.options.length <= 64 && new Set(v.options.map(o => o.id)).size === v.options.length, 'Invalid or duplicate options');
    for (const o of v.options) {
      ensure(safeId(o.id) && nonempty(o.description) && Number.isFinite(o.score) && Math.abs(o.score) <= 1e9, 'Invalid option');
      ensure(o.resources && typeof o.resources === 'object' && !Array.isArray(o.resources), 'Resources object required');
      for (const [key, amount] of Object.entries(o.resources)) ensure(safeId(key) && Number.isSafeInteger(amount) && amount >= 0 && amount <= 1e12, 'Resource costs must be bounded nonnegative integers');
    }
  }
  const assignments = values => {
    ensure(values && typeof values === 'object' && !Array.isArray(values) && Object.keys(values).length > 0, 'Constraint requires assignments');
    for (const [variable, option] of Object.entries(values)) ensure(problem.variables.some(v => v.id === variable && v.options.some(o => o.id === option)), 'Unknown variable or option in constraint');
  };
  for (const c of problem.constraints) {
    if (c.type === 'forbid') assignments(c.assignments);
    else if (c.type === 'requires') { assignments(c.when); assignments(c.then); }
    else if (c.type === 'budget') ensure(safeId(c.resource) && Number.isSafeInteger(c.limit) && c.limit >= 0, 'Invalid budget constraint');
    else throw new Error('Unknown constraint type');
  }
  return problem;
}
function allowed(problem, assignment) {
  const matches = values => Object.entries(values).every(([id, option]) => Object.hasOwn(assignment, id) && assignment[id] === option);
  for (const c of problem.constraints) {
    if (c.type === 'forbid' && matches(c.assignments)) return false;
    if (c.type === 'requires' && matches(c.when) && Object.entries(c.then).some(([id, option]) => Object.hasOwn(assignment, id) && assignment[id] !== option)) return false;
    if (c.type === 'budget') {
      const used = problem.variables.reduce((sum, v) => sum + (v.options.find(o => o.id === assignment[v.id])?.resources[c.resource] ?? 0), 0);
      // Nonnegative resource costs make this pruning valid for partial assignments as well.
      if (used > c.limit) return false;
    }
  }
  return true;
}
export function satisfies(problem, assignment) {
  validateProblem(problem); snapshot(assignment);
  if (!assignment || typeof assignment !== 'object' || Object.keys(assignment).length !== problem.variables.length) return false;
  if (!problem.variables.every(v => Object.hasOwn(assignment, v.id) && v.options.some(o => o.id === assignment[v.id]))) return false;
  return allowed(problem, assignment);
}
export function solve(problem, { maxStates = 100_000, signal } = {}) {
  problem = snapshot(validateProblem(problem));
  ensure(Number.isSafeInteger(maxStates) && maxStates >= 1 && maxStates <= 1_000_000, 'maxStates must be 1–1000000');
  let explored = 0, truncated = false, best = null, bestScore = -Infinity;
  const selected = {}, variables = problem.variables.map(v => ({ ...v, options: [...v.options].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)) }));
  function visit(index, score) {
    signal?.throwIfAborted();
    if (explored >= maxStates) { truncated = true; return; } explored++;
    if (!allowed(problem, selected)) return;
    if (index === variables.length) { if (score > bestScore) { bestScore = score; best = { ...selected }; } return; }
    const v = variables[index];
    for (const option of v.options) { selected[v.id] = option.id; visit(index + 1, score + option.score); delete selected[v.id]; if (truncated) break; }
  }
  visit(0, 0);
  return { schemaVersion: 1, status: truncated ? 'incomplete' : best ? 'optimal' : 'unsatisfiable', assignment: best, utility: best ? bestScore : null, explored, complete: !truncated, objective: 'sum_of_option_scores', execution: 'not_executed' };
}
export async function solveWith(problem, backend, options = {}) {
  const { bounded } = await import('./contracts.mjs');
  const safe = snapshot(validateProblem(problem));
  const result = snapshot(await bounded(signal => backend(snapshot(safe), { signal }), options));
  // Third-party optimality claims are deliberately not promoted to verified solver status.
  ensure(result.assignment && satisfies(safe, result.assignment), 'Backend returned an invalid assignment');
  return { assignment: result.assignment, constraintsVerified: true, optimalityVerified: false, execution: 'not_executed' };
}
