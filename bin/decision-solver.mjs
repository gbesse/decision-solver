#!/usr/bin/env node
// Purpose: Solve a finite JSON problem offline or with optional Jev preferences / a trusted backend.
import { solve, solveWith } from '../src/index.mjs';
import { readJSON, writeJSON, loadPlugin, assertNewOutput } from '../src/cli-files.mjs';
async function main() {
  const [file, output, flag, extra, ...rest] = process.argv.slice(2);
  if (!file || file === '--help') { console.log('decision-solver PROBLEM.json OUTPUT.json [--jev STATE.json | --backend PLUGIN.mjs | --max-states COUNT]'); return; }
  if (!output || rest.length || (flag && !extra)) throw new Error('Invalid arguments');
  await assertNewOutput(output);
  const problem = await readJSON(file); let result;
  if (!flag) result = solve(problem);
  else if (flag === '--max-states') result = solve(problem, { maxStates: Number(extra) });
  else if (flag === '--jev') result = await (await import('../src/jev.mjs')).solveWithJev(problem, await readJSON(extra));
  else if (flag === '--backend') result = await solveWith(problem, (await loadPlugin(extra)).solve);
  else throw new Error('Unknown flag');
  await writeJSON(output, result); console.log(JSON.stringify(result, null, 2));
}
main().catch(error => { console.error(`decision-solver: ${error.message}`); process.exitCode = 1; });
