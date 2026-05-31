import voyageai

class Voyage_api:
    def __init__(self, api_key, model = "voyage-4-lite"):
        self.client = voyageai.Client(api_key = api_key)
        self.model = model

    def embed(self, text):
        # empty input is rejected by the API, skip it early
        text = (text or "").strip()
        if not text:
            print("Voyage skip: empty text")
            return None

        try:
            result = self.client.embed([text], model = self.model)
            return result.embeddings[0]

        except Exception as e:
            print(f"Voyage API error: {e}")
            return None