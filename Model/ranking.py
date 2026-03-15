import faiss
import pickle
from preprocessing import fetch_data

def search_best_matches(k=20):
    try:
        index = faiss.read_index("companies_index.faiss")
        with open("companies_metadata.pkl", "rb") as f:
            company_metadata = pickle.load(f)
    except FileNotFoundError:
        print("Error: Model not found.")
        return

    forum_vector, forum_data = fetch_data("forums")
    
    if forum_vector is None:
        return

    faiss.normalize_L2(forum_vector)

    scores, matrix_indices = index.search(forum_vector, k)
    
    for i in range(k):
        match_index = matrix_indices[0][i]
        score = scores[0][i]
        
        if match_index == -1: 
            break
            
        matched_company = company_metadata[match_index]
        
        print(f"Rank #{i+1} | Score: {score:.4f}")
        print(f"Company: {matched_company['naam']} (KBO: {matched_company['kboNummer']})")
        print(f"Description: {matched_company['text']}\n")

if __name__ == "__main__":
    k = 20
    search_best_matches(k)