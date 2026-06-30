import { NextResponse } from 'next/server';
export const runtime = 'edge';

const NDVI_LLR = [[0,0.10,3.5,'Bare soil/complete failure'],[0.10,0.18,2.8,'Severe vegetation loss'],[0.18,0.25,2.1,'Significant drought stress'],[0.25,0.30,1.5,'Moderate drought stress'],[0.30,0.38,0.6,'Mild stress'],[0.38,0.50,-0.5,'Normal vegetation'],[0.50,1.0,-1.8,'Dense healthy vegetation']] as [number,number,number,string][];
const TEMP_LLR = [[47,99,2.5,'Fatal heat'],[46,47,2.1,'Extreme heat'],[44,46,1.6,'Severe heat'],[42,44,1.0,'Heat stress'],[38,42,0.2,'Above normal'],[0,38,-0.4,'Normal']] as [number,number,number,string][];
const RAIN_LLR = [[0,20,3.2,'Near-zero rainfall'],[20,50,2.5,'Severe deficit'],[50,100,1.7,'Significant deficit'],[100,150,0.8,'Below normal'],[150,210,-0.3,'Near-normal'],[210,999,-1.5,'Adequate']] as [number,number,number,string][];
const SOIL_LLR = [[0,10,2.0,'Critical-wilting'],[10,15,1.5,'Critical'],[15,25,1.0,'Low'],[25,35,0.2,'Below optimal'],[35,99,-0.8,'Adequate']] as [number,number,number,string][];

function lookup(table: [number,number,number,string][], v: number){ return table.find(([lo,hi])=>v>=lo&&v<hi) || table[table.length-1]; }

export async function POST(req: Request) {
  const b = await req.json().catch(()=>({}));
  const ndvi = +b.ndvi||0.30, temp = +b.temp_c||40, rain = +b.rainfall_mm||100, soil = +b.soil_moisture_pct||20;
  const [,, nL, nLbl]=lookup(NDVI_LLR,ndvi), [,,tL,tLbl]=lookup(TEMP_LLR,temp), [,,rL,rLbl]=lookup(RAIN_LLR,rain), [,,sL,sLbl]=lookup(SOIL_LLR,soil);
  const total = 0.40*nL + 0.25*tL + 0.25*rL + 0.10*sL;
  const score = +(100/(1+Math.exp(-total*0.55))).toFixed(1);
  const level = score>=75?'CRITICAL':score>=55?'HIGH':score>=35?'MEDIUM':'LOW';
  const flags = [...(ndvi<0.30?[`⚠️ NDVI drought flag: ${ndvi}<0.30 (FAO)`]:[]),...(temp>44?[`⚠️ Heatwave: ${temp}°C>44°C (IMD)`]:[]),...(rain<50?[`⚠️ Rainfall deficit: ${rain}mm<50mm (ISRO MNCFC)`]:[]),...(soil<15?[`⚠️ Soil critical: ${soil}%<15% wilting (ICAR)`]:[])];
  return NextResponse.json({
    district: b.district||'Unknown', risk_score: score, risk_level: level,
    triggered: score>=55, confidence_pct: Math.min(+(score*1.04).toFixed(1),99.9),
    log_likelihoods: { ndvi:{llr:+nL.toFixed(2),weight:'40%',label:nLbl}, temp:{llr:+tL.toFixed(2),weight:'25%',label:tLbl}, rainfall:{llr:+rL.toFixed(2),weight:'25%',label:rLbl}, soil:{llr:+sL.toFixed(2),weight:'10%',label:sLbl} },
    total_llr: +total.toFixed(3), flags, model:'IIE-NBv1 (NaiveBayes LLR, FAO/ISRO/ICAR)',
    recommendation: score>=55?'AUTO-PAYOUT TRIGGERED':'MONITORING — below trigger',
  });
}
