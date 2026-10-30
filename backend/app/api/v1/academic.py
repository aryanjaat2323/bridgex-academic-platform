from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Department, Course, Subject, FacultySubjectAssignment, User, UserRole
from app.schemas.schemas import DepartmentOut, CourseOut, SubjectOut, UserOut

router = APIRouter(prefix="/academic", tags=["Academic"])

@router.get("/departments", response_model=List[DepartmentOut])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.get("/courses", response_model=List[CourseOut])
def get_courses(department_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Course)
    if department_id:
        query = query.filter(Course.department_id == department_id)
    return query.all()

@router.get("/subjects", response_model=List[SubjectOut])
def get_subjects(course_id: int = None, semester: int = None, db: Session = Depends(get_db)):
    query = db.query(Subject)
    if course_id:
        query = query.filter(Subject.course_id == course_id)
    if semester:
        query = query.filter(Subject.semester == semester)
        
    subjects = query.all()
    out = []
    for s in subjects:
        # Find assigned faculty
        assignment = db.query(FacultySubjectAssignment).filter(FacultySubjectAssignment.subject_id == s.id).first()
        faculty_name = assignment.faculty.full_name if assignment and assignment.faculty else None
        faculty_id = assignment.faculty_id if assignment else None
        
        s_out = SubjectOut(
            id=s.id,
            course_id=s.course_id,
            name=s.name,
            code=s.code,
            semester=s.semester,
            course_name=s.course.name if s.course else None,
            department_name=s.course.department.name if s.course and s.course.department else None,
            assigned_faculty_name=faculty_name,
            assigned_faculty_id=faculty_id
        )
        out.append(s_out)
    return out

@router.get("/faculty", response_model=List[UserOut])
def get_faculty_directory(department_id: int = None, db: Session = Depends(get_db)):
    query = db.query(User).filter(User.role == UserRole.FACULTY, User.is_active == True)
    if department_id:
        query = query.filter(User.department_id == department_id)
    faculty_members = query.all()
    
    out = []
    for f in faculty_members:
        u_out = UserOut.from_orm(f)
        if f.department:
            u_out.department_name = f.department.name
        out.append(u_out)
    return out
