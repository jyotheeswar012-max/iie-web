# YONO-Oracle IIE — FastAPI Backend

## Run Locally
```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Interactive Docs
http://localhost:8000/docs

## Full Payout Flow (copy-paste into terminal)

### Step 1: Enroll a farmer
```bash
curl -X POST http://localhost:8000/oracle/enroll \
  -H 'Content-Type: application/json' \
  -d '{"name":"Raju Patil","aadhaar_last4":"8821","district":"Barmer","state":"Rajasthan","crop":"cotton","acreage":8,"plan":"Smart Shield"}'
```

### Step 2: Oracle verification (copy policy_id from step 1)
```bash
curl -X POST http://localhost:8000/oracle/verify \
  -H 'Content-Type: application/json' \
  -d '{"policy_id":"IIE-XXXXXXXX","event_type":"drought"}'
```

### Step 3: Execute smart contract + UPI credit
```bash
curl -X POST http://localhost:8000/contract/execute \
  -H 'Content-Type: application/json' \
  -d '{"policy_id":"IIE-XXXXXXXX"}'
```

### Step 4: Verify audit trail (tamper-evident chain)
```bash
curl http://localhost:8000/audit/trail
```

## Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /oracle/enroll | Aadhaar e-KYC + policy + smart contract deploy |
| POST | /oracle/verify | 4-agent quorum + oracle data |
| POST | /contract/execute | State machine TRIGGERED → EXECUTED + UPI credit |
| GET | /contract/{id} | Fetch contract state |
| GET | /audit/trail | Tamper-evident ledger |
| POST | /ml/predict | NDVI drought risk prediction |
| GET | /ml/batch | Batch risk for 6 districts |
| GET | /yono/transactions | All UPI transactions |
