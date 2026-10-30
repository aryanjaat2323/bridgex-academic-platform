from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

# Auth & User
class UserBase(BaseModel):
    email: str
    full_name: str
    role: str
    department_id: Optional[int] = None
    roll_number: Optional[str] = None
    employee_id: Optional[str] = None
    section: Optional[str] = "A"
    office_room: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    department_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

# Academic
class DepartmentOut(BaseModel):
    id: int
    name: str
    code: str
    hod_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class CourseOut(BaseModel):
    id: int
    department_id: int
    name: str
    code: str
    model_config = ConfigDict(from_attributes=True)

class SubjectOut(BaseModel):
    id: int
    course_id: int
    name: str
    code: str
    semester: int
    course_name: Optional[str] = None
    department_name: Optional[str] = None
    assigned_faculty_name: Optional[str] = None
    assigned_faculty_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

# Doubt
class DoubtCreate(BaseModel):
    subject_id: int
    topic: str
    title: str
    description: str
    urgency: str = "normal"  # normal, important, deadline_approaching
    context_notes: Optional[str] = None
    attachment_url: Optional[str] = None

class DoubtStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = None

class DoubtResponseCreate(BaseModel):
    content: str
    attachment_url: Optional[str] = None
    is_faculty_answer: bool = False
    publish_to_repo: bool = False

class DoubtResponseOut(BaseModel):
    id: int
    doubt_id: int
    author_id: int
    author_name: str
    author_role: str
    author_avatar: Optional[str] = None
    content: str
    attachment_url: Optional[str] = None
    is_faculty_answer: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TimelineAuditOut(BaseModel):
    id: int
    previous_status: str
    new_status: str
    changed_by_name: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class DoubtOut(BaseModel):
    id: int
    reference_id: str
    student_id: int
    student_name: str
    student_roll: Optional[str] = None
    assigned_faculty_id: Optional[int] = None
    faculty_name: Optional[str] = None
    subject_id: int
    subject_name: str
    subject_code: str
    topic: str
    title: str
    description: str
    context_notes: Optional[str] = None
    urgency: str
    status: str
    is_escalated: bool
    escalated_at: Optional[datetime] = None
    escalation_reason: Optional[str] = None
    is_published: bool
    upvotes: int
    attachment_url: Optional[str] = None
    merged_into_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    response_count: int = 0
    average_rating: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)

class DoubtDetailOut(DoubtOut):
    responses: List[DoubtResponseOut] = []
    timeline: List[TimelineAuditOut] = []

# Duplicates
class DuplicateMatchOut(BaseModel):
    id: int
    reference_id: str
    title: str
    topic: str
    status: str
    similarity_score: float
    has_answer: bool
    answer_preview: Optional[str] = None

class DoubtMergeRequest(BaseModel):
    primary_doubt_id: int
    merged_doubt_id: int
    notes: Optional[str] = None

# Solved Repository
class RatingCreate(BaseModel):
    rating: int  # 1-5
    feedback: Optional[str] = None

# Office Hours
class OfficeHourSlotCreate(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str
    slot_duration_minutes: int = 20

class OfficeHourSlotOut(BaseModel):
    id: int
    faculty_id: int
    faculty_name: str
    day_of_week: str
    start_time: str
    end_time: str
    slot_duration_minutes: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class AppointmentCreate(BaseModel):
    slot_id: Optional[int] = None
    faculty_id: int
    appointment_date: str # YYYY-MM-DD
    start_time: str       # HH:MM
    end_time: str         # HH:MM
    notes: Optional[str] = None

class AppointmentOut(BaseModel):
    id: int
    faculty_id: int
    faculty_name: str
    faculty_office: Optional[str] = None
    student_id: int
    student_name: str
    student_roll: Optional[str] = None
    appointment_date: str
    start_time: str
    end_time: str
    status: str
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Notifications
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    link_url: Optional[str] = None
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Forward Doubt by CR
class ForwardDoubtRequest(BaseModel):
    doubt_id: int
    target_faculty_id: int
    cr_note: Optional[str] = None
