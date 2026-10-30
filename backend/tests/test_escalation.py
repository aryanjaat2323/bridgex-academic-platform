from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.models import (
    User, UserRole, Department, Course, Subject, Doubt, DoubtStatus, DoubtUrgency, Notification
)
from app.services.escalation_service import run_escalation_check

def test_automated_48_hour_escalation():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    admin = User(email="admin@test.edu", hashed_password="pw", full_name="Admin HOD", role=UserRole.ADMIN)
    faculty = User(email="fac@test.edu", hashed_password="pw", full_name="Faculty", role=UserRole.FACULTY)
    student = User(email="stud@test.edu", hashed_password="pw", full_name="Student", role=UserRole.STUDENT)
    session.add_all([admin, faculty, student])
    session.commit()

    dept = Department(name="CSE", code="CSE")
    session.add(dept)
    session.commit()
    course = Course(department_id=dept.id, name="B.Tech", code="BT")
    session.add(course)
    session.commit()
    subject = Subject(course_id=course.id, name="OS", code="CS301")
    session.add(subject)
    session.commit()

    now = datetime.utcnow()

    # Doubt 1: 50 hours old, pending -> SHOULD ESCALATE
    d_old = Doubt(
        reference_id="BX-OLD-50H",
        student_id=student.id,
        assigned_faculty_id=faculty.id,
        subject_id=subject.id,
        topic="Deadlocks",
        title="Banker's Algorithm safety check question",
        description="Need urgent help with safety vector calculation",
        urgency=DoubtUrgency.IMPORTANT,
        status=DoubtStatus.PENDING,
        is_escalated=False,
        created_at=now - timedelta(hours=50)
    )

    # Doubt 2: 10 hours old, pending -> SHOULD NOT ESCALATE
    d_recent = Doubt(
        reference_id="BX-NEW-10H",
        student_id=student.id,
        assigned_faculty_id=faculty.id,
        subject_id=subject.id,
        topic="Semaphores",
        title="Counting semaphore vs binary semaphore",
        description="Wait and signal operations",
        urgency=DoubtUrgency.NORMAL,
        status=DoubtStatus.PENDING,
        is_escalated=False,
        created_at=now - timedelta(hours=10)
    )

    session.add_all([d_old, d_recent])
    session.commit()

    escalated = run_escalation_check(session, threshold_hours=48)
    assert len(escalated) == 1
    assert escalated[0].reference_id == "BX-OLD-50H"
    assert escalated[0].is_escalated is True

    # Verify notification created for admin
    notif = session.query(Notification).filter(Notification.recipient_id == admin.id).first()
    assert notif is not None
    assert "SLA Alert" in notif.title

    session.close()
