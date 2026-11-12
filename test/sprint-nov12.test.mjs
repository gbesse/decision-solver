import test from 'node:test';import assert from 'node:assert/strict';
import {rankedSolutions}from '../src/index.mjs';const p={schemaVersion:1,variables:[{id:'x',options:[{id:'a',description:'a',score:2,resources:{}},{id:'b',description:'b',score:1,resources:{}}]}],constraints:[]};
test('distinct ranked alternatives and exact exhaustion',()=>{const x=rankedSolutions(p,{limit:3});assert.deepEqual(x.solutions.map(r=>r.assignment),[{x:'a'},{x:'b'}]);assert.equal(x.searchSpaceExhausted,true);assert.equal(x.rankingVerified,true);assert.equal(p.constraints.length,0);});
test('truncated search does not verify ranking',()=>{const x=rankedSolutions(p,{maxStates:1});assert.equal(x.rankingVerified,false);assert.equal(x.solutions.length,0);});
test('caller can bound total repeated search',()=>assert.throws(()=>rankedSolutions(p,{limit:11})));
