from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.core.config import settings
from app.models.models import User, Department
from app.schemas.schemas import UserCreate, UserLogin, UserOut, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        role=user_in.role.lower(),
        department_id=user_in.department_id,
        roll_number=user_in.roll_number,
        employee_id=user_in.employee_id,
        section=user_in.section or "A",
        office_room=user_in.office_room,
        avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={user_in.full_name}"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(subject=new_user.id, role=new_user.role)
    user_out = UserOut.model_validate(new_user)
    if new_user.department:
        user_out.department_name = new_user.department.name
        
    return Token(access_token=token, token_type="bearer", user=user_out)

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is inactive")

    token = create_access_token(subject=user.id, role=user.role)
    user_out = UserOut.model_validate(user)
    if user.department:
        user_out.department_name = user.department.name

    return Token(access_token=token, token_type="bearer", user=user_out)

@router.post("/token", response_model=Token)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token = create_access_token(subject=user.id, role=user.role)
    user_out = UserOut.model_validate(user)
    if user.department:
        user_out.department_name = user.department.name

    return Token(access_token=token, token_type="bearer", user=user_out)

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    user_out = UserOut.model_validate(current_user)
    if current_user.department:
        user_out.department_name = current_user.department.name
    return user_out

DEMO_ROLE_EMAILS = {
    "student": "student@bridgex.edu",
    "faculty": "faculty@bridgex.edu",
    "cr": "cr@bridgex.edu",
    "admin": "admin@bridgex.edu",
}

@router.post("/demo-login/{role}", response_model=Token)
def demo_login(role: str, db: Session = Depends(get_db)):
    """Fast login switch for instant demonstration across all 4 roles."""
    role = role.lower()
    target_email = DEMO_ROLE_EMAILS.get(role)
    user = None
    if target_email:
        user = db.query(User).filter(User.email == target_email, User.is_active == True).first()
    if not user:
        user = db.query(User).filter(User.role == role, User.is_active == True).first()

    if not user:
        raise HTTPException(status_code=404, detail=f"No active demo account found for role: {role}")
        
    token = create_access_token(subject=user.id, role=user.role)
    user_out = UserOut.model_validate(user)
    if user.department:
        user_out.department_name = user.department.name

    return Token(access_token=token, token_type="bearer", user=user_out)
