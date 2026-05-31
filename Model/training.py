import time
import faiss
import pickle
import base64
from datetime import datetime
import requests
import urllib3
from preprocessing import fetch_data, format

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

backend_url = "http://backend:3000"
model_url = f"{backend_url}/models"


def wait_for_companies(poll_interval=30):
    """Wacht tot de backend minstens 1 bedrijfsprofiel heeft voor we trainen."""
    count_url = f"{backend_url}/companies/count"
    while True:
        try:
            count = requests.get(count_url, verify=False).json().get("count", 0)
        except Exception as e:
            count = 0
            print(f"Count-check mislukt: {e}")
        if count > 0:
            print(f"{count} bedrijfsprofiel(en) gevonden, start training.")
            return
        print(f"Nog geen bedrijfsprofielen, opnieuw checken over {poll_interval}s...")
        time.sleep(poll_interval)

def get_next_version_name():
    try:
        response = requests.get(model_url, verify=False)
        response.raise_for_status()
        
        response_json = response.json()
        models = response_json.get('data', []) if isinstance(response_json, dict) else response_json

        if(len(models) == 0):
            return "v1"
        
        next_num = len(models) + 1
        return f"v{next_num}"

    except Exception as e:
        fallback = datetime.now().strftime("v%Y%m%d-%H%M%S")
        print(f"{e}. Using date as version: {fallback}")
        return fallback

def train():
    raw_data = fetch_data("companies/embeddings")
    
    if not raw_data:
        print("No raw data retrieved from API.")
        return

    company_vectors, company_metadata = format(raw_data)

    #print(f"Debug: Amount of companies: {len(raw_data)}")
    #print(f"Debug: Shape of company_vectors after format: {company_vectors.shape}")

    if len(company_vectors) == 0:
        print("Error: No valid embeddings found.")
        return
        
    if len(company_vectors.shape) != 2:
        print(f"Error: Wrong dimensions. Fiass wants 2D but got: {company_vectors.shape}")
        return

    faiss.normalize_L2(company_vectors)
    d = company_vectors.shape[1]
    
    index = faiss.IndexFlatIP(d)
    index.add(company_vectors)
    
    chunk = faiss.serialize_index(index)
    index_bytes = chunk.tobytes()

    metadata_bytes = pickle.dumps(company_metadata)

    index_b64 = base64.b64encode(index_bytes).decode('utf-8')
    metadata_b64 = base64.b64encode(metadata_bytes).decode('utf-8')

    version_name = get_next_version_name()

    payload = {
        "version_label": version_name,
        "description": f"Trained model containing {index.ntotal} companies",
        "is_active": True,
        "faiss_index": index_b64,
        "metadata_pkl": metadata_b64
    }

    print("Sending trained model to database...")

    try:
        response = requests.post(model_url, json=payload, verify=False)
        response.raise_for_status()
        print(f"Succes! Model '{version_name}' saved to the database.")

    except requests.exceptions.RequestException as e:
        print(f"Error: Failed to save model to database. {e}")
        if e.response is not None:
            print(f"Backend response: {e.response.text}")

if __name__ == "__main__":
   wait_for_companies()
   train()