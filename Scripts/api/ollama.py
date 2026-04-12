import requests
import json

class Ollama:
    def __init__(self, host, model, temperature = 0.3):
        self.host = host.rstrip("/")
        self.model = model
        self.temperature = temperature

    def build_prompt(self, data):
        beroepen  = ", ".join(data["beroepen"])  or "onbekend"
        vereisten = ", ".join(data["vereisten"]) or "geen"
        prompt = f"""Je bent een expert in arbeidsmarktanalyse.
                    Analyseer de onderstaande vacaturedata en geef een JSON terug met exact twee velden:
                    - "jobdomein": één korte sector/domein omschrijving (max 5 woorden) die het bedrijf het best beschrijft
                    - "text": een beknopt bedrijfsprofiel in het Nederlands (max 150 woorden) geschikt voor semantisch zoeken

                    Bedrijf: {data['naam']}
                    Type: {data['type']}
                    Locatie: {data['gemeente']} ({data['postcode']})
                    Openstaande functies: {beroepen}
                    Gevraagde competenties: {vereisten}

                    Geef enkel de JSON terug, geen uitleg of extra tekst."""
        return prompt

    def genereer_profiel(self, data):
        try:
            response = requests.post(
                f"{self.host}/api/generate",
                json={
                    "model": self.model,
                    "prompt": self.build_prompt(data),
                    "stream": False,
                    "options": {
                        "temperature": self.temperature,
                        "num_predict": 500,
                    },
                },
                timeout=60,
            )
            response.raise_for_status()
            raw = response.json().get("response", "").strip()

            # Sluit JSON af als Ollama dit vergeet (had het ontdekt bij het testen)
            if not raw.endswith("}"):
                raw += '"}'

            return json.loads(raw)
        except json.JSONDecodeError:
            print(f"[OllamaClient] JSON parse error, raw output: {raw}")
            return self.fallback(data)
        except Exception as e:
            print(f"[OllamaClient error]: {e}")
            return self.fallback(data)

    def fallback(self, data):
        beroepen = ", ".join(data["beroepen"]) or "onbekend"
        return {
            "jobdomein": beroepen,
            "text": (
                f"Bedrijf {data['naam']} in {data['gemeente']} {data['postcode']}. "
                f"Functies: {beroepen}."
            )
        }