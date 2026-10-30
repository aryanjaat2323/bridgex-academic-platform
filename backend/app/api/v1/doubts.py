import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    Doubt, DoubtTimelineAudit, DoubtResponse, Subject, FacultySubjectAssignment,
    User, UserRole, DoubtStatus, SolvedDoubtRating
)
from app.schemas.schemas import (
    DoubtCreate, DoubtOut, DoubtDetailOut, DoubtStatusUpdate,
    DoubtResponseCreate, DoubtResponseOut, TimelineAuditOut, ForwardDoubtRequest
)
from app.services.notification_service import send_notification

router = APIRouter(prefix="/doubts", tags=["Doubts"])

def generate_reference_id(db: Session) -> str:
    year = datetime.utcnow().year
    while True:
        rand_num = random.randint(1000, 9999)
        ref_id = f"BX-{year}-{rand_num}"
        if not db.query(Doubt).filter(Doubt.reference_id == ref_id).first():
            return ref_id

def map_doubt_to_out(doubt: Doubt, db: Session) -> DoubtOut:
    resp_count = db.query(DoubtResponse).filter(DoubtResponse.doubt_id == doubt.id).count()
    ratings = db.query(SolvedDoubtRating).filter(SolvedDoubtRating.doubt_id == doubt.id).all()
    avg_rating = (sum(r.rating for r in ratings) / len(ratings)) if ratings else None
    
    return DoubtOut(
        id=doubt.id,
        reference_id=doubt.reference_id,
        student_id=doubt.student_id,
        student_name=doubt.student.full_name if doubt.student else "Unknown Student",
        student_roll=doubt.student.roll_number if doubt.student else None,
        assigned_faculty_id=doubt.assigned_faculty_id,
        faculty_name=doubt.assigned_faculty.full_name if doubt.assigned_faculty else "Unassigned",
        subject_id=doubt.subject_id,
        subject_name=doubt.subject.name if doubt.subject else "Unknown Subject",
        subject_code=doubt.subject.code if doubt.subject else "N/A",
        topic=doubt.topic,
        title=doubt.title,
        description=doubt.description,
        context_notes=doubt.context_notes,
        urgency=doubt.urgency,
        status=doubt.status,
        is_escalated=doubt.is_escalated,
        escalated_at=doubt.escalated_at,
        escalation_reason=doubt.escalation_reason,
        is_published=doubt.is_published,
        upvotes=doubt.upvotes,
        attachment_url=doubt.attachment_url,
        merged_into_id=doubt.merged_into_id,
        created_at=doubt.created_at,
        updated_at=doubt.updated_at,
        response_count=resp_count,
        average_rating=round(avg_rating, 1) if avg_rating else None
    )

