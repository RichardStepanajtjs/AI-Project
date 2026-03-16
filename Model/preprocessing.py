import requests
import numpy as np
import urllib3

api_base_url = "https://nest.sokrates.traefik.me"
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def fetch_data(endpoint: str):
    """
    GET-request to retrieve company or forum data.
    """
    url = f"{api_base_url}/{endpoint}"
    print(f"Retrieving data from API: {url}...")
    
    try:
        response = requests.get(url, verify=False)
        response.raise_for_status()
        
        json_response = response.json()
        
        if json_response.get("success"):
            return json_response.get("data", [])
        else:
            print(f"API returned an error: {json_response.get('message')}")
            return []
            
    except requests.exceptions.RequestException as e:
        print(f"Error: Cannot connect to API. {e}")
        return []

def format(api_data: list):
    """
    Transforms API-data to vectors and metadata so it's ready to use for a FAISS model.
    """
    vectors = []
    metadata = []
    
    for item in api_data:
        if "embedding" in item and item["embedding"]:
            vector = item["embedding"]
            
            if isinstance(vector, list) and len(vector) > 0 and isinstance(vector[0], list):
                vector = vector[0]
                
            vectors.append(vector)
            
            meta_item = item.copy()
            del meta_item["embedding"]
            metadata.append(meta_item)
            
    vectors_array = np.array(vectors).astype('float32')
    return vectors_array, metadata

# Debugging
#if __name__ == "__main__":
#    print("Testing preprocessing.py...")
    
#     companies = fetch_data("companies")
    
#     if companies:
#         print(f"\nSucces! {len(companies)} companies found.")
#         vectoren, meta = format(companies)
#         print(f"Transformed to {len(vectoren)} FAISS vectors.")
#         if len(vectoren) > 0:
#             print(f"Dimensions of first vector: {len(vectoren[0])}")
#     else:
#         print("\Error: No companies found or failed to connect to API.")