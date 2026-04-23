import os
import time
import schedule
from sqlalchemy import create_engine
from api import VDAB_api, Ollama, Voyage_api
from database import Database
from pipeline import Pipeline

def main():
    engine = create_engine(
        f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )

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
        database=Database(engine),
    )

    pipeline.run()

    schedule.every().day.at("03:00").do(pipeline.run)

    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    main()