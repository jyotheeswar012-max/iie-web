"""
Structured JSON Logging — IIE GFF 2026

Outputs structured logs compatible with:
  - Railway.app log drains
  - Datadog / Grafana Loki
  - GCP Cloud Logging

Usage:
    from core.logging_config import get_logger
    logger = get_logger(__name__)
    logger.info("Policy enrolled", policy_id="IIE-ABC123", district="Warangal")
"""

import os
import sys
import json
import logging
from datetime import datetime, timezone

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FORMAT = os.getenv("LOG_FORMAT", "json")  # 'json' or 'text'


class JSONFormatter(logging.Formatter):
    """Formats log records as single-line JSON for structured log drains."""

    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "ts":      datetime.now(timezone.utc).isoformat(),
            "level":   record.levelname,
            "logger":  record.name,
            "msg":     record.getMessage(),
            "module":  record.module,
            "line":    record.lineno,
        }
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        # Merge any extra kwargs passed to logger.info(..., extra={...})
        for key, val in record.__dict__.items():
            if key not in ("msg", "args", "levelname", "levelno", "pathname",
                           "filename", "module", "exc_info", "exc_text",
                           "stack_info", "lineno", "funcName", "created",
                           "msecs", "relativeCreated", "thread", "threadName",
                           "processName", "process", "name", "message"):
                log_obj[key] = val
        return json.dumps(log_obj)


def configure_logging():
    root = logging.getLogger()
    root.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))

    handler = logging.StreamHandler(sys.stdout)
    if LOG_FORMAT == "json":
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))

    root.handlers.clear()
    root.addHandler(handler)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


# Auto-configure on import
configure_logging()
