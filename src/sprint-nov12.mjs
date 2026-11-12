import {solve,validateProblem}from './index.mjs';
export function rankedSolutions(problem,{limit=3,maxStates=100000,signal}={}){
 const fail=()=>{throw new TypeError('Classement invalide / Invalid ranking request / Clasificación inválida');};
 if(!Number.isSafeInteger(limit)||limit<1||limit>10||!Number.isSafeInteger(maxStates)||maxStates<1||maxStates>1000000)fail();
 const current=structuredClone(validateProblem(problem)),rows=[];let explored=0,complete=true,exhausted=false;
 for(let i=0;i<limit;i++){const result=solve(current,{maxStates,signal});explored+=result.explored;
  if(!result.complete){complete=false;if(result.assignment)rows.push({...result,rank:null});break;}
  if(!result.assignment){exhausted=true;break;}
  rows.push({...result,rank:i+1});current.constraints.push({type:'forbid',assignments:result.assignment});}
 return {solutions:rows,rankingVerified:complete,searchSpaceExhausted:exhausted,totalExplored:explored,maximumTotalStates:limit*maxStates,execution:'not_executed'};
}
