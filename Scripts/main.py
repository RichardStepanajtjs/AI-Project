import os
import time
import threading
import schedule
import requests
from flask import Flask, jsonify, request
from api import VDAB_api, Ollama, Voyage_api
from database import Database
from pipeline import Pipeline
from form_pipeline import FormPipeline
from kbo import KBO

BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:3000")

app = Flask(__name__)
form_pipeline: FormPipeline = None


@app.route("/health")
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/process-form", methods=["POST"])
def process_form():
    data = request.get_json() or {}
    form_id = data.get("form_id")
    if not form_id:
        return jsonify({"success": False, "message": "form_id is vereist"}), 400

    success = form_pipeline.process_form(form_id)
    if success:
        return jsonify({"success": True, "message": f"Form {form_id} succesvol verwerkt"}), 200
    return jsonify({"success": False, "message": f"Verwerking van form {form_id} mislukt"}), 500


def run_kbo_if_first_start():
    try:
        resp = requests.get(f"{BACKEND_URL}/kbo-companies/count", timeout=30)
        resp.raise_for_status()
        count = resp.json().get("count", 0)
    except Exception as e:
        print(f"KBO count check failed: {e}, skipping import")
        return

    if count > 0:
        print(f"KBO data already present ({count} records), skipping import")
        return

    print("no KBO data found, starting import")
    try:
        kbo = KBO()
        kbo.upload_to_api(f"{BACKEND_URL}/kbo-companies/bulk")
        print("KBO import done")
    except Exception as e:
        print(f"KBO import failed: {e}, continuing startup")


def main():
    global form_pipeline

    ollama = Ollama(
        host=os.getenv("OLLAMA_HOST"),
        model=os.getenv("OLLAMA_MODEL"),
    )
    voyage = Voyage_api(
        api_key=os.getenv("VOYAGE_API_KEY"),
    )

    form_pipeline = FormPipeline(ollama, voyage, BACKEND_URL)

    pipeline = Pipeline(
        vdab=VDAB_api(
            client_id=os.getenv("CLIENT_ID"),
            client_secret=os.getenv("CLIENT_SECRET"),
            x_ibm_client_id=os.getenv("X_IBM_CLIENT_ID"),
        ),
        ollama=ollama,
        voyage=voyage,
        database=Database(BACKEND_URL),
    )

    # start flask first so /process-form is available right away
    flask_thread = threading.Thread(
        target=lambda: app.run(host="0.0.0.0", port=5001, use_reloader=False),
        daemon=True,
    )
    flask_thread.start()
    print("form processing API started on port 5001")

    # run kbo import and pipeline after, these can take a while
    run_kbo_if_first_start()
    pipeline.run()

    schedule.every().day.at("03:00").do(pipeline.run)

    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    main()
