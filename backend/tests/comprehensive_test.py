import httpx
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"
PROXY_URL = "http://127.0.0.1:3000/api/v1"

client = httpx.Client(timeout=10.0)

results = {}

def run_test(name, func):
    try:
        func()
        print(f"[PASS] {name}")
        results[name] = "PASS"
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
        results[name] = f"FAIL: {e}"

print("==================================================")
print(" BridgeX Comprehensive Full-Stack Test Suite")
print("==================================================")

tokens = {}
users = {}

# --- PHASE 2: Test All 4 Demo Accounts ---
def test_demo_accounts():
    roles = ["student", "faculty", "cr", "admin"]
    for role in roles:
        # Test through Vite reverse proxy
        res = client.post(f"{PROXY_URL}/auth/demo-login/{role}")
        assert res.status_code == 200, f"Proxy demo login failed for {role}: {res.text}"
        data = res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["role"] == role
        tokens[role] = data["access_token"]
        users[role] = data["user"]
        
        # Verify /auth/me with the issued JWT
        me_res = client.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {tokens[role]}"}
        )
        assert me_res.status_code == 200, f"Token validation failed for {role}: {me_res.text}"
        assert me_res.json()["email"] == data["user"]["email"]

run_test("Phase 2: All 4 Demo Accounts & JWT Verification", test_demo_accounts)

# --- PHASE 3: Student Dashboard ---
created_doubt_id = None
booked_appt_id = None

def test_student_flow():
    global created_doubt_id, booked_appt_id
    headers = {"Authorization": f"Bearer {tokens['student']}"}

    # 1. Check duplicate detection
    dup_res = client.post(
        f"{BASE_URL}/duplicates/check",
        json={"title": "Dijkstra algorithm complexity", "topic": "Graph Algorithms", "subject_id": 1},
        headers=headers
    )
    assert dup_res.status_code == 200
    print(f"   -> Duplicate check returned {len(dup_res.json())} matches")

    # 2. Submit new doubt
    new_doubt_payload = {
        "subject_id": 1,
        "topic": "Dynamic Programming",
        "title": "Time complexity difference in Bottom-Up vs Memoization Fibonacci",
        "description": "Can someone explain whether bottom-up DP uses less call stack memory than top-down memoization?",
        "urgency": "important"
    }
    submit_res = client.post(f"{BASE_URL}/doubts", json=new_doubt_payload, headers=headers)
    assert submit_res.status_code == 200, f"Submit doubt failed: {submit_res.text}"
    doubt_data = submit_res.json()
    created_doubt_id = doubt_data["id"]
    assert doubt_data["status"] == "pending"
    assert doubt_data["reference_id"].startswith("BX-")
    print(f"   -> Created doubt ID {created_doubt_id} ({doubt_data['reference_id']})")

    # 3. View submitted doubts (my doubts)
    my_doubts_res = client.get(f"{BASE_URL}/doubts?mine_only=true", headers=headers)
    assert my_doubts_res.status_code == 200
    assert any(d["id"] == created_doubt_id for d in my_doubts_res.json())

    # 4. Track doubt detail and timeline
    detail_res = client.get(f"{BASE_URL}/doubts/{created_doubt_id}", headers=headers)
    assert detail_res.status_code == 200
    assert len(detail_res.json()["timeline"]) >= 1

    # 5. Book faculty office hours
    slots_res = client.get(f"{BASE_URL}/office-hours/slots?faculty_id={users['faculty']['id']}", headers=headers)
    assert slots_res.status_code == 200
    slots = slots_res.json()
    slot_id = slots[0]["id"] if slots else None

    book_res = client.post(
        f"{BASE_URL}/office-hours/book",
        json={
            "faculty_id": users['faculty']['id'],
            "slot_id": slot_id,
            "appointment_date": "2026-11-05",
            "start_time": "14:00",
            "end_time": "14:30",
            "notes": "Discuss DP Fibonacci call stack space complexity"
        },
        headers=headers
    )
    assert book_res.status_code == 200, f"Booking failed: {book_res.text}"
    booked_appt_id = book_res.json()["id"]
    print(f"   -> Booked appointment ID {booked_appt_id}")

    # 6. Check appointments list
    appts_res = client.get(f"{BASE_URL}/office-hours/appointments", headers=headers)
    assert appts_res.status_code == 200
    assert any(a["id"] == booked_appt_id for a in appts_res.json())

    # 7. Check student notifications
    notifs_res = client.get(f"{BASE_URL}/notifications", headers=headers)
    assert notifs_res.status_code == 200
    print(f"   -> Student notifications count: {len(notifs_res.json())}")

