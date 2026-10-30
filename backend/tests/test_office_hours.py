import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.models import User, UserRole, OfficeHourSlot, Appointment, AppointmentStatus
from app.services.booking_service import book_appointment, check_slot_availability

def test_office_hour_booking_and_double_booking_prevention():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    faculty = User(email="prof@test.edu", hashed_password="pw", full_name="Prof", role=UserRole.FACULTY)
    student1 = User(email="s1@test.edu", hashed_password="pw", full_name="Student 1", role=UserRole.STUDENT)
    student2 = User(email="s2@test.edu", hashed_password="pw", full_name="Student 2", role=UserRole.STUDENT)
    session.add_all([faculty, student1, student2])
    session.commit()

    # Student 1 books slot 14:00 - 14:20
    appt1 = book_appointment(
        db=session,
        student_id=student1.id,
        faculty_id=faculty.id,
        appointment_date="2026-11-04",
        start_time="14:00",
        end_time="14:20",
        notes="Discussion on B-Trees"
    )
    assert appt1.id is not None
    assert appt1.status == AppointmentStatus.CONFIRMED

    # Student 2 tries to book overlapping slot 14:10 - 14:30 -> MUST FAIL
    with pytest.raises(HTTPException) as exc:
        book_appointment(
            db=session,
            student_id=student2.id,
            faculty_id=faculty.id,
            appointment_date="2026-11-04",
            start_time="14:10",
            end_time="14:30"
        )
    assert exc.value.status_code == 409

    # Student 2 books subsequent non-overlapping slot 14:20 - 14:40 -> MUST SUCCEED
    appt2 = book_appointment(
        db=session,
        student_id=student2.id,
        faculty_id=faculty.id,
        appointment_date="2026-11-04",
        start_time="14:20",
        end_time="14:40"
    )
    assert appt2.id is not None
    assert appt2.status == AppointmentStatus.CONFIRMED

    session.close()
