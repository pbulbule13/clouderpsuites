from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from app.dependencies import get_query_service
from app.query.schemas import AskRequest, FeedbackRequest
from app.query.service import QueryService

router = APIRouter()


@router.post("/ask")
async def ask_question(
    body: AskRequest,
    request: Request,
    service: QueryService = Depends(get_query_service),
):
    user_id = request.state.user_id

    async def event_stream():
        async for event in service.process_question(
            user_id, body.dataset_id, body.question, body.conversation_id
        ):
            yield f"data: {event.to_json()}\n\n"
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
):
    user_id = request.state.user_id
    from google.cloud import firestore as fs

    db = request.app.state.firestore_client
    turn_ref = (
        db.collection("users")
        .document(user_id)
        .collection("conversations")
        .document(body.conversation_id)
        .collection("turns")
        .document(body.turn_id)
    )
    await turn_ref.update({"feedback": body.feedback})
    return {"status": "ok"}
