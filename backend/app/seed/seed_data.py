from datetime import datetime, timedelta
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    Department, Course, Subject, FacultySubjectAssignment,
    User, UserRole, Doubt, DoubtUrgency, DoubtStatus, DoubtResponse,
    DoubtTimelineAudit, OfficeHourSlot, Appointment, AppointmentStatus,
    SolvedDoubtRating, Notification
)

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already contains data, skipping seed.")
        db.close()
        return

    print("Seeding BridgeX academic SaaS database...")

    # 1. Departments
    dept_cs = Department(name="Computer Science & Engineering", code="CSE", hod_name="Dr. K. Venkat")
    dept_ec = Department(name="Electronics & Communication", code="ECE", hod_name="Dr. S. Mukherjee")
    db.add_all([dept_cs, dept_ec])
    db.commit()

    # 2. Courses
    course_btech = Course(department_id=dept_cs.id, name="B.Tech Computer Science", code="BT-CSE")
    course_bca = Course(department_id=dept_cs.id, name="Bachelor of Computer Applications", code="BCA")
    db.add_all([course_btech, course_bca])
    db.commit()

    # 3. Subjects
    sub_dsa = Subject(course_id=course_btech.id, name="Data Structures & Algorithms", code="CS201", semester=3)
    sub_os = Subject(course_id=course_btech.id, name="Operating Systems", code="CS301", semester=4)
    sub_dbms = Subject(course_id=course_btech.id, name="Database Management Systems", code="CS302", semester=4)
    sub_cn = Subject(course_id=course_btech.id, name="Computer Networks", code="CS401", semester=5)
    db.add_all([sub_dsa, sub_os, sub_dbms, sub_cn])
    db.commit()

    hashed_pw = get_password_hash("password123")

    # 4. Users for all 4 roles
    admin_user = User(
        email="admin@bridgex.edu",
        hashed_password=hashed_pw,
        full_name="Dr. K. Venkat (HOD)",
        role=UserRole.ADMIN,
        department_id=dept_cs.id,
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=KV"
    )
    faculty_priya = User(
        email="faculty@bridgex.edu",
        hashed_password=hashed_pw,
        full_name="Dr. Priya Raman",
        role=UserRole.FACULTY,
        department_id=dept_cs.id,
        employee_id="FAC-082",
        office_room="Block B - Room 304",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=PR"
    )
    faculty_rajesh = User(
        email="faculty2@bridgex.edu",
        hashed_password=hashed_pw,
        full_name="Prof. Rajesh Nair",
        role=UserRole.FACULTY,
        department_id=dept_cs.id,
        employee_id="FAC-114",
        office_room="Block B - Room 310",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=RN"
    )
    student_cr = User(
        email="cr@bridgex.edu",
        hashed_password=hashed_pw,
        full_name="Tanya Verma (CR)",
        role=UserRole.CR,
        department_id=dept_cs.id,
        roll_number="CS-2023-001",
        section="A",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=TV"
    )
    student_aarav = User(
        email="student@bridgex.edu",
        hashed_password=hashed_pw,
        full_name="Aarav Sharma",
        role=UserRole.STUDENT,
        department_id=dept_cs.id,
        roll_number="CS-2023-042",
        section="A",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=AS"
    )
    student_sneha = User(
        email="sneha@bridgex.edu",
        hashed_password=hashed_pw,
        full_name="Sneha Patel",
        role=UserRole.STUDENT,
        department_id=dept_cs.id,
        roll_number="CS-2023-068",
        section="A",
        avatar_url="https://api.dicebear.com/7.x/initials/svg?seed=SP"
    )
    db.add_all([admin_user, faculty_priya, faculty_rajesh, student_cr, student_aarav, student_sneha])
    db.commit()

    # 5. Faculty Subject Assignments
    assign_dsa = FacultySubjectAssignment(faculty_id=faculty_priya.id, subject_id=sub_dsa.id, section="A")
    assign_os = FacultySubjectAssignment(faculty_id=faculty_priya.id, subject_id=sub_os.id, section="A")
    assign_dbms = FacultySubjectAssignment(faculty_id=faculty_rajesh.id, subject_id=sub_dbms.id, section="A")
    assign_cn = FacultySubjectAssignment(faculty_id=faculty_rajesh.id, subject_id=sub_cn.id, section="A")
    db.add_all([assign_dsa, assign_os, assign_dbms, assign_cn])
    db.commit()

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
