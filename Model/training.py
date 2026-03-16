import faiss
import pickle
from preprocessing import fetch_data, format
from setup import create_faiss_index

def train():
    raw_data = fetch_data("companies")
    
    if not raw_data:
        print("Error: No companies found.")
        return

    company_vectors, company_metadata = format(raw_data)

    faiss.normalize_L2(company_vectors)
    
    d = company_vectors.shape[1]
    
    index = create_faiss_index(d)
    
    index.add(company_vectors)
    
    faiss.write_index(index, "companies_index.faiss")
    
    with open("companies_metadata.pkl", "wb") as f:
        pickle.dump(company_metadata, f)
        
    print(f"Succes! Model trained with {index.ntotal} company profiles and saved locally.")

#if __name__ == "__main__":
#   train()