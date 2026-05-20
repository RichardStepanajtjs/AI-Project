import requests


class FormPipeline:
    def __init__(self, ollama, voyage, backend_url):
        self.ollama = ollama
        self.voyage = voyage
        self.backend_url = backend_url.rstrip("/")

    def process_form(self, form_id):
        # Formulierdata ophalen
        try:
            resp = requests.get(f"{self.backend_url}/forms/{form_id}", timeout=10)
            resp.raise_for_status()
            payload = resp.json()
            form_data = payload.get("data")
            if isinstance(form_data, list):
                form_data = form_data[0] if form_data else None
        except Exception as e:
            print(f"[FormPipeline] Fout bij ophalen form {form_id}: {e}")
            return False

        if not form_data:
            print(f"[FormPipeline] Form {form_id} niet gevonden.")
            return False

        # Zoekprofiel genereren via Ollama
        description = self.ollama.genereer_zoekprofiel(form_data)
        if not description:
            print(f"[FormPipeline] Geen beschrijving gegenereerd voor form {form_id}.")
            return False

        # Embedding genereren via Voyage
        embedding = self.voyage.embed(description)
        if not embedding:
            print(f"[FormPipeline] Geen embedding gegenereerd voor form {form_id}.")
            return False

        # Form bijwerken: sla de AI-tekst op in generated_description (originele description blijft bewaard)
        try:
            put_resp = requests.put(
                f"{self.backend_url}/forms/{form_id}",
                json={"generated_description": description, "embedding": embedding},
                timeout=10,
            )
            put_resp.raise_for_status()
            print(f"[FormPipeline] Form {form_id} succesvol verwerkt.")
            return True
        except Exception as e:
            print(f"[FormPipeline] Fout bij opslaan form {form_id}: {e}")
            return False