@router.post("", response_model=DoubtOut)
def create_doubt(
    doubt_in: DoubtCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.STUDENT, UserRole.CR]:
        raise HTTPException(status_code=403, detail="Only students and CRs can raise doubts.")

    subject = db.query(Subject).filter(Subject.id == doubt_in.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Find assigned faculty for this subject and student's section
    assignment = db.query(FacultySubjectAssignment).filter(
        FacultySubjectAssignment.subject_id == subject.id
    ).first()
    assigned_faculty_id = assignment.faculty_id if assignment else None

    ref_id = generate_reference_id(db)

    new_doubt = Doubt(
        reference_id=ref_id,
        student_id=current_user.id,
        assigned_faculty_id=assigned_faculty_id,
        subject_id=subject.id,
        topic=doubt_in.topic,
        title=doubt_in.title,
        description=doubt_in.description,
        context_notes=doubt_in.context_notes,
        urgency=doubt_in.urgency.lower(),
        status=DoubtStatus.PENDING,
        attachment_url=doubt_in.attachment_url,
        is_escalated=False
    )
    db.add(new_doubt)
    db.commit()
    db.refresh(new_doubt)

    # Initial audit entry
    audit = DoubtTimelineAudit(
        doubt_id=new_doubt.id,
        previous_status="none",
        new_status=DoubtStatus.PENDING,
        changed_by_user_id=current_user.id,
        reason="Doubt submitted by student"
    )
    db.add(audit)

    # Notify faculty if assigned
    if assigned_faculty_id:
        send_notification(
            db,
            recipient_id=assigned_faculty_id,
            title="New Academic Doubt Submitted",
            message=f"Student {current_user.full_name} submitted a new doubt: '{new_doubt.title[:45]}...' ({new_doubt.urgency.upper()})",
            type="doubt_status",
            link_url=f"/faculty/queue?doubt={new_doubt.id}"
        )

    db.commit()
    return map_doubt_to_out(new_doubt, db)

@router.get("", response_model=List[DoubtOut])
def list_doubts(
    status: Optional[str] = None,
    urgency: Optional[str] = None,
    subject_id: Optional[int] = None,
    is_escalated: Optional[bool] = None,
    search: Optional[str] = None,
    mine_only: Optional[bool] = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Doubt)

    # Role scoping
    if current_user.role == UserRole.STUDENT or mine_only:
        query = query.filter(Doubt.student_id == current_user.id)
    elif current_user.role == UserRole.FACULTY:
        # Faculty sees doubts assigned to them or unassigned in their subjects
        assigned_sub_ids = [
            a.subject_id for a in db.query(FacultySubjectAssignment).filter(
                FacultySubjectAssignment.faculty_id == current_user.id
            ).all()
        ]
        query = query.filter(
            (Doubt.assigned_faculty_id == current_user.id) |
            ((Doubt.assigned_faculty_id == None) & (Doubt.subject_id.in_(assigned_sub_ids)))
        )
    elif current_user.role == UserRole.CR:
        # CR sees doubts from students in their section & department
        section_student_ids = [
            u.id for u in db.query(User).filter(
                User.department_id == current_user.department_id,
                User.section == current_user.section
            ).all()
        ]
        query = query.filter(Doubt.student_id.in_(section_student_ids))
    # Admin sees all

    if status:
        query = query.filter(Doubt.status == status.lower())
    if urgency:
        query = query.filter(Doubt.urgency == urgency.lower())
    if subject_id:
        query = query.filter(Doubt.subject_id == subject_id)
    if is_escalated is not None:
        query = query.filter(Doubt.is_escalated == is_escalated)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Doubt.title.ilike(search_pattern)) |
            (Doubt.topic.ilike(search_pattern)) |
            (Doubt.reference_id.ilike(search_pattern))
        )

    doubts = query.order_by(Doubt.created_at.desc()).all()
    return [map_doubt_to_out(d, db) for d in doubts]

