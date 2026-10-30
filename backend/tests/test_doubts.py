import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.models import (
    User, UserRole, Department, Course, Subject, FacultySubjectAssignment,
    Doubt, DoubtStatus, DoubtUrgency, DoubtTimelineAudit
)
from app.api.v1.doubts import generate_reference_id

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    dept = Department(name="Computer Science", code="CSE")
    session.add(dept)
    session.commit()

    course = Course(department_id=dept.id, name="B.Tech CSE", code="CS")
    session.add(course)
    session.commit()

    subject = Subject(course_id=course.id, name="Data Structures", code="CS201", semester=3)
    session.add(subject)
    session.commit()

    student = User(email="student@test.edu", hashed_password="pw", full_name="Student", role=UserRole.STUDENT, department_id=dept.id)
    faculty = User(email="faculty@test.edu", hashed_password="pw", full_name="Prof Test", role=UserRole.FACULTY, department_id=dept.id)
    session.add_all([student, faculty])
    session.commit()

    assignment = FacultySubjectAssignment(faculty_id=faculty.id, subject_id=subject.id, section="A")
    session.add(assignment)
    session.commit()

    yield session
    session.close()

def test_create_and_route_doubt(db_session):
    student = db_session.query(User).filter(User.role == UserRole.STUDENT).first()
    faculty = db_session.query(User).filter(User.role == UserRole.FACULTY).first()
    subject = db_session.query(Subject).first()

    ref = generate_reference_id(db_session)
    assert ref.startswith("BX-")

    doubt = Doubt(
        reference_id=ref,
        student_id=student.id,
        assigned_faculty_id=faculty.id,
        subject_id=subject.id,
        topic="Recursion",
        title="Tower of Hanoi recurrence relation",
        description="How to derive T(n) = 2T(n-1) + 1?",
        urgency=DoubtUrgency.NORMAL,
        status=DoubtStatus.PENDING
    )
    db_session.add(doubt)
    db_session.commit()

    assert doubt.id is not None
    assert doubt.status == DoubtStatus.PENDING
    assert doubt.assigned_faculty_id == faculty.id
    assert doubt.is_escalated is False

def test_status_transition_audit_log(db_session):
    student = db_session.query(User).filter(User.role == UserRole.STUDENT).first()
    faculty = db_session.query(User).filter(User.role == UserRole.FACULTY).first()
    subject = db_session.query(Subject).first()

    doubt = Doubt(
        reference_id="BX-TEST-001",
        student_id=student.id,
        assigned_faculty_id=faculty.id,
        subject_id=subject.id,
        topic="Sorting",
        title="QuickSort worst case pivot choice",
        description="Why is sorted array worst case for first element pivot?",
        urgency=DoubtUrgency.IMPORTANT,
        status=DoubtStatus.PENDING
    )
    db_session.add(doubt)
    db_session.commit()

    # Transition to SEEN
    doubt.status = DoubtStatus.SEEN
    audit1 = DoubtTimelineAudit(
        doubt_id=doubt.id,
        previous_status=DoubtStatus.PENDING,
        new_status=DoubtStatus.SEEN,
        changed_by_user_id=faculty.id,
        reason="Faculty opened query"
    )
    db_session.add(audit1)
    db_session.commit()

    # Transition to RESOLVED
    doubt.status = DoubtStatus.RESOLVED
    audit2 = DoubtTimelineAudit(
        doubt_id=doubt.id,
        previous_status=DoubtStatus.SEEN,
        new_status=DoubtStatus.RESOLVED,
        changed_by_user_id=faculty.id,
        reason="Answer provided and student satisfied"
    )
    db_session.add(audit2)
    db_session.commit()

    audits = db_session.query(DoubtTimelineAudit).filter(DoubtTimelineAudit.doubt_id == doubt.id).all()
    assert len(audits) == 2
    assert audits[0].new_status == DoubtStatus.SEEN
    assert audits[1].new_status == DoubtStatus.RESOLVED
