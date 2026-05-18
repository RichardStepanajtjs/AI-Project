import faiss
from preprocessing import fetch_data, format
from extracting import load_active_model

def search_best_matches(k=20, form_id=0):
    """
    Searches the best prospect matches given a certain form, and returns a ranked list.
    """
    index, company_metadata = load_active_model()
    
    if index is None or company_metadata is None:
        print("Ranking canceled: Could not load model.")
        return

    raw_form_data = fetch_data(f"forms/{form_id}")
    
    if not raw_form_data:
        print(f"Form with id {form_id} not found.")
        return

    if isinstance(raw_form_data, dict):
        raw_form_data = [raw_form_data]

    form_vector, form_metadata = format(raw_form_data)

    if len(form_vector) == 0:
        print(f"Error: No embedding from form {form_id} found.")
        return 
    
    faiss.normalize_L2(form_vector)
    scores, matrix_indices = index.search(form_vector, k)
    
    print("\n--- Top Matches ---")
    for i in range(k):
        match_index = matrix_indices[0][i]
        score = scores[0][i]
        
        if match_index == -1: 
            break
            
        matched_company = company_metadata[match_index]
        
        print(f"Rank #{i+1} | Score: {score:.4f}")
        print(f"Bedrijf: {matched_company.get('naam', 'Onbekend')} (KBO: {matched_company.get('kbonummer', 'Onbekend')})")
        print(f"Beschrijving: {matched_company.get('text', 'Geen omschrijving beschikbaar')}\n")