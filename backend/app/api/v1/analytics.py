from datetime import datetime, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    Doubt, DoubtStatus, DoubtResponse, User, UserRole, Department, Course, Subject, FacultySubjectAssignment
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/student")
def get_student_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    doubts = db.query(Doubt).filter(Doubt.student_id == current_user.id).all()
    
    total = len(doubts)
    pending = sum(1 for d in doubts if d.status == DoubtStatus.PENDING)
    seen = sum(1 for d in doubts if d.status == DoubtStatus.SEEN)
    queued = sum(1 for d in doubts if d.status == DoubtStatus.QUEUED)
    answered = sum(1 for d in doubts if d.status == DoubtStatus.ANSWERED)
    resolved = sum(1 for d in doubts if d.status == DoubtStatus.RESOLVED)

    # Subject-wise distribution
    subject_counts: Dict[str, int] = {}
    for d in doubts:
        s_name = d.subject.name if d.subject else "Other"
        subject_counts[s_name] = subject_counts.get(s_name, 0) + 1

    subject_data = [{"subject": k, "count": v} for k, v in subject_counts.items()]

    # Status distribution
    status_data = [
        {"name": "Pending", "value": pending, "color": "#F59E0B"},
        {"name": "Seen/Queued", "value": seen + queued, "color": "#8B5CF6"},
        {"name": "Answered", "value": answered, "color": "#14B8A6"},
        {"name": "Resolved", "value": resolved, "color": "#10B981"}
    ]

    return {
        "kpis": {
            "total_doubts": total,
            "pending_doubts": pending + seen + queued,
            "answered_doubts": answered,
            "resolved_doubts": resolved,
            "resolution_rate": round((resolved / total * 100), 1) if total > 0 else 0
        },
        "subject_distribution": subject_data,
        "status_distribution": status_data
    }

@router.get("/faculty")
def get_faculty_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    doubts = db.query(Doubt).filter(Doubt.assigned_faculty_id == current_user.id).all()
    
    total = len(doubts)
    pending = sum(1 for d in doubts if d.status in [DoubtStatus.PENDING, DoubtStatus.SEEN, DoubtStatus.QUEUED])
    answered = sum(1 for d in doubts if d.status == DoubtStatus.ANSWERED)
    resolved = sum(1 for d in doubts if d.status == DoubtStatus.RESOLVED)
    escalated = sum(1 for d in doubts if d.is_escalated)

    # Calculate average response time in hours for answered doubts
    response_times = []
    for d in doubts:
        if d.status in [DoubtStatus.ANSWERED, DoubtStatus.RESOLVED]:
            first_ans = db.query(DoubtResponse).filter(
                DoubtResponse.doubt_id == d.id,
                DoubtResponse.is_faculty_answer == True
            ).order_by(DoubtResponse.created_at.asc()).first()
            if first_ans:
                delta_hrs = (first_ans.created_at - d.created_at).total_seconds() / 3600.0
                response_times.append(delta_hrs)

    avg_response_hrs = round(sum(response_times) / len(response_times), 1) if response_times else 3.5

    # Urgency breakdown
    urgency_data = [
        {"name": "Normal", "value": sum(1 for d in doubts if d.urgency == "normal"), "color": "#356AE6"},
        {"name": "Important", "value": sum(1 for d in doubts if d.urgency == "important"), "color": "#F59E0B"},
        {"name": "Deadline Approaching", "value": sum(1 for d in doubts if d.urgency == "deadline_approaching"), "color": "#EF4444"}
    ]

    # Subject distribution
    subject_counts: Dict[str, int] = {}
    for d in doubts:
        s_name = d.subject.name if d.subject else "General"
        subject_counts[s_name] = subject_counts.get(s_name, 0) + 1
    subject_data = [{"subject": k, "count": v} for k, v in subject_counts.items()]

    return {
        "kpis": {
            "total_assigned": total,
            "pending_queue": pending,
            "resolved_count": resolved,
            "escalated_count": escalated,
            "avg_response_hours": avg_response_hrs
        },
        "urgency_breakdown": urgency_data,
        "subject_distribution": subject_data
    }

