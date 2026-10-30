from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Doubt, DoubtStatus, DoubtTimelineAudit, MergedDoubt, User, UserRole
from app.schemas.schemas import DuplicateMatchOut, DoubtMergeRequest
from app.services.similarity_service import find_similar_doubts
from app.services.notification_service import send_notification

router = APIRouter(prefix="/duplicates", tags=["Duplicate Detection & Merging"])

class CheckDuplicateRequest(BaseModel):
    title: str
    topic: str
    subject_id: int
    exclude_doubt_id: Optional[int] = None
    threshold: Optional[float] = 0.25

@router.post("/check", response_model=List[DuplicateMatchOut])
def check_duplicates(
    req: CheckDuplicateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    matches = find_similar_doubts(
        db=db,
        title=req.title,
        topic=req.topic,
        subject_id=req.subject_id,
        exclude_doubt_id=req.exclude_doubt_id,
        threshold=req.threshold or 0.25
    )
    return [DuplicateMatchOut(**m) for m in matches]

@router.post("/merge")
def merge_duplicate_doubts(
    req: DoubtMergeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.FACULTY, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only faculty and admin can merge duplicate doubts.")

    primary = db.query(Doubt).filter(Doubt.id == req.primary_doubt_id).first()
    duplicate = db.query(Doubt).filter(Doubt.id == req.merged_doubt_id).first()

    if not primary or not duplicate:
        raise HTTPException(status_code=404, detail="Primary or duplicate doubt not found")

    if primary.id == duplicate.id:
        raise HTTPException(status_code=400, detail="Cannot merge a doubt into itself")

    # Preserve duplicate record and link to primary
    duplicate.merged_into_id = primary.id
    old_status = duplicate.status
    duplicate.status = DoubtStatus.RESOLVED

    # Record merge table
    merge_record = MergedDoubt(
        primary_doubt_id=primary.id,
        merged_doubt_id=duplicate.id,
        merged_by_id=current_user.id,
        notes=req.notes
    )
    db.add(merge_record)

    # Timeline audit for the merged doubt
    audit = DoubtTimelineAudit(
        doubt_id=duplicate.id,
        previous_status=old_status,
        new_status=DoubtStatus.RESOLVED,
        changed_by_user_id=current_user.id,
        reason=f"Merged into duplicate query {primary.reference_id} ('{primary.title[:30]}...') by {current_user.full_name}. Notes: {req.notes or 'Identical inquiry'}"
    )
    db.add(audit)

    # Notify student of duplicate doubt
    send_notification(
        db,
        recipient_id=duplicate.student_id,
        title="Doubt Merged with Existing Answer",
        message=f"Your doubt {duplicate.reference_id} was identified as similar to {primary.reference_id} and resolved with its answers.",
        type="merge",
        link_url=f"/student/doubts/{duplicate.id}"
    )

    db.commit()
    return {
        "message": f"Successfully merged doubt {duplicate.reference_id} into primary doubt {primary.reference_id}.",
        "primary_id": primary.id,
        "merged_id": duplicate.id
    }
