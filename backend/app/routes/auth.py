from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import asyncio
from app.models.database import get_db
from app.models.models import User
from app.utils.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    country: str = ""

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/register", status_code=201)
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    # Run bcrypt in thread pool so it doesn't block the event loop
    hashed = await asyncio.get_event_loop().run_in_executor(None, hash_password, data.password)
    user = User(
        name=data.name,
        email=data.email,
        password=hashed,
        country=data.country,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User registered successfully", "user_id": user.id}

@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Run bcrypt verify in thread pool
    valid = await asyncio.get_event_loop().run_in_executor(None, verify_password, form.password, user.password)
    if not valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token}
