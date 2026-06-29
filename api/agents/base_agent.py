"""
BaseAgent — Abstract contract for all IIE agents.
Every agent receives a shared context dict, enriches it, and returns it.
This enables a sequential pipeline where agents chain their outputs.
"""

from abc import ABC, abstractmethod
from typing import Any
from datetime import datetime, timezone


class BaseAgent(ABC):
    name: str = "BaseAgent"
    version: str = "1.0.0"

    @abstractmethod
    async def run(self, context: dict) -> dict:
        """
        Process the shared context and return an enriched version.
        Must add a key named after the agent (snake_case) with its output.
        Must add 'agent_<name>_status': 'ok' | 'error' | 'skipped'
        """
        ...

    def _timestamp(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _log(self, msg: str):
        print(f"[{self._timestamp()}] [{self.name}] {msg}")
