from datetime import datetime, timedelta
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    Department, Course, Subject, FacultySubjectAssignment,
    User, UserRole, Doubt, DoubtUrgency, DoubtStatus, DoubtResponse,
    DoubtTimelineAudit, OfficeHourSlot, Appointment, AppointmentStatus,
    SolvedDoubtRating, Notification
)

def migrate_columns_if_needed():
    """Ensure existing SQLite tables have all columns expected by SQLAlchemy models."""
    from sqlalchemy import text
    with engine.connect() as conn:
        migrations = [
            ("doubts", "merged_into_id", "INTEGER REFERENCES doubts(id)"),
            ("doubt_responses", "attachment_url", "VARCHAR(255)"),
            ("merged_doubts", "created_at", "DATETIME"),
            ("appointments", "cancellation_reason", "VARCHAR(255)"),
        ]
        for tbl, col, col_def in migrations:
            try:
                res = conn.execute(text(f"PRAGMA table_info({tbl});")).fetchall()
                existing_cols = [r[1] for r in res]
                if existing_cols and col not in existing_cols:
                    conn.execute(text(f"ALTER TABLE {tbl} ADD COLUMN {col} {col_def};"))
                    conn.commit()
            except Exception:
                pass

def init_db():
    Base.metadata.create_all(bind=engine)
    migrate_columns_if_needed()
    db = SessionLocal()

    print("Checking and seeding BridgeX academic SaaS database...")

    # Helper get-or-create functions for idempotency
    def get_or_create_dept(name: str, code: str, hod_name: str):
        dept = db.query(Department).filter(Department.code == code).first()
        if not dept:
            dept = Department(name=name, code=code, hod_name=hod_name)
            db.add(dept)
            db.commit()
            db.refresh(dept)
        return dept

    def get_or_create_course(dept_id: int, name: str, code: str):
        c = db.query(Course).filter(Course.code == code).first()
        if not c:
            c = Course(department_id=dept_id, name=name, code=code)
            db.add(c)
            db.commit()
            db.refresh(c)
        return c

    def get_or_create_subject(course_id: int, name: str, code: str, semester: int):
        s = db.query(Subject).filter(Subject.code == code).first()
        if not s:
            s = Subject(course_id=course_id, name=name, code=code, semester=semester)
            db.add(s)
            db.commit()
            db.refresh(s)
        return s

    # 1. Departments
    dept_cs = get_or_create_dept("Computer Science & Engineering", "CSE", "Dr. K. Venkat")
    dept_ec = get_or_create_dept("Electronics & Communication", "ECE", "Dr. S. Mukherjee")

    # 2. Courses
    course_btech = get_or_create_course(dept_cs.id, "B.Tech Computer Science", "BT-CSE")
    course_bca = get_or_create_course(dept_cs.id, "Bachelor of Computer Applications", "BCA")

    # 3. Subjects
    sub_dsa = get_or_create_subject(course_btech.id, "Data Structures & Algorithms", "CS201", 3)
    sub_os = get_or_create_subject(course_btech.id, "Operating Systems", "CS301", 4)
    sub_dbms = get_or_create_subject(course_btech.id, "Database Management Systems", "CS302", 4)
    sub_cn = get_or_create_subject(course_btech.id, "Computer Networks", "CS401", 5)

    hashed_pw = get_password_hash("password123")

    # 4. Users for all 4 roles (idempotent)
    def get_or_create_user(email, full_name, role, dept_id, roll_number=None, employee_id=None, section="A", office_room=None, avatar_url=None):
        u = db.query(User).filter(User.email == email).first()
        if not u:
            u = User(
                email=email,
                hashed_password=hashed_pw,
                full_name=full_name,
                role=role,
                department_id=dept_id,
                roll_number=roll_number,
                employee_id=employee_id,
                section=section,
                office_room=office_room,
                avatar_url=avatar_url,
                is_active=True
            )
            db.add(u)
            db.commit()
            db.refresh(u)
        else:
            u.is_active = True
            u.hashed_password = hashed_pw
            u.role = role
            u.full_name = full_name
            db.commit()
            db.refresh(u)
        return u

    admin_user = get_or_create_user(
        email="admin@bridgex.edu",
        full_name="Dr. K. Venkat (HOD)",
        role=UserRole.ADMIN,
        dept_id=dept_cs.id,
        employee_id="EMP-HOD",
        office_room="Block A - 101",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=KV"
    )
    faculty_priya = get_or_create_user(
        email="faculty@bridgex.edu",
        full_name="Dr. Priya Raman",
        role=UserRole.FACULTY,
        dept_id=dept_cs.id,
        employee_id="FAC-082",
        office_room="Block B - Room 304",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=PR"
    )
    faculty_rajesh = get_or_create_user(
        email="faculty2@bridgex.edu",
        full_name="Prof. Rajesh Nair",
        role=UserRole.FACULTY,
        dept_id=dept_cs.id,
        employee_id="FAC-114",
        office_room="Block B - Room 310",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=RN"
    )
    student_cr = get_or_create_user(
        email="cr@bridgex.edu",
        full_name="Tanya Verma (CR)",
        role=UserRole.CR,
        dept_id=dept_cs.id,
        roll_number="CS-2023-001",
        section="A",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=TV"
    )
    student_aarav = get_or_create_user(
        email="student@bridgex.edu",
        full_name="Aarav Sharma",
        role=UserRole.STUDENT,
        dept_id=dept_cs.id,
        roll_number="CS-2023-042",
        section="A",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=AS"
    )
    student_sneha = get_or_create_user(
        email="sneha@bridgex.edu",
        full_name="Sneha Patel",
        role=UserRole.STUDENT,
        dept_id=dept_cs.id,
        roll_number="CS-2023-068",
        section="A",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=SP"
    )

    # 5. Faculty Subject Assignments
    def get_or_create_assignment(faculty_id, subject_id, section="A"):
        a = db.query(FacultySubjectAssignment).filter(
            FacultySubjectAssignment.faculty_id == faculty_id,
            FacultySubjectAssignment.subject_id == subject_id,
            FacultySubjectAssignment.section == section
        ).first()
        if not a:
            a = FacultySubjectAssignment(faculty_id=faculty_id, subject_id=subject_id, section=section)
            db.add(a)
            db.commit()
            db.refresh(a)
        return a

    get_or_create_assignment(faculty_priya.id, sub_dsa.id, "A")
    get_or_create_assignment(faculty_priya.id, sub_os.id, "A")
    get_or_create_assignment(faculty_rajesh.id, sub_dbms.id, "A")
    get_or_create_assignment(faculty_rajesh.id, sub_cn.id, "A")

    # If doubts already exist, skip seed for content
    if db.query(Doubt).first():
        print("Database content (doubts/appointments) already seeded, verified demo users.")
        db.close()
        return

    # 6. Doubts with diverse lifecycle states
    now = datetime.utcnow()
    
    # Resolved doubt (in Solved Repository)
    d1 = Doubt(
        reference_id="BX-2026-1011",
        student_id=student_aarav.id,
        assigned_faculty_id=faculty_priya.id,
        subject_id=sub_dsa.id,
        topic="Graph Algorithms",
        title="Dijkstra's shortest path time complexity with Binary Heap vs Fibonacci Heap",
        description="Could you please explain why Fibonacci heap improves Dijkstra's complexity to O(E + V log V) compared to O((E + V) log V) with a standard binary heap?",
        urgency=DoubtUrgency.NORMAL,
        status=DoubtStatus.RESOLVED,
        is_published=True,
        upvotes=18,
        created_at=now - timedelta(days=4)
    )
    db.add(d1)
    db.commit()

    # Responses for d1
    r1 = DoubtResponse(
        doubt_id=d1.id,
        author_id=faculty_priya.id,
        content="Great question Aarav! In Dijkstra's algorithm, we perform Extract-Min V times and Decrease-Key at most E times.\n\n1. With a Binary Heap:\n- Extract-Min: O(log V)\n- Decrease-Key: O(log V)\nTotal time = O(V log V + E log V) = O((V + E) log V).\n\n2. With a Fibonacci Heap:\n- Extract-Min: amortized O(log V)\n- Decrease-Key: amortized O(1) constant time!\nTotal time = O(V log V + E * 1) = O(E + V log V).\n\nFor dense graphs where E is close to V^2, Fibonacci heap reduces the runtime significantly from O(V^2 log V) to O(V^2).",
        is_faculty_answer=True,
        created_at=now - timedelta(days=3, hours=22)
    )
    db.add(r1)

    # Rating for d1
    rating1 = SolvedDoubtRating(
        doubt_id=d1.id,
        student_id=student_aarav.id,
        rating=5,
        feedback="Clear explanation with asymptotic breakdown!"
    )
    db.add(rating1)

    # Audits for d1
    audit1_1 = DoubtTimelineAudit(
        doubt_id=d1.id,
        previous_status="none",
        new_status=DoubtStatus.PENDING,
        changed_by_user_id=student_aarav.id,
        reason="Doubt submitted",
        created_at=now - timedelta(days=4)
    )
    audit1_2 = DoubtTimelineAudit(
        doubt_id=d1.id,
        previous_status=DoubtStatus.PENDING,
        new_status=DoubtStatus.ANSWERED,
        changed_by_user_id=faculty_priya.id,
        reason="Faculty posted verified explanation",
        created_at=now - timedelta(days=3, hours=22)
    )
    audit1_3 = DoubtTimelineAudit(
        doubt_id=d1.id,
        previous_status=DoubtStatus.ANSWERED,
        new_status=DoubtStatus.RESOLVED,
        changed_by_user_id=faculty_priya.id,
        reason="Marked resolved and published to repository",
        created_at=now - timedelta(days=3, hours=20)
    )
    db.add_all([audit1_1, audit1_2, audit1_3])

    # Answered Doubt
    d2 = Doubt(
        reference_id="BX-2026-1012",
        student_id=student_sneha.id,
        assigned_faculty_id=faculty_priya.id,
        subject_id=sub_os.id,
        topic="Memory Management",
        title="Thrashing mitigation in demand paging using working set model",
        description="How does the operating system detect thrashing when page fault frequency rises, and how does the working set strategy prevent process starvation?",
        urgency=DoubtUrgency.IMPORTANT,
        status=DoubtStatus.ANSWERED,
        is_published=True,
        upvotes=9,
        created_at=now - timedelta(days=2)
    )
    db.add(d2)
    db.commit()

    r2 = DoubtResponse(
        doubt_id=d2.id,
        author_id=faculty_priya.id,
        content="When page-fault frequency exceeds the upper bound, the OS swaps out an entire process to free frame allocations for remaining processes, maintaining the working set window.",
        is_faculty_answer=True,
        created_at=now - timedelta(days=1, hours=18)
    )
    db.add(r2)

    audit2 = DoubtTimelineAudit(
        doubt_id=d2.id,
        previous_status=DoubtStatus.PENDING,
        new_status=DoubtStatus.ANSWERED,
        changed_by_user_id=faculty_priya.id,
        reason="Explanation provided by Dr. Priya",
        created_at=now - timedelta(days=1, hours=18)
    )
    db.add(audit2)

    # Queued Doubt (Urgent)
    d3 = Doubt(
        reference_id="BX-2026-1013",
        student_id=student_aarav.id,
        assigned_faculty_id=faculty_rajesh.id,
        subject_id=sub_dbms.id,
        topic="Indexing",
        title="B+ Tree leaf node linked list traversal in range queries",
        description="For assignment 2: why is a B+ Tree preferred over a regular B-Tree when executing SQL queries with BETWEEN operators or range scans?",
        urgency=DoubtUrgency.DEADLINE_APPROACHING,
        status=DoubtStatus.QUEUED,
        created_at=now - timedelta(hours=14)
    )
    db.add(d3)
    db.commit()

    audit3 = DoubtTimelineAudit(
        doubt_id=d3.id,
        previous_status=DoubtStatus.PENDING,
        new_status=DoubtStatus.QUEUED,
        changed_by_user_id=faculty_rajesh.id,
        reason="Prioritized for evening queue review",
        created_at=now - timedelta(hours=10)
    )
    db.add(audit3)

    # Pending Doubt
    d4 = Doubt(
        reference_id="BX-2026-1014",
        student_id=student_aarav.id,
        assigned_faculty_id=faculty_priya.id,
        subject_id=sub_dsa.id,
        topic="Balanced Trees",
        title="Double rotation order in AVL trees: Left-Right vs Right-Left",
        description="I am confused about the order of pivot rotations when an insertion occurs in the right subtree of the left child.",
        urgency=DoubtUrgency.NORMAL,
        status=DoubtStatus.PENDING,
        created_at=now - timedelta(hours=4)
    )
    db.add(d4)
    db.commit()

    audit4 = DoubtTimelineAudit(
        doubt_id=d4.id,
        previous_status="none",
        new_status=DoubtStatus.PENDING,
        changed_by_user_id=student_aarav.id,
        reason="Doubt submitted by student",
        created_at=now - timedelta(hours=4)
    )
    db.add(audit4)

    # Escalated Doubt (older than 48 hours without response)
    d5 = Doubt(
        reference_id="BX-2026-1015",
        student_id=student_sneha.id,
        assigned_faculty_id=faculty_rajesh.id,
        subject_id=sub_cn.id,
        topic="Transport Layer Protocols",
        title="TCP TIME_WAIT 2MSL timer rationale in connection teardown",
        description="Why is TIME_WAIT state retained for 2 times Maximum Segment Lifetime before socket closure, and how does it prevent segment collision in subsequent connections?",
        urgency=DoubtUrgency.IMPORTANT,
        status=DoubtStatus.PENDING,
        is_escalated=True,
        escalated_at=now - timedelta(hours=3),
        escalation_reason="Unresolved SLA breach: exceeded 48 hours in pending state",
        created_at=now - timedelta(hours=54)
    )
    db.add(d5)
    db.commit()

    audit5_1 = DoubtTimelineAudit(
        doubt_id=d5.id,
        previous_status="none",
        new_status=DoubtStatus.PENDING,
        changed_by_user_id=student_sneha.id,
        reason="Initial student submission",
        created_at=now - timedelta(hours=54)
    )
    audit5_2 = DoubtTimelineAudit(
        doubt_id=d5.id,
        previous_status=DoubtStatus.PENDING,
        new_status=DoubtStatus.PENDING,
        changed_by_user_id=None,
        reason="Automated 48-hour SLA breach escalation",
        created_at=now - timedelta(hours=3)
    )
    db.add_all([audit5_1, audit5_2])

    # 7. Office Hour Slots
    slot_priya_wed = OfficeHourSlot(
        faculty_id=faculty_priya.id,
        day_of_week="Wednesday",
        start_time="14:00",
        end_time="16:00",
        slot_duration_minutes=20,
        is_active=True
    )
    slot_priya_fri = OfficeHourSlot(
        faculty_id=faculty_priya.id,
        day_of_week="Friday",
        start_time="10:00",
        end_time="12:00",
        slot_duration_minutes=20,
        is_active=True
    )
    slot_rajesh_thu = OfficeHourSlot(
        faculty_id=faculty_rajesh.id,
        day_of_week="Thursday",
        start_time="15:00",
        end_time="17:00",
        slot_duration_minutes=30,
        is_active=True
    )
    db.add_all([slot_priya_wed, slot_priya_fri, slot_rajesh_thu])
    db.commit()

    # Confirmed Appointment
    next_wed = (now + timedelta(days=(2 - now.weekday()) % 7 or 7)).strftime("%Y-%m-%d")
    appt1 = Appointment(
        slot_id=slot_priya_wed.id,
        faculty_id=faculty_priya.id,
        student_id=student_aarav.id,
        appointment_date=next_wed,
        start_time="14:00",
        end_time="14:20",
        status=AppointmentStatus.CONFIRMED,
        notes="Reviewing AVL tree balancing step-by-step on paper."
    )
    db.add(appt1)

    # 8. Notifications
    n1 = Notification(
        recipient_id=student_aarav.id,
        title="Doubt Resolved",
        message="Dr. Priya Raman answered and resolved your doubt BX-2026-1011.",
        type="doubt_status",
        link_url=f"/student/doubts/{d1.id}",
        is_read=True
    )
    n2 = Notification(
        recipient_id=student_aarav.id,
        title="Office Hour Confirmed",
        message=f"Consultation scheduled with Dr. Priya Raman on {next_wed} at 14:00.",
        type="booking",
        link_url="/student/appointments",
        is_read=False
    )
    n3 = Notification(
        recipient_id=faculty_priya.id,
        title="New Pending Doubt",
        message="Aarav Sharma submitted a doubt on AVL Tree rotation logic.",
        type="doubt_status",
        link_url=f"/faculty/queue?doubt={d4.id}",
        is_read=False
    )
    n4 = Notification(
        recipient_id=admin_user.id,
        title="48h SLA Escalation Alert",
        message=f"Doubt BX-2026-1015 exceeded the 48-hour response threshold and has been escalated.",
        type="escalation",
        link_url=f"/admin/escalations?doubt={d5.id}",
        is_read=False
    )
    db.add_all([n1, n2, n3, n4])

    db.commit()
    db.close()
    print("Seed data successfully created!")

if __name__ == "__main__":
    init_db()
