import faiss
import numpy as np
from preprocessing import fetch_data, format

def compute_precision_at_k(index, company_metadata, form_vector, relevant_ids, k):
    """
    Runs FAISS search and computes Precision@k against a set of relevant company IDs.
    """
    faiss.normalize_L2(form_vector)
    scores, matrix_indices = index.search(form_vector, k)

    retrieved_ids = set()
    for i in range(k):
        idx = matrix_indices[0][i]
        if idx == -1:
            break
        retrieved_ids.add(company_metadata[idx].get("id"))

    hits = len(retrieved_ids & relevant_ids)
    return hits / k if k > 0 else 0.0


def evaluate(index, company_metadata, k=20):
    """
    Fetches all test_data entries, runs ranking for each linked form, and
    computes average Precision@k across all test cases.
    Returns the score (0.0 if no test data exists).
    """
    test_entries = fetch_data("testdata")
    if not test_entries:
        print("[Evaluation] No test data found, skipping evaluation.")
        return 0.0

    scores = []
    for entry in test_entries:
        prospect_list_id = entry.get("prospect_list_id")
        if not prospect_list_id:
            continue

        prospect_list = fetch_data(f"prospect-lists/{prospect_list_id}")
        if not prospect_list:
            continue
        if isinstance(prospect_list, list):
            prospect_list = prospect_list[0]

        form_id = prospect_list.get("form_id")
        company_ids = set(prospect_list.get("company_ids") or [])

        if not form_id or not company_ids:
            continue

        raw_form = fetch_data(f"forms/{form_id}")
        if not raw_form:
            continue
        if isinstance(raw_form, dict):
            raw_form = [raw_form]

        form_vector, _ = format(raw_form)
        if len(form_vector) == 0:
            continue

        precision = compute_precision_at_k(index, company_metadata, form_vector, company_ids, k)
        scores.append(precision)
        print(f"[Evaluation] prospect_list={prospect_list_id}, form={form_id}: Precision@{k} = {precision:.3f}")

    if not scores:
        print("[Evaluation] No valid test cases evaluated.")
        return 0.0

    avg = float(np.mean(scores))
    print(f"[Evaluation] Average Precision@{k} over {len(scores)} test cases: {avg:.3f}")
    return avg
