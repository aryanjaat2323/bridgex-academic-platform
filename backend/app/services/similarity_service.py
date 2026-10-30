import re
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.models.models import Doubt, DoubtStatus, DoubtResponse

STOP_WORDS = {
    "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with", "is", "was",
    "how", "what", "why", "can", "could", "should", "i", "my", "we", "our", "you",
    "please", "explain", "help", "doubt", "question", "problem", "having", "error", "does"
}

def stem_word(w: str) -> str:
    """Lightweight suffix stemmer for academic terms."""
    if w.endswith("ies") and len(w) > 4:
        return w[:-3] + "y"
    if w.endswith("es") and len(w) > 4:
        return w[:-2]
    if w.endswith("s") and not w.endswith("ss") and len(w) > 3:
        return w[:-1]
    if w.endswith("ing") and len(w) > 5:
        return w[:-3]
    if w.endswith("ed") and len(w) > 4:
        return w[:-2]
    return w

def tokenize(text: str) -> set[str]:
    clean = re.sub(r"[^\w\s]", " ", text.lower())
    words = clean.split()
    return {stem_word(w) for w in words if len(w) > 2 and w not in STOP_WORDS}

def calculate_jaccard_similarity(set_a: set[str], set_b: set[str]) -> float:
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a.intersection(set_b))
    union = len(set_a.union(set_b))
    return intersection / union if union > 0 else 0.0

def find_similar_doubts(
    db: Session,
    title: str,
    topic: str,
    subject_id: int,
    exclude_doubt_id: int = None,
    threshold: float = 0.25,
    max_results: int = 5
) -> List[dict]:
    query_tokens = tokenize(f"{title} {topic}")
    if not query_tokens:
        return []

    # Get doubts in the same subject or closely related
    query = db.query(Doubt).filter(Doubt.subject_id == subject_id)
    if exclude_doubt_id:
        query = query.filter(Doubt.id != exclude_doubt_id)
    
    candidates = query.all()
    results = []

    for candidate in candidates:
        candidate_text = f"{candidate.title} {candidate.topic}"
        cand_tokens = tokenize(candidate_text)
        
        score = calculate_jaccard_similarity(query_tokens, cand_tokens)
        
        # Boost score if topic is identical
        if candidate.topic.strip().lower() == topic.strip().lower():
            score = min(1.0, score + 0.3)
            
        if score >= threshold:
            answer_response = db.query(DoubtResponse).filter(
                DoubtResponse.doubt_id == candidate.id,
                DoubtResponse.is_faculty_answer == True
            ).first()

            results.append({
                "id": candidate.id,
                "reference_id": candidate.reference_id,
                "title": candidate.title,
                "topic": candidate.topic,
                "status": candidate.status,
                "similarity_score": round(score, 3),
                "has_answer": answer_response is not None,
                "answer_preview": (answer_response.content[:150] + "...") if answer_response else None
            })

    results.sort(key=lambda x: x["similarity_score"], reverse=True)
    return results[:max_results]
