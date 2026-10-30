from sqlalchemy.orm import Session
from app.models.models import Notification

def send_notification(
    db: Session,
    recipient_id: int,
    title: str,
    message: str,
    type: str = "general",
    link_url: str = None
) -> Notification:
    notif = Notification(
        recipient_id=recipient_id,
        title=title,
        message=message,
        type=type,
        link_url=link_url,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
