import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.json()
    assert data['status'] == 'healthy'
    assert data['service'] == 'BridgeX'

def test_all_four_demo_role_logins():
    roles = [
        ('student', 'student@bridgex.edu', 'Aarav Sharma'),
        ('faculty', 'faculty@bridgex.edu', 'Dr. Priya Raman'),
        ('cr', 'cr@bridgex.edu', 'Tanya Verma (CR)'),
        ('admin', 'admin@bridgex.edu', 'Dr. K. Venkat (HOD)'),
    ]

    for role, expected_email, expected_name in roles:
        res = client.post(f'/api/v1/auth/demo-login/{role}')
        assert res.status_code == 200
        data = res.json()
        assert 'access_token' in data
        assert data['token_type'] == 'bearer'
        user = data['user']
        assert user['email'] == expected_email
        assert user['role'] == role
        assert user['is_active'] is True

def test_jwt_auth_and_me():
    res = client.post('/api/v1/auth/demo-login/student')
    token = res.json()['access_token']
    me_res = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert me_res.status_code == 200
    user = me_res.json()
    assert user['email'] == 'student@bridgex.edu'
    assert user['role'] == 'student'

def test_institutional_password_login():
    res = client.post('/api/v1/auth/login', json={'email': 'student@bridgex.edu', 'password': 'password123'})
    assert res.status_code == 200
    assert 'access_token' in res.json()

def test_reject_invalid_credentials():
    res = client.post('/api/v1/auth/login', json={'email': 'student@bridgex.edu', 'password': 'wrongpassword'})
    assert res.status_code == 400

def test_reject_unauthenticated():
    res = client.get('/api/v1/auth/me')
    assert res.status_code == 401
