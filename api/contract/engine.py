"""
api/contract/engine.py
High-level contract lifecycle coordinator.
Delegates to blockchain/state_machine for execution and agents for quorum.
"""
from api.blockchain.state_machine import handle_execute, handle_contract_get, handle_contracts_all

__all__ = ["handle_execute", "handle_contract_get", "handle_contracts_all"]
