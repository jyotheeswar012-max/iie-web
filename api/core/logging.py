"""
api/core/logging.py
Structured JSON trace logger → stderr (captured by Vercel runtime logs).
Each log line is a valid JSON object for log-aggregation pipelines (Datadog, CloudWatch).
"""
import json, sys, time
from api.core.utils import now_iso

_SERVICE = "iie-oracle-v4"

def _emit(level: str, event: str, **kwargs) -> None:
    record = {
        "ts":      now_iso(),
        "level":   level,
        "service": _SERVICE,
        "event":   event,
        **kwargs,
    }
    print(json.dumps(record, default=str), file=sys.stderr, flush=True)

def info(event: str, **kw):  _emit("INFO",  event, **kw)
def warn(event: str, **kw):  _emit("WARN",  event, **kw)
def error(event: str, **kw): _emit("ERROR", event, **kw)

def trace_request(method: str, path: str, key_tier: str, duration_ms: float, status: int):
    _emit("INFO", "http_request",
          method=method, path=path, key_tier=key_tier,
          duration_ms=round(duration_ms, 2), status=status)