run_test("Phase 3: Student Flow (Submit, View, Track, Book Office Hours, Notifications)", test_student_flow)

# --- PHASE 4: Faculty Dashboard ---
def test_faculty_flow():
    global created_doubt_id
    headers = {"Authorization": f"Bearer {tokens['faculty']}"}

    # 1. View incoming doubts / pending queue
    queue_res = client.get(f"{BASE_URL}/doubts?status=pending", headers=headers)
    assert queue_res.status_code == 200
    assert any(d["id"] == created_doubt_id for d in queue_res.json())

    # 2. Update doubt status to "seen" / "queued"
    status_res = client.patch(
        f"{BASE_URL}/doubts/{created_doubt_id}/status",
        json={"status": "seen", "reason": "Faculty reviewed problem statement"},
        headers=headers
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "seen"

    # 3. Respond to student doubt and publish to solved repository
    resp_res = client.post(
        f"{BASE_URL}/doubts/{created_doubt_id}/responses",
        json={
            "content": "Top-down memoization requires O(N) auxiliary stack space for recursion frames, whereas bottom-up iterative DP uses O(1) space if only the previous two states are tracked.",
            "is_faculty_answer": True,
            "publish_to_repo": True
        },
        headers=headers
    )
    assert resp_res.status_code == 200
    assert resp_res.json()["is_faculty_answer"] is True

    # 4. Check doubt updated to answered and published
    check_res = client.get(f"{BASE_URL}/doubts/{created_doubt_id}", headers=headers)
    assert check_res.status_code == 200
    assert check_res.json()["status"] == "answered"
    assert check_res.json()["is_published"] is True

    # 5. Set office-hour availability slot
    slot_res = client.post(
        f"{BASE_URL}/office-hours/slots",
        json={
            "day_of_week": "Friday",
            "start_time": "15:00",
            "end_time": "16:00",
            "slot_duration_minutes": 20
        },
        headers=headers
    )
    assert slot_res.status_code == 200
    print(f"   -> Added faculty office hour slot ID {slot_res.json()['id']}")

    # 6. Faculty Workload & Analytics
    analytics_res = client.get(f"{BASE_URL}/analytics/faculty", headers=headers)
    assert analytics_res.status_code == 200
    assert "kpis" in analytics_res.json()

run_test("Phase 4: Faculty Flow (Queue, Status Update, Response, Repo Publish, Office Hours, Analytics)", test_faculty_flow)

# --- PHASE 5: Class Representative Dashboard ---
def test_cr_flow():
    headers = {"Authorization": f"Bearer {tokens['cr']}"}

    # 1. View section-level doubts
    cr_doubts_res = client.get(f"{BASE_URL}/doubts", headers=headers)
    assert cr_doubts_res.status_code == 200
    print(f"   -> CR section doubts count: {len(cr_doubts_res.json())}")

    # 2. Forward doubt to faculty
    forward_res = client.post(
        f"{BASE_URL}/doubts/forward",
        json={
            "doubt_id": created_doubt_id,
            "target_faculty_id": users["faculty"]["id"],
            "cr_note": "Please review this question on DP recursion memory"
        },
        headers=headers
    )
    assert forward_res.status_code == 200
    assert forward_res.json()["assigned_faculty_id"] == users["faculty"]["id"]

    # 3. Check CR analytics
    analytics_res = client.get(f"{BASE_URL}/analytics/cr", headers=headers)
    assert analytics_res.status_code == 200
    assert "class_section" in analytics_res.json()["kpis"]
    print(f"   -> CR class section: {analytics_res.json()['kpis']['class_section']}")

run_test("Phase 5: Class Rep Flow (Section Doubts, Forward to Faculty, Class Analytics)", test_cr_flow)

# --- PHASE 6: Admin/HOD Dashboard ---
def test_admin_flow():
    headers = {"Authorization": f"Bearer {tokens['admin']}"}

    # 1. View department statistics & analytics
    admin_analytics_res = client.get(f"{BASE_URL}/analytics/admin", headers=headers)
    assert admin_analytics_res.status_code == 200
    kpis = admin_analytics_res.json()["kpis"]
    assert kpis["total_students"] > 0
    assert kpis["total_faculty"] > 0
    print(f"   -> Admin stats: Students={kpis['total_students']}, Faculty={kpis['total_faculty']}, Doubts={kpis['total_doubts']}")

    # 2. Manage users
    users_res = client.get(f"{BASE_URL}/admin/users", headers=headers)
    assert users_res.status_code == 200
    print(f"   -> Total registered users: {len(users_res.json())}")

    # 3. Monitor SLA escalations & trigger escalation check
    escalate_scan_res = client.post(f"{BASE_URL}/admin/escalations/check?threshold_hours=48", headers=headers)
    assert escalate_scan_res.status_code == 200
    print(f"   -> Escalation check scan completed: {escalate_scan_res.json()['message']}")

    escalations_res = client.get(f"{BASE_URL}/admin/escalations", headers=headers)
    assert escalations_res.status_code == 200
    print(f"   -> Active SLA escalated doubts: {len(escalations_res.json())}")

    # 4. Solved Repository access & upvote
    repo_res = client.get(f"{BASE_URL}/repository", headers=headers)
    assert repo_res.status_code == 200
    if repo_res.json():
        pub_id = repo_res.json()[0]["id"]
        upvote_res = client.post(f"{BASE_URL}/repository/{pub_id}/upvote", headers=headers)
        assert upvote_res.status_code == 200
        print(f"   -> Upvoted published doubt ID {pub_id}")

run_test("Phase 6: Admin/HOD Flow (Department Stats, Users, SLA Escalation, Solved Repo)", test_admin_flow)

# --- PHASE 7: Security and Error Testing ---
def test_security_and_errors():
    student_headers = {"Authorization": f"Bearer {tokens['student']}"}

    # 1. Unauthorized endpoint access (Student trying to access Admin endpoints -> 403 Forbidden)
    res_403 = client.get(f"{BASE_URL}/admin/users", headers=student_headers)
    assert res_403.status_code == 403, f"Expected 403, got {res_403.status_code}"

    # Student trying to trigger escalation scan -> 403
    res_esc_403 = client.post(f"{BASE_URL}/admin/escalations/check", headers=student_headers)
    assert res_esc_403.status_code == 403

    # Student trying to merge doubts -> 403
    res_merge_403 = client.post(
        f"{BASE_URL}/duplicates/merge",
        json={"primary_doubt_id": 1, "merged_doubt_id": 2},
        headers=student_headers
    )
    assert res_merge_403.status_code == 403

    # 2. Invalid JWT token -> 401 Unauthorized
    res_invalid_jwt = client.get(
        f"{BASE_URL}/auth/me",
        headers={"Authorization": "Bearer invalid.jwt.token"}
    )
    assert res_invalid_jwt.status_code == 401

    # 3. Expired / missing token -> 401 Unauthorized
    res_no_token = client.get(f"{BASE_URL}/auth/me")
    assert res_no_token.status_code == 401

    # 4. Incorrect passwords -> 400 Bad Request
    res_bad_pw = client.post(
        f"{BASE_URL}/auth/login",
        json={"email": "student@bridgex.edu", "password": "WrongPassword123!"}
    )
    assert res_bad_pw.status_code == 400
    assert "Invalid email or password" in res_bad_pw.json()["detail"]

    # 5. Inactive / Nonexistent user -> 400/404
    res_nonexistent = client.post(
        f"{BASE_URL}/auth/login",
        json={"email": "nobody@bridgex.edu", "password": "password123"}
    )
    assert res_nonexistent.status_code == 400

    # 6. API Validation Errors (422 Unprocessable Entity)
    res_422 = client.post(
        f"{BASE_URL}/doubts",
        json={"topic": "Missing required fields"},
        headers=student_headers
    )
    assert res_422.status_code == 422

    # 7. Cancel booked appointment (Student cancelling their appointment)
    cancel_res = client.patch(
        f"{BASE_URL}/office-hours/appointments/{booked_appt_id}/cancel",
        params={"reason": "Schedule resolved during class"},
        headers=student_headers
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

run_test("Phase 7: Security (RBAC 403, Invalid JWT 401, Bad Passwords 400, Validation 422, Cancellation)", test_security_and_errors)

print("\n==================================================")
print(" Summary of Test Execution")
print("==================================================")
all_passed = True
for name, status in results.items():
    print(f"{status}: {name}")
    if status != "PASS":
        all_passed = False

if all_passed:
    print("\nALL PHASES PASSED WITH 100% SUCCESS!")
else:
    print("\nSOME TESTS FAILED - INVESTIGATION NEEDED")
    exit(1)
