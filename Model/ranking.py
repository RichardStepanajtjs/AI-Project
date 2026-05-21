import faiss
from preprocessing import fetch_data, format
from extracting import load_active_model

def search_best_matches(k=20, form_id=0):
    """
    Searches the best prospect matches given a certain form, and returns a ranked list.
    """
    index, company_metadata = load_active_model()
    
    if index is None or company_metadata is None:
        raise RuntimeError("Could not load model. Ensure that the model is trained and active.")

    raw_form_data = fetch_data(f"forms/{form_id}")
    
    if not raw_form_data:
        raise ValueError(f"Form with id {form_id} not found.")

    if isinstance(raw_form_data, dict):
        raw_form_data = [raw_form_data]

    form_vector, form_metadata = format(raw_form_data)

    if len(form_vector) == 0:
        raise ValueError(f"No embedding from form {form_id} found.")
    
    faiss.normalize_L2(form_vector)
    scores, matrix_indices = index.search(form_vector, k)
    
    results = []
    for i in range(k):
        match_index = matrix_indices[0][i]
        score = scores[0][i]
        
        if match_index == -1: 
            break
            
        matched_company = company_metadata[match_index]
        
        results.append({
            "id": matched_company.get("id"),
            "score": float(score)
        })
        
    return results