// Purpose: Type bounded finite problems and distinguish exact from external solver claims.
export interface Option { id: string; description: string; score: number; resources: Record<string, number> }
export type Assignment = Record<string, string>;
export type Constraint = { type: 'forbid'; assignments: Assignment } | { type: 'requires'; when: Assignment; then: Assignment } | { type: 'budget'; resource: string; limit: number };
export interface Problem { schemaVersion: 1; variables: { id: string; options: Option[] }[]; constraints: Constraint[] }
export interface Result { schemaVersion: 1; status: 'optimal' | 'unsatisfiable' | 'incomplete'; assignment: Assignment | null; utility: number | null; explored: number; complete: boolean; objective: 'sum_of_option_scores'; execution: 'not_executed' }
export function validateProblem(problem: unknown): Problem;
export function satisfies(problem: Problem, assignment: Assignment): boolean;
export function solve(problem: Problem, options?: { maxStates?: number; signal?: AbortSignal }): Result;
export type Backend = (problem: Problem, options: { signal: AbortSignal }) => Promise<{ assignment: Assignment }>;
export function solveWith(problem: Problem, backend: Backend, options?: { timeoutMs?: number; signal?: AbortSignal }): Promise<{ assignment: Assignment; constraintsVerified: true; optimalityVerified: false; execution: 'not_executed' }>;
