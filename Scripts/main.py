import os
import time
import schedule
import requests
from api import VDAB_api, Ollama, Voyage_api
from database import Database
from pipeline import Pipeline
from kbo import KBO

BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:3000")


def run_kbo_if_first_start():
    try:
        resp = requests.get(f"{BACKEND_URL}/kbo-companies/count", timeout=30)
        resp.raise_for_status()
        count = resp.json().get("count", 0)
    except Exception as e:
        print(f"KBO count check mislukt: {e}. KBO import overgeslagen.")
        return

    if count > 0:
        print(f"KBO data al aanwezig ({count} records). Import overgeslagen.")
        return

    print("Geen KBO data gevonden. KBO import wordt gestart...")
    try:
        kbo = KBO()
        kbo.upload_to_api(f"{BACKEND_URL}/kbo-companies/bulk")
        print("KBO import voltooid.")
    except Exception as e:
        print(f"KBO import mislukt: {e}. Opstart gaat verder.")


def main():
    run_kbo_if_first_start()

    pipeline = Pipeline(
        vdab=VDAB_api(
            client_id=os.getenv("CLIENT_ID"),
            client_secret=os.getenv("CLIENT_SECRET"),
            x_ibm_client_id=os.getenv("X_IBM_CLIENT_ID"),
        ),
        ollama=Ollama(
            host=os.getenv("OLLAMA_HOST"),
            model=os.getenv("OLLAMA_MODEL"),
        ),
        voyage=Voyage_api(
            api_key=os.getenv("VOYAGE_API_KEY"),
        ),
        database=Database(BACKEND_URL),
    )

    pipeline.run()

    schedule.every().day.at("03:00").do(pipeline.run)

    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    main()