@router.get("/{id}", response_model=DoubtDetailOut)
def get_doubt_detail(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doubt = db.query(Doubt).filter(Doubt.id == id).first()
    if not doubt:
        raise HTTPException(status_code=404, detail="Doubt not found")

    base_out = map_doubt_to_out(doubt, db)

    # Responses
    responses = db.query(DoubtResponse).filter(DoubtResponse.doubt_id == doubt.id).order_by(DoubtResponse.created_at.asc()).all()
    resp_outs = []
    for r in responses:
        resp_outs.append(DoubtResponseOut(
            id=r.id,
            doubt_id=r.doubt_id,
            author_id=r.author_id,
            author_name=r.author.full_name if r.author else "User",
            author_role=r.author.role if r.author else "user",
            author_avatar=r.author.avatar_url if r.author else None,
            content=r.content,
            attachment_url=r.attachment_url,
            is_faculty_answer=r.is_faculty_answer,
            created_at=r.created_at
        ))

    # Timeline audit
    audits = db.query(DoubtTimelineAudit).filter(DoubtTimelineAudit.doubt_id == doubt.id).order_by(DoubtTimelineAudit.created_at.asc()).all()
    audit_outs = []
    for a in audits:
        changer = db.query(User).filter(User.id == a.changed_by_user_id).first() if a.changed_by_user_id else None
        audit_outs.append(TimelineAuditOut(
            id=a.id,
            previous_status=a.previous_status,
            new_status=a.new_status,
            changed_by_name=changer.full_name if changer else "BridgeX System",
            reason=a.reason,
            created_at=a.created_at
        ))

    return DoubtDetailOut(
        **base_out.dict(),
        responses=resp_outs,
        timeline=audit_outs
    )

@router.patch("/{id}/status", response_model=DoubtOut)
def update_doubt_status(
    id: int,
    status_update: DoubtStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doubt = db.query(Doubt).filter(Doubt.id == id).first()
    if not doubt:
        raise HTTPException(status_code=404, detail="Doubt not found")

    # Only faculty and admin can update status
    if current_user.role not in [UserRole.FACULTY, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only faculty and admin can modify doubt status.")

    old_status = doubt.status
    new_status = status_update.status.lower()

    if old_status == new_status:
        return map_doubt_to_out(doubt, db)

    doubt.status = new_status
    doubt.updated_at = datetime.utcnow()

    # If marked resolved, reset escalation if any
    if new_status == DoubtStatus.RESOLVED and doubt.is_escalated:
        doubt.is_escalated = False

    audit = DoubtTimelineAudit(
        doubt_id=doubt.id,
        previous_status=old_status,
        new_status=new_status,
        changed_by_user_id=current_user.id,
        reason=status_update.reason or f"Status changed to {new_status} by {current_user.full_name}"
    )
    db.add(audit)

    # Notify student
    send_notification(
        db,
        recipient_id=doubt.student_id,
        title=f"Doubt Status Updated: {new_status.capitalize()}",
        message=f"Your doubt {doubt.reference_id} ('{doubt.title[:35]}...') is now marked as {new_status.upper()}.",
        type="doubt_status",
        link_url=f"/student/doubts/{doubt.id}"
    )

    db.commit()
    return map_doubt_to_out(doubt, db)

@router.post("/{id}/responses", response_model=DoubtResponseOut)
def add_doubt_response(
    id: int,
    response_in: DoubtResponseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doubt = db.query(Doubt).filter(Doubt.id == id).first()
    if not doubt:
        raise HTTPException(status_code=404, detail="Doubt not found")

    is_faculty = current_user.role in [UserRole.FACULTY, UserRole.ADMIN]

    resp = DoubtResponse(
        doubt_id=doubt.id,
        author_id=current_user.id,
        content=response_in.content,
        attachment_url=response_in.attachment_url,
        is_faculty_answer=is_faculty and response_in.is_faculty_answer
    )
    db.add(resp)

    # If faculty answers, transition status to answered or resolved
    if is_faculty and response_in.is_faculty_answer:
        old_status = doubt.status
        doubt.status = DoubtStatus.ANSWERED
        doubt.updated_at = datetime.utcnow()
        if response_in.publish_to_repo:
            doubt.is_published = True

        audit = DoubtTimelineAudit(
            doubt_id=doubt.id,
            previous_status=old_status,
            new_status=DoubtStatus.ANSWERED,
            changed_by_user_id=current_user.id,
            reason="Faculty posted verified answer"
        )
        db.add(audit)

        # Notify student
        send_notification(
            db,
            recipient_id=doubt.student_id,
            title="Faculty Answer Published",
            message=f"{current_user.full_name} provided an answer to your doubt {doubt.reference_id}.",
            type="answer",
            link_url=f"/student/doubts/{doubt.id}"
        )
    elif not is_faculty:
        # Student clarification reply -> notify faculty
        if doubt.assigned_faculty_id:
            send_notification(
                db,
                recipient_id=doubt.assigned_faculty_id,
                title="Student Clarification Submitted",
                message=f"Student {current_user.full_name} replied to doubt {doubt.reference_id}.",
                type="clarification",
                link_url=f"/faculty/queue?doubt={doubt.id}"
            )

    db.commit()
    db.refresh(resp)

    return DoubtResponseOut(
        id=resp.id,
        doubt_id=resp.doubt_id,
        author_id=resp.author_id,
        author_name=current_user.full_name,
        author_role=current_user.role,
        author_avatar=current_user.avatar_url,
        content=resp.content,
        attachment_url=resp.attachment_url,
        is_faculty_answer=resp.is_faculty_answer,
        created_at=resp.created_at
    )

@router.post("/forward", response_model=DoubtOut)
def forward_doubt_by_cr(
    forward_req: ForwardDoubtRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.CR and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only CRs and Admins can forward doubts.")

    doubt = db.query(Doubt).filter(Doubt.id == forward_req.doubt_id).first()
    if not doubt:
        raise HTTPException(status_code=404, detail="Doubt not found")

    target_faculty = db.query(User).filter(
        User.id == forward_req.target_faculty_id,
        User.role == UserRole.FACULTY
    ).first()
    if not target_faculty:
        raise HTTPException(status_code=404, detail="Target faculty not found")

    old_faculty_id = doubt.assigned_faculty_id
    doubt.assigned_faculty_id = target_faculty.id
    doubt.updated_at = datetime.utcnow()

    # Timeline audit
    audit = DoubtTimelineAudit(
        doubt_id=doubt.id,
        previous_status=doubt.status,
        new_status=doubt.status,
        changed_by_user_id=current_user.id,
        reason=f"Forwarded by CR {current_user.full_name} to {target_faculty.full_name}. Note: {forward_req.cr_note or 'None'}"
    )
    db.add(audit)

    # Notify faculty
    send_notification(
        db,
        recipient_id=target_faculty.id,
        title="Doubt Forwarded by Class Representative",
        message=f"CR {current_user.full_name} forwarded doubt {doubt.reference_id} with note: '{forward_req.cr_note or 'Please review'}'",
        type="forward",
        link_url=f"/faculty/queue?doubt={doubt.id}"
    )

    db.commit()
    return map_doubt_to_out(doubt, db)
