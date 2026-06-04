"""In-process pub/sub broadcaster for Server-Sent Events (live updates).

Connections subscribe with their user id. Events can be published to *all*
connected clients (e.g. the catalog changed) or to a specific set of user ids
(e.g. a notification for one person, or both parties of a transaction).

This is intentionally dependency-free and runs inside a single uvicorn worker.
For multi-worker / horizontal scaling, swap `_publish` for a Redis pub/sub
fan-out — the public API (`subscribe`, `publish`, `publish_to`) stays the same.
"""
import asyncio
from typing import Iterable, Optional


class Broadcaster:
    def __init__(self) -> None:
        self._subscribers = {}
        self._lock = asyncio.Lock()

    async def subscribe(self, user_id: str) -> asyncio.Queue:
        q = asyncio.Queue(maxsize=100)
        async with self._lock:
            self._subscribers.setdefault(user_id, set()).add(q)
        return q

    async def unsubscribe(self, user_id: str, q: asyncio.Queue) -> None:
        async with self._lock:
            conns = self._subscribers.get(user_id)
            if conns:
                conns.discard(q)
                if not conns:
                    self._subscribers.pop(user_id, None)

    def _deliver(self, queues: Iterable[asyncio.Queue], event: dict) -> None:
        for q in list(queues):
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                # Drop the event for a slow/full consumer rather than blocking
                # every other client; the client will resync on reconnect.
                pass

    async def publish(self, type: str, payload: Optional[dict] = None) -> None:
        """Broadcast an event to every connected client."""
        event = {"type": type, "payload": payload or {}}
        async with self._lock:
            for conns in self._subscribers.values():
                self._deliver(conns, event)

    async def publish_to(self, user_ids: Iterable[str], type: str, payload: Optional[dict] = None) -> None:
        """Send an event only to the given user ids (deduplicated)."""
        event = {"type": type, "payload": payload or {}}
        targets = {uid for uid in user_ids if uid}
        async with self._lock:
            for uid in targets:
                conns = self._subscribers.get(uid)
                if not conns:
                    continue
                self._deliver(conns, event)


broadcaster = Broadcaster()
