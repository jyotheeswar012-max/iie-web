'use client';

const LAYERS = [
  {
    title: 'Identity Layer',
    color: '#64ffda',
    items: [
      { icon:'🆔', name:'Aadhaar eKYC OTP',     detail:'Instant biometric verification · no physical documents · DPDP compliant' },
      { icon:'📁', name:'DigiLocker Land RoR',  detail:'Khasra/Khatauni auto-fetched · verifies acreage without field visit' },
      { icon:'📱', name:'GSMA SIM Binding',     detail:'Mobile number linked to Aadhaar · OTP 2FA · SMS payout alerts' },
    ],
  },
  {
    title: 'Payments Layer',
    color: '#3fb950',
    items: [
      { icon:'💳', name:'UPI / IMPS',           detail:'Instant payout to farmer’s UPI VPA · NPCI UTR generated · < 3 seconds' },
      