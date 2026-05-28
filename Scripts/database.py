import requests

class Database:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def save_vacatures(self, vacatures):
        for v in vacatures:
            interne_ref = v.get("vacatureReferentie", {}).get("interneReferentie", "?")
            try:
                response = requests.post(
                    f"{self.base_url}/vacancies",
                    json=v,
                    timeout=10,
                )
                if response.status_code == 409:
                    continue
                response.raise_for_status()
            except requests.HTTPError as e:
                print(f"Error saving vacancy {interne_ref}: {e}")
            except requests.RequestException as e:
                print(f"Network error saving vacancy {interne_ref}: {e}")

    def save_profiel(self, profiel):
        payload = {
            "kbonummer": profiel["kbo_nummer"],
            "naam": profiel["naam"],
            "postcode": profiel["postcode"],
            "gemeente": profiel["gemeente"],
            "landcode": profiel.get("landcode"),
            "email": profiel.get("email"),
            "telefoonnummer": profiel.get("telefoonnummer"),
            "jobdomein": profiel["jobdomein"],
            "technologies": profiel["technologies"],
            "text": profiel["text"],
            "embedding": profiel["embedding"],
        }
        try:
            response = requests.post(
                f"{self.base_url}/companies",
                json=payload,
                timeout=10,
            )

            if response.status_code == 409:
                # company already exists, update it
                self.update_existing_company(profiel["kbo_nummer"], payload)
                return

            response.raise_for_status()
            print(f"Saved: {profiel['naam']}")

        except requests.HTTPError as e:
            print(f"[Database error (profiel) {profiel['kbo_nummer']}]: {e}")
        except requests.RequestException as e:
            print(f"[Network error (profiel) {profiel['kbo_nummer']}]: {e}")

    def update_existing_company(self, kbonummer: str, payload: dict):
        try:
            resp = requests.get(f"{self.base_url}/companies", timeout=10)
            resp.raise_for_status()
            companies = resp.json().get("data", [])

            existing = next(
                (c for c in companies if c.get("kbonummer") == kbonummer),
                None,
            )
            if existing is None:
                print(f"[Warning] conflict but company not found: {kbonummer}")
                return

            put_resp = requests.put(
                f"{self.base_url}/companies/{existing['id']}",
                json=payload,
                timeout=10,
            )
            put_resp.raise_for_status()
            print(f"Updated: {payload['naam']}")

        except requests.HTTPError as e:
            print(f"[Database error (update profiel) {kbonummer}]: {e}")
        except requests.RequestException as e:
            print(f"[Network error (update profiel) {kbonummer}]: {e}")
