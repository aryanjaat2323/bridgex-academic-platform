from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import OfficeHourSlot, Appointment, AppointmentStatus, User, UserRole
from app.schemas.schemas import OfficeHourSlotCreate, OfficeHourSlotOut, AppointmentCreate, AppointmentOut
from app.services.booking_service import book_appointment, check_slot_availability
from app.services.notification_service import send_notification

router = APIRouter(prefix="/office-hours", tags=["Office Hours & Appointments"])

@router.post("/slots", response_model=OfficeHourSlotOut)
def create_slot(
    slot_in: OfficeHourSlotCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.FACULTY, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only faculty can set office hour slots.")

    new_slot = OfficeHourSlot(
        faculty_id=current_user.id,
        day_of_week=slot_in.day_of_week,
        start_time=slot_in.start_time,
        end_time=slot_in.end_time,
        slot_duration_minutes=slot_in.slot_duration_minutes,
        is_active=True
    )
    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)

    return OfficeHourSlotOut(
        id=new_slot.id,
        faculty_id=new_slot.faculty_id,
        faculty_name=current_user.full_name,
        day_of_week=new_slot.day_of_week,
        start_time=new_slot.start_time,
        end_time=new_slot.end_time,
        slot_duration_minutes=new_slot.slot_duration_minutes,
        is_active=new_slot.is_active
    )

@router.get("/slots", response_model=List[OfficeHourSlotOut])
def get_my_slots(
    faculty_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_faculty_id = faculty_id or (current_user.id if current_user.role == UserRole.FACULTY else None)
    query = db.query(OfficeHourSlot).filter(OfficeHourSlot.is_active == True)
    if target_faculty_id:
        query = query.filter(OfficeHourSlot.faculty_id == target_faculty_id)

    slots = query.all()
    out = []
    for s in slots:
        out.append(OfficeHourSlotOut(
            id=s.id,
            faculty_id=s.faculty_id,
            faculty_name=s.faculty.full_name if s.faculty else "Faculty",
            day_of_week=s.day_of_week,
            start_time=s.start_time,
            end_time=s.end_time,
            slot_duration_minutes=s.slot_duration_minutes,
            is_active=s.is_active
        ))
    return out

@router.post("/book", response_model=AppointmentOut)
def book_faculty_slot(
    booking_in: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.STUDENT, UserRole.CR]:
        raise HTTPException(status_code=403, detail="Only students and CRs can book office-hour appointments.")

    faculty = db.query(User).filter(User.id == booking_in.faculty_id, User.role == UserRole.FACULTY).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty member not found")

    appointment = book_appointment(
        db=db,
        student_id=current_user.id,
        faculty_id=faculty.id,
        appointment_date=booking_in.appointment_date,
        start_time=booking_in.start_time,
        end_time=booking_in.end_time,
        slot_id=booking_in.slot_id,
        notes=booking_in.notes
    )

    # Notify faculty
    send_notification(
        db,
        recipient_id=faculty.id,
        title="New Office-Hour Appointment Booked",
        message=f"{current_user.full_name} booked a consultation slot on {appointment.appointment_date} at {appointment.start_time} - {appointment.end_time}.",
        type="booking",
        link_url="/faculty/appointments"
    )

    # Notify student confirmation
    send_notification(
        db,
        recipient_id=current_user.id,
        title="Appointment Confirmed",
        message=f"Consultation with {faculty.full_name} confirmed for {appointment.appointment_date} at {appointment.start_time}.",
        type="booking",
        link_url="/student/appointments"
    )

    return AppointmentOut(
        id=appointment.id,
        faculty_id=faculty.id,
        faculty_name=faculty.full_name,
        faculty_office=faculty.office_room,
        student_id=current_user.id,
        student_name=current_user.full_name,
        student_roll=current_user.roll_number,
        appointment_date=appointment.appointment_date,
        start_time=appointment.start_time,
        end_time=appointment.end_time,
        status=appointment.status,
        notes=appointment.notes,
        cancellation_reason=appointment.cancellation_reason,
        created_at=appointment.created_at
    )

@router.get("/appointments", response_model=List[AppointmentOut])
def get_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)
    if current_user.role == UserRole.STUDENT or current_user.role == UserRole.CR:
        query = query.filter(Appointment.student_id == current_user.id)
    elif current_user.role == UserRole.FACULTY:
        query = query.filter(Appointment.faculty_id == current_user.id)

    appts = query.order_by(Appointment.appointment_date.desc(), Appointment.start_time.asc()).all()
    out = []
    for a in appts:
        out.append(AppointmentOut(
            id=a.id,
            faculty_id=a.faculty_id,
            faculty_name=a.faculty.full_name if a.faculty else "Faculty",
            faculty_office=a.faculty.office_room if a.faculty else None,
            student_id=a.student_id,
            student_name=a.student.full_name if a.student else "Student",
            student_roll=a.student.roll_number if a.student else None,
            appointment_date=a.appointment_date,
            start_time=a.start_time,
            end_time=a.end_time,
            status=a.status,
            notes=a.notes,
            cancellation_reason=a.cancellation_reason,
            created_at=a.created_at
        ))
    return out

@router.patch("/appointments/{id}/cancel", response_model=AppointmentOut)
def cancel_appointment(
    id: int,
    reason: Optional[str] = "Cancelled by user",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appt = db.query(Appointment).filter(Appointment.id == id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.id not in [appt.student_id, appt.faculty_id] and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this appointment")

    appt.status = AppointmentStatus.CANCELLED
    appt.cancellation_reason = reason
    db.commit()

    # Notify counterparty
    counterparty_id = appt.faculty_id if current_user.id == appt.student_id else appt.student_id
    send_notification(
        db,
        recipient_id=counterparty_id,
        title="Appointment Cancelled",
        message=f"Consultation scheduled on {appt.appointment_date} at {appt.start_time} was cancelled by {current_user.full_name}. Reason: {reason}",
        type="booking_cancelled",
        link_url="/appointments"
    )

    return AppointmentOut(
        id=appt.id,
        faculty_id=appt.faculty_id,
        faculty_name=appt.faculty.full_name if appt.faculty else "Faculty",
        faculty_office=appt.faculty.office_room if appt.faculty else None,
        student_id=appt.student_id,
        student_name=appt.student.full_name if appt.student else "Student",
        student_roll=appt.student.roll_number if appt.student else None,
        appointment_date=appt.appointment_date,
        start_time=appt.start_time,
        end_time=appt.end_time,
        status=appt.status,
        notes=appt.notes,
        cancellation_reason=appt.cancellation_reason,
        created_at=appt.created_at
    )
