import asyncio
from collections.abc import Callable
from typing import TypeVar

T = TypeVar("T")


async def run_sync(func: Callable[..., T], *args, **kwargs) -> T:
    """Run a blocking function in a thread pool to avoid event loop starvation."""
    return await asyncio.to_thread(func, *args, **kwargs)