@router.get("/cr")
def get_cr_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    section_student_ids = [
        u.id for u in db.query(User).filter(
            User.department_id == current_user.department_id,
            User.section == current_user.section
        ).all()
    ]
    
    doubts = db.query(Doubt).filter(Doubt.student_id.in_(section_student_ids)).all()
    
    total = len(doubts)
    pending = sum(1 for d in doubts if d.status in [DoubtStatus.PENDING, DoubtStatus.SEEN, DoubtStatus.QUEUED])
    resolved = sum(1 for d in doubts if d.status == DoubtStatus.RESOLVED)
    escalated = sum(1 for d in doubts if d.is_escalated)

    # Subject distribution
    subject_counts: Dict[str, int] = {}
    topic_counts: Dict[str, int] = {}
    for d in doubts:
        s_name = d.subject.name if d.subject else "General"
        subject_counts[s_name] = subject_counts.get(s_name, 0) + 1
        topic_counts[d.topic] = topic_counts.get(d.topic, 0) + 1

    subject_data = [{"subject": k, "count": v} for k, v in subject_counts.items()]
    
    # Top 5 frequent topics
    sorted_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_topics = [{"topic": k, "count": v} for k, v in sorted_topics]

    return {
        "kpis": {
            "total_class_doubts": total,
            "pending_doubts": pending,
            "resolved_doubts": resolved,
            "escalated_doubts": escalated,
            "class_section": f"{current_user.section} ({current_user.department.name if current_user.department else 'Dept'})"
        },
        "subject_distribution": subject_data,
        "frequent_topics": top_topics
    }

@router.get("/admin")
def get_admin_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    total_faculty = db.query(User).filter(User.role == UserRole.FACULTY).count()
    
    all_doubts = db.query(Doubt).all()
    total_doubts = len(all_doubts)
    pending_doubts = sum(1 for d in all_doubts if d.status in [DoubtStatus.PENDING, DoubtStatus.SEEN, DoubtStatus.QUEUED])
    resolved_doubts = sum(1 for d in all_doubts if d.status == DoubtStatus.RESOLVED)
    escalated_doubts = sum(1 for d in all_doubts if d.is_escalated)

    # Department distribution
    dept_counts: Dict[str, int] = {}
    for d in all_doubts:
        dept_name = d.subject.course.department.name if (d.subject and d.subject.course and d.subject.course.department) else "General"
        dept_counts[dept_name] = dept_counts.get(dept_name, 0) + 1
    dept_data = [{"department": k, "count": v} for k, v in dept_counts.items()]

    # Faculty workload & response performance
    faculty_list = db.query(User).filter(User.role == UserRole.FACULTY).all()
    faculty_stats = []
    for f in faculty_list:
        f_doubts = [d for d in all_doubts if d.assigned_faculty_id == f.id]
        f_resolved = sum(1 for d in f_doubts if d.status == DoubtStatus.RESOLVED)
        f_pending = sum(1 for d in f_doubts if d.status in [DoubtStatus.PENDING, DoubtStatus.SEEN, DoubtStatus.QUEUED])
        faculty_stats.append({
            "faculty_name": f.full_name,
            "assigned": len(f_doubts),
            "pending": f_pending,
            "resolved": f_resolved,
            "resolution_rate": round(f_resolved / len(f_doubts) * 100, 1) if f_doubts else 100
        })

    return {
        "kpis": {
            "total_students": total_students,
            "total_faculty": total_faculty,
            "total_doubts": total_doubts,
            "pending_doubts": pending_doubts,
            "resolved_doubts": resolved_doubts,
            "escalated_doubts": escalated_doubts,
            "overall_resolution_rate": round(resolved_doubts / total_doubts * 100, 1) if total_doubts else 0
        },
        "department_distribution": dept_data,
        "faculty_performance": faculty_stats
    }
