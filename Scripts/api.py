import requests
import os
from dotenv import load_dotenv
from pathlib import Path
import voyageai
import pandas as pd
import time

# Dit is om de environment variabelen in te laden.
env_path = load_dotenv(Path(__file__).parent / "api_keys.env")

# Environment variabelen.
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
X_IBM_CLIENT_ID = os.getenv("X_IBM_CLIENT_ID")
VOYAGE_API_KEY = os.getenv("VOYAGE_API_KEY")

def get_token_access():
    # Dit is om te controleren
    if not all([CLIENT_ID, CLIENT_SECRET, X_IBM_CLIENT_ID]):
        print("Error: Niet alle environment variables zijn aanwezig!")
        exit(1)

    # Je moet eerst een post uitvoeren voor een bearer key.
    token_url = "https://op-derden.vdab.be/isam/sps/oauth/oauth20/token"

    token_response = requests.post(
        token_url,
        data={
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "scope": "openid"
        }
    )

    # Dit zijn checks om sneller te kunnen debuggen.
    if token_response.status_code != 200:
        print("Error: Token request failed!")
        exit(1)

    token_data = token_response.json()
    if "access_token" not in token_data:
        print(f"Error: No access token in response: {token_data}")
        exit(1)

    return token_data["access_token"]

def get_recent_vacatures():
    access_token = get_token_access()

    if access_token != "":
        url = "https://api.vdab.be/services/openservices/vacatures/v4/vacatures?"

        params = {
            "aantal": 200,
            "sinds": 1,
            "sorteerveld": "WIJZIGINGS_DATUM",
            "filterDubbels": "true",
            "velden": ["leverancier", "tewerkstellingsgemeente", "beroep", "competentie", "vdabreferentie"],
        }

        headers = {
            "X-IBM-Client-Id": X_IBM_CLIENT_ID,
            "Authorization": f"Bearer {access_token}",
            "accept": "application/json"
        }

        response = requests.get(url, headers=headers, params=params)
    
    return response.json()

def embed_vacatures(vacatures):
    updated_vacatures = []
    for i in range(len(vacatures["resultaten"])):
        vacature = vacatures["resultaten"][i]
        postcode = vacature.get("tewerkstellingsadres", {}).get("postcode", "Onbekend")
        gemeente = vacature.get("tewerkstellingsadres", {}).get("gemeente", "Onbekend")
        functie = vacature.get("functie", {}).get("beroepsprofiel", {}).get("label", "Onbekend")

        text = f"Functie {functie} beschikbaar in {gemeente}, {postcode}. Vereisten: "

        vereisten = vacature.get("profiel", {}).get("vereisten", [])

        if vereisten:
            for vereiste in vereisten:
                text += vereiste["label"] + " "
        else:
            text += "Geen"
        
        vacature["text"] = text

        vo = voyageai.Client(api_key=VOYAGE_API_KEY)

        result = vo.embed(text, model="voyage-4-lite")
        vacature["embedding"] = result.embeddings
        updated_vacatures.append(vacature)
        time.sleep(0.05)

    return updated_vacatures

def save_as_csv(vacatures):
    rows = []

    for item in vacatures:
        row = {
            'interne_referentie': item.get('vacatureReferentie', {}).get('interneReferentie', 'Onbekend'),
            'vdab_referentie': item.get('vacatureReferentie', {}).get('vdabReferentie', 'Onbekend'),
            'kbo_nummer': item.get('leverancier', {}).get('kboNummer', 'Onbekend'),
            'leverancier_naam': item.get('leverancier', {}).get('naam', 'Onbekend'),
            'leverancier_type': item.get('leverancier', {}).get('type', 'Onbekend'),
            'postcode': item.get('tewerkstellingsadres', {}).get('postcode', 'Onbekend'),
            'gemeente': item.get('tewerkstellingsadres', {}).get('gemeente', 'Onbekend'),
            'land_code': item.get('tewerkstellingsadres', {}).get('landCode', 'Onbekend'),
            'beroepsprofiel_code': item.get('functie', {}).get('beroepsprofiel', {}).get('code', 'Onbekend'),
            'beroepsprofiel_label': item.get('functie', {}).get('beroepsprofiel', {}).get('label', 'Onbekend'),
            'vereisten': ', '.join([v.get('label', '') for v in item.get('profiel', {}).get('vereisten', [])]),
            'text': item.get('text', '')
        }
        
        embedding = item.get('embedding', [[]])[0]
        for i, x in enumerate(embedding):
            row[f'embedding_{i}'] = x
        
        rows.append(row)
    
    nieuwe_df = pd.DataFrame(rows)
    header = not Path("vacatures.csv").exists() # Als de bestand bestaat zal het de kolom namen niet herschrijven.
    nieuwe_df.to_csv("vacatures.csv", mode='a', index=False, header=header, encoding='utf-8')

new_vacatures = get_recent_vacatures()

embedded_vacatures = embed_vacatures(new_vacatures)

save_as_csv(embedded_vacatures)