from fastapi import APIRouter, Depends, HTTPException, Request

from app.common.exceptions import DatasetNotFoundError
from app.datasets.schemas import DatasetListResponse, DatasetResponse
from app.datasets.service import DatasetService
from app.dependencies import get_dataset_service

router = APIRouter()


@router.get("", response_model=DatasetListResponse)
async def list_datasets(
    request: Request,
    service: DatasetService = Depends(get_dataset_service),
):
    user_id = request.state.user_id
    datasets = await service.get_user_datasets(user_id)
    return DatasetListResponse(datasets=datasets)


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(
    dataset_id: str,
    request: Request,
    service: DatasetService = Depends(get_dataset_service),
):
    user_id = request.state.user_id
    dataset = await service.get_dataset_schema(user_id, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return DatasetResponse(**dataset)


@router.delete("/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    request: Request,
    service: DatasetService = Depends(get_dataset_service),
):
    user_id = request.state.user_id
    dataset = await service.get_dataset_schema(user_id, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    await service.delete_dataset(user_id, dataset_id)
    return {"status": "deleted"}


@router.post("/{dataset_id}/refresh")
async def refresh_dataset(
    dataset_id: str,
    request: Request,
    service: DatasetService = Depends(get_dataset_service),
):
    user_id = request.state.user_id
    dataset = await service.refresh_dataset(user_id, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {"status": "refreshing", "dataset_id": dataset_id}
