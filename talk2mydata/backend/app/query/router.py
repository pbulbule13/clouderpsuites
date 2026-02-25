import asyncio
import logging

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, StreamingResponse

from app.common.exceptions import QueryLimitExceededError
from app.dependencies import get_query_service
from app.query.schemas import AskRequest, FeedbackRequest
from app.query.service import QueryService

logger = logging.getLogger(__name__)

router = APIRouter()

SSE_TIMEOUT_SECONDS = 300  # 5 minutes


@router.post("/ask")
async def ask_question(
    body: AskRequest,
    request: Request,
    service: QueryService = Depends(get_query_service),
):
    user_id = request.state.user_id

    async def event_stream():
        try:
            async with asyncio.timeout(SSE_TIMEOUT_SECONDS):
                async for event in service.process_question(
                    user_id, body.dataset_id, body.question, body.conversation_id
                ):
                    if await request.is_disconnected():
                        logger.info("Client disconnected, stopping SSE stream")
                        return
                    yield f"data: {event.to_json()}\n\n"
                yield "data: [DONE]\n\n"
        except QueryLimitExceededError:
            yield 'data: {"type": "error", "content": "Daily query limit exceeded. Please try again tomorrow."}\n\n'
            yield "data: [DONE]\n\n"
        except TimeoutError:
            logger.warning("SSE stream timed out for user %s", user_id)
            yield 'data: {"type": "error", "content": "Request timed out. Please try again."}\n\n'
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/feedback")
async def submit_feedback(
    body: FeedbackRequest,
    request: Request,
    service: QueryService = Depends(get_query_service),
):
    user_id = request.state.user_id
    await service.save_feedback(
        user_id, body.conversation_id, body.turn_id, body.feedback
    )
    return {"status": "ok"}
