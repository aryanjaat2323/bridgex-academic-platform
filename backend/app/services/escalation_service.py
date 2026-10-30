from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from app.models.models import Doubt, DoubtTimelineAudit, User, UserRole, Notification
from app.core.config import settings

def run_escalation_check(db: Session, threshold_hours: int = None) -> List[Doubt]:
    if threshold_hours is None:
        threshold_hours = settings.ESCALATION_HOURS_THRESHOLD
        
    cutoff_time = datetime.utcnow() - timedelta(hours=threshold_hours)
    
    # Target doubts that are pending, seen, or queued and older than cutoff
    unresolved_statuses = ["pending", "seen", "queued"]
    
    eligible_doubts = db.query(Doubt).filter(
        Doubt.status.in_(unresolved_statuses),
        Doubt.is_escalated == False,
        Doubt.created_at <= cutoff_time
    ).all()
    
    escalated_doubts = []
    
    # Fetch admin users to notify
    admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
    
    for doubt in eligible_doubts:
        doubt.is_escalated = True
        doubt.escalated_at = datetime.utcnow()
        doubt.escalation_reason = f"Unresolved SLA breach: exceeded {threshold_hours} hours in {doubt.status} state"
        
        # Add audit entry
        audit = DoubtTimelineAudit(
            doubt_id=doubt.id,
            previous_status=doubt.status,
            new_status=doubt.status,
            changed_by_user_id=None,
            reason=f"Automated {threshold_hours}-hour SLA breach escalation"
        )
        db.add(audit)
        
        # Notify admins
        for admin in admins:
            notif = Notification(
                recipient_id=admin.id,
                title="SLA Alert: Doubt Escalated",
                message=f"Doubt {doubt.reference_id} ('{doubt.title[:40]}...') has exceeded the {threshold_hours}h response SLA.",
                type="escalation",
                link_url=f"/admin/escalations?doubt={doubt.id}"
            )
            db.add(notif)
            
        # Notify assigned faculty if present
        if doubt.assigned_faculty_id:
            notif_faculty = Notification(
                recipient_id=doubt.assigned_faculty_id,
                title="Urgent: Assigned Doubt Escalated",
                message=f"Doubt {doubt.reference_id} assigned to you has been escalated to administration due to 48h SLA breach.",
                type="escalation",
                link_url=f"/faculty/queue?doubt={doubt.id}"
            )
            db.add(notif_faculty)
            
        escalated_doubts.append(doubt)
        
    if eligible_doubts:
        db.commit()
        
    return escalated_doubts
