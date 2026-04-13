import requests
import json

class Ollama:
    def __init__(self, host, model, temperature = 0.3):
        self.host = host.rstrip("/")
        self.model = model
        self.temperature = temperature

    JOBDOMEINEN = [
        "Administratie", "Aankoop", "Bouw", "Communicatie", "Creatief",
        "Dienstverlening", "Financieel", "Gezondheid", "Horeca en toerisme",
        "Human resources", "ICT", "Juridisch", "Land- en tuinbouw",
        "Logistiek en transport", "Management", "Marketing", "Onderhoud",
        "Onderwijs", "Onderzoek en ontwikkeling", "Overheid", "Techniek",
    ]

    def build_prompt(self, data):
        beroepen  = ", ".join(data["beroepen"])  or "onbekend"
        vereisten = ", ".join(data["vereisten"]) or "geen"
        domeinen  = ", ".join(self.JOBDOMEINEN)
        prompt = f"""Je bent een expert in arbeidsmarktanalyse.
                    Analyseer de onderstaande vacaturedata en geef een JSON terug met exact drie velden:
                    - "jobdomein": kies exact één waarde uit deze lijst: {domeinen}
                    - "technologies": een JSON-array van programmeertalen, frameworks, tools of technologieën die het bedrijf gebruikt (enkel op basis van de gevraagde competenties; lege array [] als er geen zijn)
                    - "text": maximaal 2 zinnen die het bedrijf zelf omschrijven (wat voor bedrijf is het, in welke sector actief, wat doen ze). Schrijf NIET over de vacature, de gezochte kandidaat of de vereisten. Gebruik enkel de bedrijfsnaam, type en locatie als basis, aangevuld met wat je kunt afleiden over de sector.

                    Bedrijf: {data['naam']}
                    Type: {data['type']}
                    Locatie: {data['gemeente']} ({data['postcode']})
                    Openstaande functies (enkel ter context voor de sector): {beroepen}
                    Gevraagde competenties (enkel ter context voor technologieën): {vereisten}

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

            # Verwijder markdown code fences die Ollama soms toevoegt
            if raw.startswith("```"):
                lines = raw.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                raw = "\n".join(lines).strip()

            # Sluit JSON af als Ollama dit vergeet (had het ontdekt bij het testen)
            if not raw.endswith("}"):
                raw += '"}'

            result = json.loads(raw)

            # Zorg dat het "text" veld altijd een string is (LLM geeft soms een array terug)
            if isinstance(result.get("text"), list):
                result["text"] = " ".join(result["text"])

            return result
        except json.JSONDecodeError:
            print(f"[OllamaClient] JSON parse error, raw output: {raw}")
            return self.fallback(data)
        except Exception as e:
            print(f"[OllamaClient error]: {e}")
            return self.fallback(data)

    def fallback(self, data):
        beroepen = ", ".join(data["beroepen"]) or "onbekend"
        return {
            "jobdomein": "Dienstverlening",
            "technologies": [],
            "text": (
                f"Bedrijf {data['naam']} in {data['gemeente']} ({data['postcode']}). "
                f"Openstaande functies: {beroepen}."
            ),
        }