"""Centralized Firestore path helpers to eliminate duplicate path construction."""

from google.cloud.firestore import AsyncClient


def user_ref(db: AsyncClient, user_id: str):
    return db.collection("users").document(user_id)


def datasets_col(db: AsyncClient, user_id: str):
    return user_ref(db, user_id).collection("datasets")


def dataset_ref(db: AsyncClient, user_id: str, dataset_id: str):
    return datasets_col(db, user_id).document(dataset_id)


def conversation_ref(db: AsyncClient, user_id: str, conv_id: str):
    return user_ref(db, user_id).collection("conversations").document(conv_id)


def turns_col(db: AsyncClient, user_id: str, conv_id: str):
    return conversation_ref(db, user_id, conv_id).collection("turns")
