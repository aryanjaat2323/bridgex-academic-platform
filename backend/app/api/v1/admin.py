from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.models import User, UserRole, Doubt, DoubtStatus, FacultySubjectAssignment, Subject
from app.schemas.schemas import UserOut, DoubtOut
from app.api.v1.doubts import map_doubt_to_out
from app.services.escalation_service import run_escalation_check

router = APIRouter(prefix="/admin", tags=["Administration"])

class RoleChangeRequest(BaseModel):
    new_role: str

class FacultyAssignmentRequest(BaseModel):
    faculty_id: int
    subject_id: int
    section: Optional[str] = "A"

@router.get("/users", response_model=List[UserOut])
def list_users(
    role: Optional[str] = None,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role.lower())
    users = query.all()
    out = []
    for u in users:
        u_out = UserOut.model_validate(u)
        if u.department:
            u_out.department_name = u.department.name
        out.append(u_out)
    return out

@router.patch("/users/{id}/role", response_model=UserOut)
def update_user_role(
    id: int,
    req: RoleChangeRequest,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    valid_roles = [r.value for r in UserRole]
    if req.new_role.lower() not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {valid_roles}")

    user.role = req.new_role.lower()
    db.commit()
    db.refresh(user)

    u_out = UserOut.model_validate(user)
    if user.department:
        u_out.department_name = user.department.name
    return u_out

@router.post("/escalations/check")
def trigger_escalation_check(
    threshold_hours: Optional[int] = 48,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    escalated = run_escalation_check(db, threshold_hours=threshold_hours)
    return {
        "message": f"Escalation scan executed using {threshold_hours}h SLA threshold.",
        "newly_escalated_count": len(escalated),
        "escalated_references": [d.reference_id for d in escalated]
    }

@router.get("/escalations", response_model=List[DoubtOut])
def get_escalated_doubts(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    doubts = db.query(Doubt).filter(Doubt.is_escalated == True).order_by(Doubt.escalated_at.desc()).all()
    return [map_doubt_to_out(d, db) for d in doubts]

@router.post("/assignments")
def assign_faculty_to_subject(
    req: FacultyAssignmentRequest,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    faculty = db.query(User).filter(User.id == req.faculty_id, User.role == UserRole.FACULTY).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty member not found")

    subject = db.query(Subject).filter(Subject.id == req.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    existing = db.query(FacultySubjectAssignment).filter(
        FacultySubjectAssignment.faculty_id == req.faculty_id,
        FacultySubjectAssignment.subject_id == req.subject_id,
        FacultySubjectAssignment.section == req.section
    ).first()

    if existing:
        return {"message": "Assignment already exists"}

    assignment = FacultySubjectAssignment(
        faculty_id=req.faculty_id,
        subject_id=req.subject_id,
        section=req.section or "A"
    )
    db.add(assignment)
    db.commit()
    return {"message": f"Assigned {faculty.full_name} to {subject.name} (Sec {assignment.section})"}
