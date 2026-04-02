import os
import time
import schedule
import requests
import voyageai
from datetime import datetime
from sqlalchemy import create_engine, MetaData, Table, Column, Integer, BigInteger, Text, Float, String
from sqlalchemy.dialects.postgresql import insert, ARRAY, TIMESTAMP, UUID, JSONB

# VDAB credentials
CLIENT_ID    = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
X_IBM_CLIENT_ID = os.getenv("X_IBM_CLIENT_ID")

# Voyage API credentials
VOYAGE_API_KEY  = os.getenv("VOYAGE_API_KEY")

# Database credentials
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DB_URL = (
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

metadata = MetaData()

vacatures_tabel = Table("vacancies", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("interne_referentie", UUID, unique=True, nullable=False),
    Column("vdab_referentie", BigInteger),
    Column("kbo_nummer", String(20)),
    Column("leverancier_naam", String(255)),
    Column("leverancier_type", String(100)),
    Column("postcode", Integer),
    Column("gemeente", String(50)),
    Column("land_code", String(5)),
    Column("beroepsprofiel_code", String(50)),
    Column("beroepsprofiel_label", String(255)),
    Column("vereisten", JSONB),
    Column("text", Text),
    Column("embedding", ARRAY(Float)),
    Column("created_at", TIMESTAMP(timezone=False), default=datetime.now),
)

def get_token():
    # Dit is om te controleren
    if not all([CLIENT_ID, CLIENT_SECRET, X_IBM_CLIENT_ID]):
        print("Error: Niet alle environment variables zijn aanwezig!")
        exit(1)

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
    # Helpt bij het debuggen
    token_response.raise_for_status()

    return token_response.json()["access_token"]

def get_recent_vacatures():
    access_token = get_token()

    if access_token != "":
        url = "https://api.vdab.be/services/openservices/vacatures/v4/vacatures?"

        params = {
            "aantal": 200,
            "sinds": 1,
            "sorteerveld": "PUBLICATIE_DATUM",
            "filterDubbels": "true",
            "velden": ["leverancier", "tewerkstellingsgemeente", "beroep", "competentie", "vdabreferentie"],
        }

        headers = {
            "X-IBM-Client-Id": X_IBM_CLIENT_ID,
            "Authorization": f"Bearer {access_token}",
            "accept": "application/json"
        }

        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
    return response.json().get("resultaten", [])

def embed(text):
    vo = voyageai.Client(api_key=VOYAGE_API_KEY)
    result = vo.embed(text, model="voyage-4-lite")
    return result

def add_text_to_vacatures(vacatures):
    for v in vacatures:
        gemeente = v.get("tewerkstellingsadres", {}).get("gemeente", "Onbekend")
        postcode = v.get("tewerkstellingsadres", {}).get("postcode", "Onbekend")
        functie = v.get("functie", {}).get("beroepsprofiel", {}).get("label", "Onbekend")
        vereisten = " ".join(x["label"] for x in v.get("profiel", {}).get("vereisten", [])) or "Geen"
        v["text"] = f"Functie {functie} in {gemeente} {postcode}. Vereisten: {vereisten}"
        time.sleep(0.1)
    return vacatures

def save(engine, vacatures):
    with engine.connect() as conn:
        for v in vacatures:
            row = {
                "vdab_referentie": v.get("vacatureReferentie", {}).get("vdabReferentie"),
                "interne_referentie": v.get("vacatureReferentie", {}).get("interneReferentie"),
                "kbo_nummer": v.get("leverancier", {}).get("kboNummer"),
                "leverancier_naam": v.get("leverancier", {}).get("naam"),
                "leverancier_type": v.get("leverancier", {}).get("type"),
                "postcode": v.get("tewerkstellingsadres", {}).get("postcode"),
                "gemeente": v.get("tewerkstellingsadres", {}).get("gemeente"),
                "land_code": v.get("tewerkstellingsadres", {}).get("landCode"),
                "beroepsprofiel_code": v.get("functie", {}).get("beroepsprofiel", {}).get("code"),
                "beroepsprofiel_label": v.get("functie", {}).get("beroepsprofiel", {}).get("label"),
                "vereisten": [x.get("label", "") for x in v.get("profiel", {}).get("vereisten", [])],
                "text": v.get("text"),
                "embedding": v.get("embedding")
            }

            try:
                conn.execute(
                    insert(vacatures_tabel)
                    .values(row)
                    .on_conflict_do_nothing(index_elements=["interne_referentie"])
                )
                conn.commit()
            except Exception as e:
                conn.rollback()

def run(engine):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Synchronisatie gestart...")
    vacatures = get_recent_vacatures()
    vacatures = add_text_to_vacatures(vacatures)
    save(engine, vacatures)
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {len(vacatures)} vacatures verwerkt.")


if __name__ == "__main__":
    engine = create_engine(DB_URL)
    metadata.create_all(engine)

    schedule.every().day.at("18:00").do(run, engine=engine)

    while True:
        schedule.run_pending()
        time.sleep(60)