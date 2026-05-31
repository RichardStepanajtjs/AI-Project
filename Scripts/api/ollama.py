import re
import time
import requests
import json

class Ollama:
    def __init__(self, host, model, temperature=0.3):
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

    def build_prompt(self, data, kbo_data=None):
        beroepen = ", ".join(data["beroepen"]) or "onbekend"
        vereisten = ", ".join(data["vereisten"]) or "geen"
        domeinen = ", ".join(self.JOBDOMEINEN)

        kbo_sectie = ""
        if kbo_data:
            oprichtingsjaar = (kbo_data.get("start_date") or "")[:4] or "onbekend"
            nace_activiteiten = kbo_data.get("nace_activiteiten") or []
            nace_sector = "; ".join(nace_activiteiten[:3]) if nace_activiteiten else "onbekend"
            rechtsvorm = kbo_data.get("juridical_form") or "onbekend"
            straat = kbo_data.get("straat") or ""
            huisnummer = kbo_data.get("huisnummer") or ""
            gemeente = kbo_data.get("gemeente") or data["gemeente"]
            postcode = kbo_data.get("postcode") or data["postcode"]
            adres_delen = [x for x in [straat, huisnummer, postcode, gemeente] if x]
            adres = " ".join(adres_delen) or gemeente
            kbo_sectie = (
                f"\nKBO Bedrijfsinfo:"
                f"\n- Sector (NACE): {nace_sector}"
                f"\n- Rechtsvorm: {rechtsvorm}"
                f"\n- Oprichtingsjaar: {oprichtingsjaar}"
                f"\n- Adres: {adres}"
            )

        if kbo_data:
            text_instructie = (
                "3 tot 4 zinnen die het bedrijf beschrijven. "
                "Zin 1-2: beschrijf het bedrijf zelf op basis van KBO-info (sector via NACE, rechtsvorm, oprichtingsjaar, locatie). "
                "Zin 3-4: beschrijf de noden van het bedrijf als werkgever (welk type kandidaat zoeken ze) "
                "en als potentiele klant (welk type diensten of oplossingen hebben ze nodig), afgeleid uit de vacaturedata. "
                "Schrijf vanuit het bedrijfsperspectief, NIET over de vacature of de kandidaat als persoon."
            )
        else:
            text_instructie = (
                "maximaal 2 zinnen die het bedrijf zelf omschrijven (wat voor bedrijf is het, in welke sector actief, wat doen ze). "
                "Schrijf NIET over de vacature, de gezochte kandidaat of de vereisten."
            )

        return f"Je bent een expert in arbeidsmarktanalyse.\nAnalyseer de onderstaande vacaturedata en geef een JSON terug met exact drie velden:\n- \"jobdomein\": kies exact één waarde uit deze lijst: {domeinen}\n- \"technologies\": een JSON-array van programmeertalen, frameworks, tools of technologieen die het bedrijf gebruikt (enkel op basis van de gevraagde competenties; lege array [] als er geen zijn)\n- \"text\": {text_instructie}\n\nBedrijf: {data['naam']}\nType: {data['type']}\nLocatie: {data['gemeente']} ({data['postcode']}){kbo_sectie}\nOpenstaande functies (enkel ter context voor de sector): {beroepen}\nGevraagde competenties (enkel ter context voor technologieen): {vereisten}\n\nGeef enkel de JSON terug, geen uitleg of extra tekst."

    def strip_fences(self, raw):
        # ollama sometimes wraps responses in ```json ... ```, this strips that away
        if raw.startswith("```"):
            lines = raw.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            raw = "\n".join(lines).strip()
        return raw

    def extract_json(self, raw):
        # try to parse it directly first
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            pass

        # try to extract the first {} block
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

            # match found but cut off, try to close it
            candidate = match.group().rstrip()
            if not candidate.endswith("}"):
                try:
                    return json.loads(candidate + '"}')
                except json.JSONDecodeError:
                    pass

        # ollama stopped mid-string, grab from { and force close
        brace_idx = raw.find('{')
        if brace_idx != -1:
            candidate = raw[brace_idx:].rstrip()
            try:
                return json.loads(candidate + '"}')
            except json.JSONDecodeError:
                pass

        return None

    def call_ollama(self, prompt, num_predict=500, timeout=180):
        return requests.post(
            f"{self.host}/api/generate",
            json={
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": self.temperature,
                    "num_predict": num_predict,
                },
            },
            timeout=timeout,
        )

    def warmup(self):
        # preload the model so the first real request doesn't hit a cold start
        try:
            self.call_ollama("ping", num_predict=1)
        except Exception as e:
            print(f"[Ollama] warmup failed (continuing): {e}")

    def genereer_profiel(self, data, kbo_data=None, max_retries=3):
        prompt = self.build_prompt(data, kbo_data)
        last_error = None

        for attempt in range(1, max_retries + 1):
            try:
                response = self.call_ollama(prompt, num_predict=500)

                # 4xx means bad request, no point retrying
                if 400 <= response.status_code < 500:
                    print(f"[Ollama] 4xx ({response.status_code}) for {data['naam']}, no retry")
                    break

                response.raise_for_status()
                raw = self.strip_fences(response.json().get("response", "").strip())
                result = self.extract_json(raw)

                if result is None:
                    print(
                        f"[Ollama] attempt {attempt}/{max_retries}, JSON parse failed for {data['naam']}. "
                        f"Raw: {raw[:200]!r}"
                    )
                    last_error = "json_parse"
                    continue

                # sometimes the model returns text as a list instead of a string
                if isinstance(result.get("text"), list):
                    result["text"] = " ".join(result["text"])

                return result

            except (requests.Timeout, requests.ConnectionError) as e:
                print(f"[Ollama] attempt {attempt}/{max_retries}, connection error for {data['naam']}: {e}")
                last_error = e
                if attempt < max_retries:
                    time.sleep(1)

            except requests.HTTPError as e:
                print(f"[Ollama] attempt {attempt}/{max_retries}, HTTP error for {data['naam']}: {e}")
                last_error = e
                if attempt < max_retries:
                    time.sleep(1)

            except Exception as e:
                print(f"[Ollama] unexpected error for {data['naam']}: {e}")
                break

        print(f"[Ollama] all retries failed for {data['naam']} (last error: {last_error}), using fallback")
        return self.fallback(data, kbo_data)

    def fallback(self, data, kbo_data=None):
        beroepen = ", ".join(data["beroepen"]) or "onbekend"
        if kbo_data:
            nace_activiteiten = kbo_data.get("nace_activiteiten") or []
            nace = "; ".join(nace_activiteiten[:2]) if nace_activiteiten else "onbekende sector"
            rechtsvorm = kbo_data.get("juridical_form") or ""
            prefix = f"{rechtsvorm} " if rechtsvorm else ""
            return {
                "jobdomein": "Dienstverlening",
                "technologies": [],
                "text": (
                    f"{data['naam']} is een {prefix}bedrijf actief in {nace}, "
                    f"gevestigd in {data['gemeente']}. "
                    f"Het bedrijf zoekt profielen voor: {beroepen}."
                ),
            }
        return {
            "jobdomein": "Dienstverlening",
            "technologies": [],
            "text": (
                f"Bedrijf {data['naam']} in {data['gemeente']} ({data['postcode']}). "
                f"Openstaande functies: {beroepen}."
            ),
        }

    def genereer_zoekprofiel(self, form_data, max_retries=3):
        # converts raw form data into a rich search text for company matching
        is_job = form_data.get("is_job", False)
        sector = form_data.get("sector") or "onbekend"
        techs = ", ".join(form_data.get("technologies") or []) or "geen"
        beschrijving = form_data.get("description") or ""

        if is_job:
            taak = (
                "De gebruiker zoekt een job of project en wil potentiele werkgevers vinden. "
                "Beschrijf het type werkgever dat bij dit profiel past: sector, typische activiteiten, "
                "welke technologieen ze gebruiken, en welk type noden ze hebben waarbij deze persoon van waarde is. "
                "Schrijf 3 tot 4 zinnen vanuit het perspectief van de gezochte werkgever, niet de kandidaat."
            )
        else:
            taak = (
                "De gebruiker heeft een product of dienst en zoekt potentiele klanten. "
                "Beschrijf het type bedrijf dat dit product typisch nodig heeft: sector, typische activiteiten, "
                "noden, technologieen die ze gebruiken, en waarvoor ze dit product zouden inzetten. "
                "Schrijf 3 tot 4 zinnen vanuit het perspectief van de gezochte klant, niet de aanbieder."
            )

        prompt = (
            f"Je bent een expert in B2B-matching en arbeidsmarktanalyse.\n"
            f"{taak}\n\n"
            f"Invoer van de gebruiker:\n"
            f"- Sector: {sector}\n"
            f"- Technologieen: {techs}\n"
            f"- Eigen omschrijving: {beschrijving}\n\n"
            f"Geef enkel een JSON terug met een veld:\n"
            f'- "description": de geherformuleerde zoektekst (3-4 zinnen)\n\n'
            f"Geen uitleg of extra tekst."
        )

        last_error = None
        for attempt in range(1, max_retries + 1):
            try:
                response = self.call_ollama(prompt, num_predict=600)

                if 400 <= response.status_code < 500:
                    print(f"[Ollama] 4xx ({response.status_code}) for search profile, no retry")
                    break

                response.raise_for_status()
                raw = self.strip_fences(response.json().get("response", "").strip())
                result = self.extract_json(raw)

                if result is None or "description" not in result:
                    print(
                        f"[Ollama] attempt {attempt}/{max_retries}, search profile parse failed. "
                        f"Raw: {raw[:200]!r}"
                    )
                    last_error = "json_parse"
                    continue

                return result["description"]

            except (requests.Timeout, requests.ConnectionError) as e:
                print(f"[Ollama] attempt {attempt}/{max_retries}, connection error for search profile: {e}")
                last_error = e
                if attempt < max_retries:
                    time.sleep(1)

            except requests.HTTPError as e:
                print(f"[Ollama] attempt {attempt}/{max_retries}, HTTP error for search profile: {e}")
                last_error = e
                if attempt < max_retries:
                    time.sleep(1)

            except Exception as e:
                print(f"[Ollama] unexpected error for search profile: {e}")
                break

        print(f"[Ollama] all retries failed for search profile (last error: {last_error}), using fallback")
        return self.fallback_zoekprofiel(form_data)

    def fallback_zoekprofiel(self, form_data):
        sector = form_data.get("sector") or "diverse sectoren"
        techs = ", ".join(form_data.get("technologies") or [])
        beschrijving = form_data.get("description") or ""
        tech_zin = f" met focus op {techs}" if techs else ""
        return f"Bedrijf actief in {sector}{tech_zin}. {beschrijving}".strip()
