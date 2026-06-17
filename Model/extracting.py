import base64
import pickle
import faiss
import numpy as np
from preprocessing import fetch_data

def load_active_model():
    """
    Retrieves the active model from the database, decodes the Base64 data 
    and reconstructs the FAISS index and metadata.
    """    
    model_data = fetch_data("models/active")
    
    if not model_data:
        raise RuntimeError("No active model found in database.")
        
    if isinstance(model_data, list) and len(model_data) > 0:
        model_data = model_data[0]
        
    index_raw = model_data.get("faiss_index")
    metadata_raw = model_data.get("metadata_pkl")
    
    if not index_raw or not metadata_raw:
        raise RuntimeError("Model data incomplete (missing faiss_index or metadata).")
        
    try:
        if isinstance(index_raw, dict) and index_raw.get("type") == "Buffer":
            index_bytes = bytes(index_raw["data"])
        else:
            index_bytes = base64.b64decode(index_raw)
            
        if isinstance(metadata_raw, dict) and metadata_raw.get("type") == "Buffer":
            metadata_bytes = bytes(metadata_raw["data"])
        else:
            metadata_bytes = base64.b64decode(metadata_raw)
        
        index_array = np.frombuffer(index_bytes, dtype=np.uint8)
        index = faiss.deserialize_index(index_array)
        
        metadata = pickle.loads(metadata_bytes)
        
        return index, metadata
        
    except Exception as e:
        raise RuntimeError(f"Error while decoding or loading model: {e}")