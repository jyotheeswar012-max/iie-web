export const DISTRICTS = [
  { district:'Warangal',    state:'Telangana',   lat:17.98, lon:79.60, riskScore:82, riskLevel:'Critical', riskType:'Heatwave',  farmers:18400 },
  { district:'Barmer',      state:'Rajasthan',   lat:25.75, lon:71.39, riskScore:78, riskLevel:'Critical', riskType:'Drought',   farmers:22100 },
  { district:'Latur',       state:'Maharashtra', lat:18.40, lon:76.58, riskScore:74, riskLevel:'Critical', riskType:'Drought',   farmers:14300 },
  { district:'Puri',        state:'Odisha',      lat:19.81, lon:85.83, riskScore:68, riskLevel:'High',    riskType:'Flood',     farmers:11200 },
  { district:'Adilabad',    state:'Telangana',   lat:19.67, lon:78.53, riskScore:62, riskLevel:'High',    riskType:'Cyclone',   farmers:9800  },
  { district:'Nashik',      state:'Maharashtra', lat:19.99, lon:73.79, riskScore:55, riskLevel:'High',    riskType:'Flood',     farmers:16700 },
  { district:'Jaipur',      state:'Rajasthan',   lat:26.91, lon:75.79, riskScore:48, riskLevel:'Medium',  riskType:'Heatwave',  farmers:13500 },
  { district:'Amritsar',    state:'Punjab',      lat:31.63, lon:74.87, riskScore:38, riskLevel:'Medium',  riskType:'Flood',     farmers:10200 },
  { district:'Ludhiana',    state:'Punjab',      lat:30.90, lon:75.85, riskScore:24, riskLevel:'Low',     riskType:'Drought',   farmers:8900  },
  { district:'Bhubaneswar', state:'Odisha',      lat:20.30, lon:85.82, riskScore:31, riskLevel:'Medium',  riskType:'Cyclone',   farmers:7600  },
]

export const PAYOUTS = [
  { farmer:'Raju Patil',    district:'Barmer, RJ',      amount:48200,  trigger:'Drought',  status:'SUCCESS', minsAgo:4  },
  { farmer:'Anita Devi',    district:'Puri, OD',        amount:32800,  trigger:'Flood',    status:'SUCCESS', minsAgo:11 },
  { farmer:'Vijay Singh',   district:'Ludhiana, PB',    amount:62500,  trigger:'Drought',  status:'SUCCESS', minsAgo:18 },
  { farmer:'Meena Joshi',   district:'Latur, MH',       amount:28400,  trigger:'Heatwave', status:'SUCCESS', minsAgo:26 },
  { farmer:'Suresh Kumar',  district:'Warangal, TG',    amount:41200,  trigger:'Heatwave', status:'SUCCESS', minsAgo:33 },
  { farmer:'Kavitha Bai',   district:'Nashik, MH',      amount:19600,  trigger:'Flood',    status:'PENDING', minsAgo:41 },
  { farmer:'Ramesh Yadav',  district:'Jaipur, RJ',      amount:35700,  trigger:'Drought',  status:'SUCCESS', minsAgo:55 },
  { farmer:'Deepa Verma',   district:'Adilabad, TG',    amount:27300,  trigger:'Cyclone',  status:'SUCCESS', minsAgo:67 },
  { farmer:'Harish Bose',   district:'Amritsar, PB',    amount:51000,  trigger:'Flood',    status:'SUCCESS', minsAgo:78 },
  { farmer:'Sunita Tiwari', district:'Bhubaneswar, OD', amount:23100,  trigger:'Cyclone',  status:'FAILED',  minsAgo:92 },
]

export const ALERTS = [
  { icon:'🔴', district:'Barmer, RJ',    message:'NDVI dropped to 0.21 — Drought trigger VERIFIED',          level:'CRITICAL', minsAgo:3,  payout:'₹48.2L' },
  { icon:'🟠', district:'Puri, OD',      message:'Rainfall 187mm — approaching flood threshold (200mm)',     level:'WARNING',  minsAgo:11, payout:null },
  { icon:'🔴', district:'Latur, MH',     message:'Temp 46.2°C — Heatwave trigger ACTIVATED',                  level:'CRITICAL', minsAgo:19, payout:'₹28.4L' },
  { icon:'🟢', district:'Ludhiana, PB',  message:'Risk normalised — all parameters stable',                  level:'SAFE',     minsAgo:34, payout:'₹62.5L' },
  { icon:'🟠', district:'Adilabad, TG',  message:'Wind speed 78km/h — monitoring for cyclone',               level:'WARNING',  minsAgo:47, payout:null },
  { icon:'🟢', district:'Amritsar, PB',  message:'₹51L payout executed for 1,240 farmers successfully',       level:'SAFE',     minsAgo:62, payout:'₹51L'  },
]

export const METRICS = {
  farmersCount: 987432,
  totalPayoutsCr: 487,
  avgTimeMin: 47,
  riskZones: 17,
  policiesActive: 102400,
}

export const VOLUME_DATA = [
  { date:'Jun 12', amountCr:1.8, farmers:3800 },
  { date:'Jun 13', amountCr:2.4, farmers:5100 },
  { date:'Jun 14', amountCr:1.2, farmers:2600 },
  { date:'Jun 15', amountCr:3.1, farmers:6400 },
  { date:'Jun 16', amountCr:2.7, farmers:5700 },
  { date:'Jun 17', amountCr:0.9, farmers:1900 },
  { date:'Jun 18', amountCr:3.8, farmers:7800 },
  { date:'Jun 19', amountCr:2.2, farmers:4600 },
  { date:'Jun 20', amountCr:1.6, farmers:3300 },
  { date:'Jun 21', amountCr:2.9, farmers:6100 },
  { date:'Jun 22', amountCr:3.4, farmers:7200 },
  { date:'Jun 23', amountCr:2.1, farmers:4400 },
  { date:'Jun 24', amountCr:2.8, farmers:5900 },
  { date:'Jun 25', amountCr:2.14, farmers:4821 },
]
