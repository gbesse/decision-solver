// Purpose: Solve a fictional shared-resource problem exactly, with no external inference.
import { readFile } from 'node:fs/promises';
import { solve } from '../src/index.mjs';
console.log(JSON.stringify(solve(JSON.parse(await readFile(new URL('./problem.json', import.meta.url), 'utf8'))), null, 2));
