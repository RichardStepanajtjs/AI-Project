import faiss
import pickle
import base64
from datetime import datetime
import requests
import urllib3
from preprocessing import fetch_data, format

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

model_url = "http://backend:3000/models"

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

    version_name = f"v-{datetime.now().strftime('%Y%m%d-%H%M')}"

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
   train()