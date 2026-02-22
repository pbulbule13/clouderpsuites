from fastapi import Request
from google import genai
from google.cloud import bigquery
from google.cloud.firestore import AsyncClient

from app.auth.service import AuthService
from app.connectors.service import ConnectorService
from app.datasets.service import DatasetService
from app.query.service import QueryService
from app.query.sql_generator import SQLGenerator
from app.query.sql_validator import SQLValidator


def get_bq_client(request: Request) -> bigquery.Client:
    return request.app.state.bq_client


def get_firestore_client(request: Request) -> AsyncClient:
    return request.app.state.firestore_client


def get_genai_client(request: Request) -> genai.Client:
    return request.app.state.genai_client


def get_auth_service(request: Request) -> AuthService:
    db = get_firestore_client(request)
    return AuthService(db)


def get_dataset_service(request: Request) -> DatasetService:
    bq = get_bq_client(request)
    db = get_firestore_client(request)
    return DatasetService(bq, db)


def get_connector_service(request: Request) -> ConnectorService:
    dataset_service = get_dataset_service(request)
    return ConnectorService(dataset_service)


def get_query_service(request: Request) -> QueryService:
    bq = get_bq_client(request)
    db = get_firestore_client(request)
    genai_client = get_genai_client(request)
    dataset_service = get_dataset_service(request)
    sql_gen = SQLGenerator(genai_client)
    validator = SQLValidator(bq)
    return QueryService(sql_gen, validator, bq, db, dataset_service)
