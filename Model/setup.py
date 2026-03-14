import faiss

def create_faiss_index(dimension: int):
    """
    Creates an empty FAISS model (index).
    """
    index = faiss.IndexFlatIP(dimension)
    return index