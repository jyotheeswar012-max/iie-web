# Shared in-memory state across Vercel serverless functions
# In production: replace with Redis / PlanetScale / Supabase
POLICIES: dict = {}
CONTRACTS: dict = {}
AUDIT_LOG: list = []
UPI_TRANSACTIONS: list = []
