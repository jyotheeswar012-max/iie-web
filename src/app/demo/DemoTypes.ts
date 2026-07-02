export type Step = 'enroll'|'verify'|'execute'|'audit'|'ml';
export type CState = 'ACTIVE'|'TRIGGERED'|'FRAUD_REVIEW'|'EXECUTED'|'REJECTED';
export type ForceState = ''|'FRAUD_REVIEW'|'REJECTED';
export type OracleSource = 'live_today'|'live_yesterday'|'cached_baseline'|'manual_override';

export interface Policy {
  policy_id:string; contract_address:string; net_premium_inr:number;
  subsidy_applied:number; coverage_inr:number; block_deployed:number;
  deploy_tx:string; message:string; upi_debit_ref:string; aadhaar_hash:string; kyc:Record<string,unknown>;
}
export interface Agent { decision:string; confidence:number; weight:string; deliberation:string[]; }
export interface OracleVar { value:number; source:OracleSource; unit:string; }
export interface VerifyResult {
  policy_id:string; district:string; event_type:string; contract_state:CState; payout_amount:number|null;
  oracle_inputs:Record<string,OracleVar>; weather_api_url:string|null; weather_api_error:string|null;
  agent_quorum:{agents:Record<string,Agent>;yes_count:number;total_agents:number;weighted_confidence:number;confidence_pct:number;quorum_met:boolean;quorum_rule:string;};
}
export interface ExecuteResult {
  success:boolean; policy_id:string; payout_inr:number; tx_hash:string;
  block_number:number; upi_ref:string; rrn:string; farmer:string;
  credited_to:string; method:string; sms_sent:string; message:string; impact:Record<string,unknown>;
  current_state?:CState; previous_state?:CState;
}
export interface AuditEntry { seq:number; ts:string; event:string; policy_id:string; hash:string; prev_hash:string; data:Record<string,unknown>; }
export interface MLResult {
  risk_score:number; risk_level:string; triggered:boolean; confidence_pct:number;
  log_likelihoods:Record<string,{llr:number;weight:string;label:string}>;
  total_llr:number; flags:string[]; model:string; recommendation:string;
}
export interface TrainMetrics {
  version:string; algorithm:string;
  metrics:{accuracy:number;precision:number;recall:number;f1:number;auc:number;train_rows:number;val_rows:number;feature_count:number;};
  feature_importance:Array<{feature:string;importance:number}>;
  confusion_matrix?:{tp:number;fp:number;tn:number;fn:number};
}
export type RawContrib    = {raw_contrib:number;pct_contrib:number;direction:string;importance:number};
export type FeatImportRow = {feature:string;importance:number};

export const CROPS     = ['paddy','cotton','wheat','soybean','groundnut','sugarcane','maize','chilli','tomato','onion'];
export const PLANS     = ['Basic Protect','Smart Shield','Full Season Pro'];
export const EVENTS    = ['drought','flood','heatwave','cyclone'];
export const DISTRICTS = ['Barmer','Puri','Latur','Warangal','Nashik','Ludhiana','Jodhpur','Adilabad'];
export const EV_COL:Record<string,string>  = {drought:'#f59e0b',flood:'#38bdf8',heatwave:'#f87171',cyclone:'#a78bfa'};
export const EV_ICO:Record<string,string>  = {drought:'☀️',flood:'🌊',heatwave:'🔥',cyclone:'🌀'};
export const ORC_ICO:Record<string,string> = {rainfall_mm:'🌧️',temp_c:'🌡️',ndvi:'🌱',soil_moisture:'💧'};
export const STATE_COL:Record<CState,string> = {ACTIVE:'#34d399',TRIGGERED:'#fbbf24',FRAUD_REVIEW:'#f97316',EXECUTED:'#4ade80',REJECTED:'#f87171'};
export const DIST_DEFAULTS:Record<string,{ndvi:number;temp_c:number;rainfall_mm:number;soil_moisture:number}> = {
  Barmer:{ndvi:0.21,temp_c:47.2,rainfall_mm:8,soil_moisture:12},
  Jodhpur:{ndvi:0.19,temp_c:48.1,rainfall_mm:6,soil_moisture:10},
  Puri:{ndvi:0.68,temp_c:34.1,rainfall_mm:218,soil_moisture:78},
  Latur:{ndvi:0.28,temp_c:46.8,rainfall_mm:22,soil_moisture:16},
  Warangal:{ndvi:0.31,temp_c:45.9,rainfall_mm:44,soil_moisture:22},
  Nashik:{ndvi:0.34,temp_c:44.2,rainfall_mm:38,soil_moisture:19},
  Ludhiana:{ndvi:0.52,temp_c:38.5,rainfall_mm:180,soil_moisture:55},
  Adilabad:{ndvi:0.29,temp_c:46.1,rainfall_mm:31,soil_moisture:18},
};
export const SRC_COL:Record<OracleSource,string>   = {live_today:'#4ade80',live_yesterday:'#fbbf24',cached_baseline:'#94a3b8',manual_override:'#a78bfa'};
export const SRC_LABEL:Record<OracleSource,string> = {live_today:'🛰️ live · today',live_yesterday:'🕐 live · yesterday',cached_baseline:'📦 baseline',manual_override:'✏️ manual'};
export const HI:Record<string,string> = {
  enroll:'किसान नामांकन',oracle:'ओरेकल जाँच',execute:'भुगतान करें',audit:'ऑडिट शृंखला',ml:'जोखिम मॉडल',
  loading:'प्रसंस्करण…',payout_done:'✅ भुगतान हो गया!',sms_label:'📱 किसान को SMS',ramesh_btn:'रमेश के रूप में नामांकित करें',
};
export const PAGE_CSS = [
  '@keyframes spin{to{transform:rotate(360deg)}}',
  '@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}',
  '@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}',
  '@keyframes confettiFall{from{transform:translateY(-20px) rotate(0deg);opacity:1}to{transform:translateY(110vh) rotate(720deg);opacity:0}}',
  '@keyframes celebrate{0%{transform:scale(1)}40%{transform:scale(1.1)}100%{transform:scale(1)}}',
  '@keyframes burstRing{from{transform:scale(0.5);opacity:0.8}to{transform:scale(2.5);opacity:0}}',
  '@keyframes fraudPulse{0%,100%{box-shadow:0 0 12px #f9731644}50%{box-shadow:0 0 32px #f97316cc}}',
  '.fi{animation:fadeIn 0.35s ease}','.cel{animation:celebrate 0.5s ease}',
  '*{box-sizing:border-box}','button,a{cursor:pointer}',
  'input,select{outline:none;font-family:inherit}',
  'input:focus,select:focus{border-color:#34d399!important;box-shadow:0 0 0 3px #34d39922}',
  '::-webkit-scrollbar{width:4px;height:4px}','::-webkit-scrollbar-track{background:#0f172a}',
  '::-webkit-scrollbar-thumb{background:#334155;border-radius:2px}',
  '@media(max-width:640px){.g2{grid-template-columns:1fr!important}.g4{grid-template-columns:1fr 1fr!important}.g3{grid-template-columns:1fr 1fr!important}}',
].join('\n');
