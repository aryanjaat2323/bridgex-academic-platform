from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import OfficeHourSlot, Appointment, AppointmentStatus

def check_slot_availability(
    db: Session,
    faculty_id: int,
    appointment_date: str,
    start_time: str,
    end_time: str,
    exclude_appointment_id: int = None
) -> bool:
    # Query for any overlapping confirmed appointment for this faculty on this date
    query = db.query(Appointment).filter(
        Appointment.faculty_id == faculty_id,
        Appointment.appointment_date == appointment_date,
        Appointment.status == AppointmentStatus.CONFIRMED,
        Appointment.start_time < end_time,
        Appointment.end_time > start_time
    )
    if exclude_appointment_id:
        query = query.filter(Appointment.id != exclude_appointment_id)
        
    conflicting = query.first()
    return conflicting is None

def book_appointment(
    db: Session,
    student_id: int,
    faculty_id: int,
    appointment_date: str,
    start_time: str,
    end_time: str,
    slot_id: int = None,
    notes: str = None
) -> Appointment:
    # 1. Check double booking
    is_available = check_slot_availability(db, faculty_id, appointment_date, start_time, end_time)
    if not is_available:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This office-hour slot has already been booked by another student."
        )
        
    # 2. Check if student already booked the exact same slot
    existing_student_booking = db.query(Appointment).filter(
        Appointment.student_id == student_id,
        Appointment.faculty_id == faculty_id,
        Appointment.appointment_date == appointment_date,
        Appointment.status == AppointmentStatus.CONFIRMED
    ).first()
    if existing_student_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active appointment with this faculty member on this date."
        )

    # 3. Create appointment
    appointment = Appointment(
        slot_id=slot_id,
        faculty_id=faculty_id,
        student_id=student_id,
        appointment_date=appointment_date,
        start_time=start_time,
        end_time=end_time,
        status=AppointmentStatus.CONFIRMED,
        notes=notes
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment
