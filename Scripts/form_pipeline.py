import requests


class FormPipeline:
    def __init__(self, ollama, voyage, backend_url):
        self.ollama = ollama
        self.voyage = voyage
        self.backend_url = backend_url.rstrip("/")

    def process_form(self, form_id):
        # fetch form data
        try:
            resp = requests.get(f"{self.backend_url}/forms/{form_id}", timeout=10)
            resp.raise_for_status()
            payload = resp.json()
            form_data = payload.get("data")
            if isinstance(form_data, list):
                form_data = form_data[0] if form_data else None
        except Exception as e:
            print(f"[FormPipeline] failed to fetch form {form_id}: {e}")
            return False

        if not form_data:
            print(f"[FormPipeline] form {form_id} not found")
            return False

        # generate search profile
        description = self.ollama.genereer_zoekprofiel(form_data)
        if not description:
            print(f"[FormPipeline] no description generated for form {form_id}")
            return False

        # generate embedding
        embedding = self.voyage.embed(description)
        if not embedding:
            print(f"[FormPipeline] no embedding generated for form {form_id}")
            return False

        # save the AI text back to the form, original description stays untouched
        try:
            put_resp = requests.put(
                f"{self.backend_url}/forms/{form_id}",
                json={"generated_description": description, "embedding": embedding},
                timeout=10,
            )
            put_resp.raise_for_status()
            print(f"[FormPipeline] form {form_id} processed")
            return True
        except Exception as e:
            print(f"[FormPipeline] failed to save form {form_id}: {e}")
            return False
