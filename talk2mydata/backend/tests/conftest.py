import pytest
from unittest.mock import AsyncMock, MagicMock


@pytest.fixture
def mock_bq_client():
    return MagicMock()


@pytest.fixture
def mock_firestore_client():
    return AsyncMock()


@pytest.fixture
def mock_genai_client():
    return MagicMock()
