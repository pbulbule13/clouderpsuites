from fastapi import APIRouter, Depends, Request

from app.auth.schemas import UserResponse
from app.auth.service import AuthService
from app.dependencies import get_auth_service

router = APIRouter()


@router.post("/verify", response_model=UserResponse)
async def verify_token(
    request: Request,
    service: AuthService = Depends(get_auth_service),
):
    user = await service.ensure_user_exists(
        user_id=request.state.user_id,
        email=request.state.user_email,
        name=request.state.user_name,
    )
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        datasets_count=user.get("datasets_count", 0),
        queries_today=user.get("queries_today", 0),
    )
