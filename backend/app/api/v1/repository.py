from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Doubt, DoubtStatus, SolvedDoubtRating, User
from app.schemas.schemas import DoubtOut, RatingCreate
from app.api.v1.doubts import map_doubt_to_out

router = APIRouter(prefix="/repository", tags=["Solved Questions Repository"])

@router.get("", response_model=List[DoubtOut])
def get_solved_repository(
    department_id: Optional[int] = None,
    course_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    topic: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "recent", # "recent", "upvotes", "rating"
    db: Session = Depends(get_db)
):
    # Only show published doubts or resolved/answered doubts
    query = db.query(Doubt).filter(
        (Doubt.is_published == True) | (Doubt.status.in_([DoubtStatus.ANSWERED, DoubtStatus.RESOLVED]))
    )

    if subject_id:
        query = query.filter(Doubt.subject_id == subject_id)
    if topic:
        query = query.filter(Doubt.topic.ilike(f"%{topic}%"))
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Doubt.title.ilike(search_pattern)) |
            (Doubt.topic.ilike(search_pattern)) |
            (Doubt.description.ilike(search_pattern))
        )

    if sort_by == "upvotes":
        query = query.order_by(Doubt.upvotes.desc())
    else:
        query = query.order_by(Doubt.created_at.desc())

    doubts = query.all()
    results = [map_doubt_to_out(d, db) for d in doubts]
    
    if sort_by == "rating":
        results.sort(key=lambda x: (x.average_rating or 0), reverse=True)

    return results

@router.post("/{id}/upvote")
def upvote_question(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doubt = db.query(Doubt).filter(Doubt.id == id).first()
    if not doubt:
        raise HTTPException(status_code=404, detail="Question not found")
        
    doubt.upvotes = (doubt.upvotes or 0) + 1
    db.commit()
    return {"message": "Upvoted successfully", "upvotes": doubt.upvotes}

@router.post("/{id}/rate")
def rate_answer(
    id: int,
    rating_in: RatingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if rating_in.rating < 1 or rating_in.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    doubt = db.query(Doubt).filter(Doubt.id == id).first()
    if not doubt:
        raise HTTPException(status_code=404, detail="Doubt not found")

    existing_rating = db.query(SolvedDoubtRating).filter(
        SolvedDoubtRating.doubt_id == doubt.id,
        SolvedDoubtRating.student_id == current_user.id
    ).first()

    if existing_rating:
        existing_rating.rating = rating_in.rating
        existing_rating.feedback = rating_in.feedback
    else:
        new_rating = SolvedDoubtRating(
            doubt_id=doubt.id,
            student_id=current_user.id,
            rating=rating_in.rating,
            feedback=rating_in.feedback
        )
        db.add(new_rating)

    db.commit()
    return {"message": "Thank you for rating this solution!"}
