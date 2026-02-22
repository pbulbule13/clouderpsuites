from google.cloud import firestore


def get_firestore_client(project: str) -> firestore.AsyncClient:
    return firestore.AsyncClient(project=project)
