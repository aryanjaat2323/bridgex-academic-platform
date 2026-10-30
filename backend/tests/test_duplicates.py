import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.models import User, UserRole, Department, Course, Subject, Doubt, DoubtStatus, DoubtUrgency
from app.services.similarity_service import tokenize, calculate_jaccard_similarity, find_similar_doubts

def test_tokenization_and_jaccard():
    t1 = tokenize("How does binary search work on sorted array?")
    t2 = tokenize("Explain binary search algorithm in sorted arrays")
    assert "binary" in t1
    assert "search" in t1
    assert "how" not in t1 # stopword
    
    score = calculate_jaccard_similarity(t1, t2)
    assert score > 0.4

def test_find_similar_doubts():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    dept = Department(name="CSE", code="CSE")
    session.add(dept)
    session.commit()
    course = Course(department_id=dept.id, name="B.Tech", code="BT")
    session.add(course)
    session.commit()
    subject = Subject(course_id=course.id, name="Algorithms", code="CS201")
    session.add(subject)
    session.commit()

    student = User(email="s@test.edu", hashed_password="pw", full_name="Student", role=UserRole.STUDENT)
    session.add(student)
    session.commit()

    d1 = Doubt(
        reference_id="BX-1001",
        student_id=student.id,
        subject_id=subject.id,
        topic="Dynamic Programming",
        title="Longest Common Subsequence recursion vs tabulation",
        description="Explaining memoization table",
        urgency=DoubtUrgency.NORMAL,
        status=DoubtStatus.RESOLVED
    )
    d2 = Doubt(
        reference_id="BX-1002",
        student_id=student.id,
        subject_id=subject.id,
        topic="Sorting",
        title="MergeSort space complexity auxiliary array",
        description="Why MergeSort needs O(n) space",
        urgency=DoubtUrgency.NORMAL,
        status=DoubtStatus.PENDING
    )
    session.add_all([d1, d2])
    session.commit()

    matches = find_similar_doubts(
        db=session,
        title="Longest Common Subsequence memoization",
        topic="Dynamic Programming",
        subject_id=subject.id
    )

    assert len(matches) >= 1
    assert matches[0]["id"] == d1.id
    assert matches[0]["similarity_score"] > 0.3
    session.close()
