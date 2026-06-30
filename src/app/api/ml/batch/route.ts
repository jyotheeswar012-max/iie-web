import { NextResponse } from 'next/server';
export const runtime = 'edge';
const CASES=[['Barmer, RJ',0.19,46.8,28,11],['Jodhpur, RJ',0.14,47.9,18,8],['Latur, MH',0.16,47.2,27,10],['Nashik, MH',0.28,42.4,84,17],['Puri, OD',0.53,33.8,224,81],['Ludhiana, PB',0.23,40.1,68,19],['Warangal, TG',0.35,38.0,128,31],['Guntur, AP',0.44,36.5,172,44]] as [string,number,number,number,number][];
const NDVI_LLR=[[0,0.10,3.5],[0.10,0.18,2.8],[0.18,0.25,2.1],[0.25,0.30,1.5],[0.30,0.38,0.6],[0.38,1.0,-1.0]] as [number,number,number][];
const TEMP_LLR=[[47,99,2.5],[44,47,1.8],[42,44,1.0],[0,42,-0.4]] as [number,number,number][];
const RAIN_LLR=[[0,20,3.2],[20,50,2.5],[50,100,1.7],[100,150,0.8],[150,999,-1.0]] as [number,number,number][];
function lkp(t:[number,number,number][],v:number){return(t.find(([lo,hi])=>v>=lo&&v<hi)||t[t.length-1])[2];}
function score(n:number,t:number,r:number,s:number){const tot=0.4*lkp(NDVI_LLR,n)+0.25*lkp(TEMP_LLR,t)+0.25*lkp(RAIN_LLR,r)+0.1*(s<15?1.5:s<25?0.8:-0.5);return+(100/(1+Math.exp(-tot*0.55))).toFixed(1);}
export async function GET(){
  return NextResponse.json({model:'IIE-NBv1',predictions:CASES.map(([d,n,t,r,s])=>{const sc=score(n,t,r,s);return{district:d,inputs:{ndvi:n,temp_c:t,rainfall_mm:r,soil:s},risk_score:sc,risk_level:sc>=75?'CRITICAL':sc>=55?'HIGH':sc>=35?'MEDIUM':'LOW',triggered:sc>=55};})});
}
