import time
import requests
from datetime import datetime
from collections import defaultdict


class Pipeline:
    def __init__(self, vdab, ollama, voyage, database):
        self.vdab = vdab
        self.ollama = ollama
        self.voyage = voyage
        self.database = database

    def groepeer_per_bedrijf(self, vacatures):
        bedrijven = defaultdict(lambda: {
            "naam": None, "type": None, "gemeente": None, "postcode": None,
            "beroepen": set(), "vereisten": set(),
        })

        for v in vacatures:
            kbo = v.get("leverancier", {}).get("kboNummer")
            if not kbo:
                continue
            b = bedrijven[kbo]
            b["naam"] = b["naam"] or v.get("leverancier", {}).get("naam")
            b["type"] = b["type"] or v.get("leverancier", {}).get("type")
            b["gemeente"] = b["gemeente"] or v.get("tewerkstellingsadres", {}).get("gemeente")
            b["postcode"] = b["postcode"] or v.get("tewerkstellingsadres", {}).get("postcode")

            functie = v.get("functie", {}).get("beroepsprofiel", {}).get("label")
            if functie:
                b["beroepen"].add(functie)

            for vereiste in v.get("profiel", {}).get("vereisten", []):
                if label := vereiste.get("label"):
                    b["vereisten"].add(label)

        for b in bedrijven.values():
            b["beroepen"] = sorted(b["beroepen"])
            b["vereisten"] = sorted(b["vereisten"])

        return dict(bedrijven)

    def fetch_kbo_data(self, kbo_nummer):
        try:
            resp = requests.get(
                f"{self.database.base_url}/kbo-companies/{kbo_nummer}",
                timeout=10,
            )
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json().get("data")
        except Exception as e:
            print(f"[Pipeline] KBO lookup failed for {kbo_nummer}: {e}")
            return None

    def verwerk_bedrijven(self, bedrijven):
        self.ollama.warmup()
        count = 0
        for kbo, data in bedrijven.items():
            print(f"Processing: {data['naam']} ({kbo})")

            kbo_data = self.fetch_kbo_data(kbo)

            result = self.ollama.genereer_profiel(data, kbo_data=kbo_data)
            embedding = self.voyage.embed(result["text"])

            # no embedding means the company can't be matched, skip saving it
            if embedding is None:
                print(f"Skipped (no embedding): {data['naam']}")
                continue

            profiel = {
                "kbo_nummer": kbo,
                "naam": data["naam"],
                "gemeente": data["gemeente"] or (kbo_data or {}).get("gemeente"),
                "postcode": data["postcode"] or (kbo_data or {}).get("postcode"),
                "landcode": "BE" if kbo_data else None,
                "email": (kbo_data or {}).get("email") or None,
                "telefoonnummer": (kbo_data or {}).get("telefoonnummer") or None,
                "beroepen": data["beroepen"],
                "vereisten": data["vereisten"],
                "text": result["text"],
                "jobdomein": result["jobdomein"],
                "technologies": result.get("technologies", []),
                "embedding": embedding,
            }
            self.database.save_profiel(profiel)
            count += 1
            time.sleep(0.2)
        return count

    def run(self):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Starting...")

        vacatures = self.vdab.get_recent_vacatures()
        self.database.save_vacatures(vacatures)
        print(f"{len(vacatures)} vacancies saved.")

        bedrijven = self.groepeer_per_bedrijf(vacatures)
        print(f"{len(bedrijven)} unique companies found.")

        count = self.verwerk_bedrijven(bedrijven)
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Done. {count} companies processed.")
