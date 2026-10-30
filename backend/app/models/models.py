import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    CR = "cr"
    ADMIN = "admin"

class DoubtUrgency(str, enum.Enum):
    NORMAL = "normal"
    IMPORTANT = "important"
    DEADLINE_APPROACHING = "deadline_approaching"

class DoubtStatus(str, enum.Enum):
    PENDING = "pending"
    SEEN = "seen"
    QUEUED = "queued"
    ANSWERED = "answered"
    RESOLVED = "resolved"

class AppointmentStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    hod_name = Column(String(100), nullable=True)

    courses = relationship("Course", back_populates="department")
    users = relationship("User", back_populates="department")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    name = Column(String(120), nullable=False)
    code = Column(String(30), unique=True, nullable=False)

    department = relationship("Department", back_populates="courses")
    subjects = relationship("Subject", back_populates="course")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    name = Column(String(120), nullable=False)
    code = Column(String(30), unique=True, nullable=False)
    semester = Column(Integer, default=1)

    course = relationship("Course", back_populates="subjects")
    assignments = relationship("FacultySubjectAssignment", back_populates="subject")
    doubts = relationship("Doubt", back_populates="subject")

class FacultySubjectAssignment(Base):
    __tablename__ = "faculty_subject_assignments"
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    section = Column(String(10), default="A")

    faculty = relationship("User", back_populates="assignments")
    subject = relationship("Subject", back_populates="assignments")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False)
    role = Column(String(20), default=UserRole.STUDENT, nullable=False)
    avatar_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Department & academic details
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    roll_number = Column(String(50), nullable=True)  # for student / CR
    employee_id = Column(String(50), nullable=True)  # for faculty
    section = Column(String(10), default="A")        # class section
    office_room = Column(String(50), nullable=True)   # for faculty
    
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="users")
    assignments = relationship("FacultySubjectAssignment", back_populates="faculty")
    doubts_raised = relationship("Doubt", foreign_keys="Doubt.student_id", back_populates="student")
    doubts_assigned = relationship("Doubt", foreign_keys="Doubt.assigned_faculty_id", back_populates="assigned_faculty")
    notifications = relationship("Notification", back_populates="recipient")
    slots = relationship("OfficeHourSlot", back_populates="faculty")

class Doubt(Base):
    __tablename__ = "doubts"
    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String(30), unique=True, index=True, nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_faculty_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    
    topic = Column(String(150), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    context_notes = Column(Text, nullable=True)
    
    urgency = Column(String(30), default=DoubtUrgency.NORMAL, nullable=False)
    status = Column(String(30), default=DoubtStatus.PENDING, nullable=False)
    
    # Automated 48-Hour Escalation tracking
    is_escalated = Column(Boolean, default=False)
    escalated_at = Column(DateTime, nullable=True)
    escalation_reason = Column(String(255), nullable=True)
    
    # Solved Repository publication
    is_published = Column(Boolean, default=False)
    upvotes = Column(Integer, default=0)
    
    # Attachments
    attachment_url = Column(String(255), nullable=True)
    
    # Merged duplicate reference
    merged_into_id = Column(Integer, ForeignKey("doubts.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id], back_populates="doubts_raised")
    assigned_faculty = relationship("User", foreign_keys=[assigned_faculty_id], back_populates="doubts_assigned")
    subject = relationship("Subject", back_populates="doubts")
    
    responses = relationship("DoubtResponse", back_populates="doubt", cascade="all, delete-orphan")
    timeline_audits = relationship("DoubtTimelineAudit", back_populates="doubt", cascade="all, delete-orphan")
    ratings = relationship("SolvedDoubtRating", back_populates="doubt", cascade="all, delete-orphan")

class DoubtTimelineAudit(Base):
    __tablename__ = "doubt_timeline_audit"
    id = Column(Integer, primary_key=True, index=True)
    doubt_id = Column(Integer, ForeignKey("doubts.id"), nullable=False)
    previous_status = Column(String(30), nullable=False)
    new_status = Column(String(30), nullable=False)
    changed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    doubt = relationship("Doubt", back_populates="timeline_audits")

class DoubtResponse(Base):
    __tablename__ = "doubt_responses"
    id = Column(Integer, primary_key=True, index=True)
    doubt_id = Column(Integer, ForeignKey("doubts.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    attachment_url = Column(String(255), nullable=True)
    is_faculty_answer = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    doubt = relationship("Doubt", back_populates="responses")
    author = relationship("User")

class MergedDoubt(Base):
    __tablename__ = "merged_doubts"
    id = Column(Integer, primary_key=True, index=True)
    primary_doubt_id = Column(Integer, ForeignKey("doubts.id"), nullable=False)
    merged_doubt_id = Column(Integer, ForeignKey("doubts.id"), nullable=False)
    merged_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class OfficeHourSlot(Base):
    __tablename__ = "office_hour_slots"
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day_of_week = Column(String(20), nullable=False)  # Monday, Tuesday, etc.
    start_time = Column(String(10), nullable=False)   # "14:00"
    end_time = Column(String(10), nullable=False)     # "16:00"
    slot_duration_minutes = Column(Integer, default=20)
    is_active = Column(Boolean, default=True)

    faculty = relationship("User", back_populates="slots")
    appointments = relationship("Appointment", back_populates="slot")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    slot_id = Column(Integer, ForeignKey("office_hour_slots.id"), nullable=True)
    faculty_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    appointment_date = Column(String(20), nullable=False) # "YYYY-MM-DD"
    start_time = Column(String(10), nullable=False)       # "14:00"
    end_time = Column(String(10), nullable=False)         # "14:20"
    status = Column(String(30), default=AppointmentStatus.CONFIRMED, nullable=False)
    notes = Column(Text, nullable=True)
    cancellation_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    slot = relationship("OfficeHourSlot", back_populates="appointments")
    faculty = relationship("User", foreign_keys=[faculty_id])
    student = relationship("User", foreign_keys=[student_id])

class SolvedDoubtRating(Base):
    __tablename__ = "solved_doubt_ratings"
    id = Column(Integer, primary_key=True, index=True)
    doubt_id = Column(Integer, ForeignKey("doubts.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False) # 1 to 5
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    doubt = relationship("Doubt", back_populates="ratings")
    student = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="general")
    link_url = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    recipient = relationship("User", back_populates="notifications")
