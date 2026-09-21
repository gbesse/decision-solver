// Purpose: Type separate Jev preferences followed by exact constraint solving.
import type { Provider, DecisionRecord, JSONValue } from '@gbesse/decisionpacks';
import type { Problem, Result } from './index.mjs';
export function solveWithJev(problem: Problem, state: JSONValue, options?: { provider?: Provider; signal?: AbortSignal; maxStates?: number }): Promise<Result & { record: DecisionRecord | null }>;
