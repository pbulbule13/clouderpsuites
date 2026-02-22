from google import genai


def get_genai_client(api_key: str) -> genai.Client:
    return genai.Client(api_key=api_key)
