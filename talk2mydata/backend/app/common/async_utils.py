import asyncio
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from typing import ParamSpec, TypeVar

P = ParamSpec("P")
T = TypeVar("T")

_pool = ThreadPoolExecutor(max_workers=20)


async def run_sync(func: Callable[P, T], *args: P.args, **kwargs: P.kwargs) -> T:
    """Run a blocking function in a dedicated thread pool."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(_pool, partial(func, *args, **kwargs))
