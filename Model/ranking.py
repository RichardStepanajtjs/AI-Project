import faiss
from preprocessing import fetch_data, format
from extracting import load_active_model

DOMAIN_BOOST = 0.08

def search_best_matches(k=20, form_id=0):
    """
    Searches the best prospect matches given a certain form, and returns a ranked list.
    Companies whose jobdomein matches the form sector receive a small score boost.
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

    # Determine form sector for domain boosting (case-insensitive match)
    form_sector = ""
    if form_metadata:
        form_sector = (form_metadata[0].get("sector") or "").strip().lower()

    # Search more candidates than needed so boosting can re-rank across a wider pool
    search_k = min(max(k * 3, 60), index.ntotal)

    faiss.normalize_L2(form_vector)
    scores, matrix_indices = index.search(form_vector, search_k)

    candidates = []
    for i in range(search_k):
        match_index = matrix_indices[0][i]
        score = float(scores[0][i])

        if match_index == -1:
            break

        matched_company = company_metadata[match_index]
        company_domain = (matched_company.get("jobdomein") or "").strip().lower()

        # Boost score when the company domain matches the form sector
        if form_sector and company_domain and form_sector == company_domain:
            score += DOMAIN_BOOST

        candidates.append({
            "id": matched_company.get("id"),
            "score": score,
        })

    # Re-sort after boosting and return top k
    candidates.sort(key=lambda x: x["score"], reverse=True)
    return candidates[:k]
