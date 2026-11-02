import hashlib
import os
import secrets
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, Field

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])

# In-memory session store & user registry
USERS_DB = {
    "researcher@ethnotrace.org": {
        "id": "usr_001",
        "email": "researcher@ethnotrace.org",
        "name": "Dr. Ethnobotanist Specialist",
        "role": "Lead Researcher",
        # Default salted hash for "EthnoHack2026!"
        "salt": "ethno_salt_2026",
        "password_hash": hashlib.sha256(("ethno_salt_2026" + "EthnoHack2026!").encode()).hexdigest()
    }
}

ACTIVE_TOKENS = {}

class LoginRequest(BaseModel):
    email: str = Field(..., example="researcher@ethnotrace.org")
    password: str = Field(..., example="EthnoHack2026!")

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: Optional[str] = "Ethnobotanical Researcher"

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: dict

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        # Default unauthenticated fallback with guest permissions
        return {"email": "guest@ethnotrace.org", "role": "Guest Researcher"}
    token = authorization.replace("Bearer ", "").strip()
    user = ACTIVE_TOKENS.get(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session token.")
    return user

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    user = USERS_DB.get(payload.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or credentials.")
    
    computed_hash = hashlib.sha256((user["salt"] + payload.password).encode()).hexdigest()
    if computed_hash != user["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid email or credentials.")

    token = secrets.token_hex(24)
    ACTIVE_TOKENS[token] = {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"]
    }

    return AuthResponse(
        access_token=token,
        token_type="Bearer",
        user=ACTIVE_TOKENS[token]
    )

@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest):
    if payload.email in USERS_DB:
        raise HTTPException(status_code=400, detail="Account with this email already exists.")
    
    salt = secrets.token_hex(8)
    pwd_hash = hashlib.sha256((salt + payload.password).encode()).hexdigest()
    user_id = f"usr_{secrets.token_hex(4)}"

    new_user = {
        "id": user_id,
        "email": payload.email,
        "name": payload.name,
        "role": payload.role,
        "salt": salt,
        "password_hash": pwd_hash
    }
    USERS_DB[payload.email] = new_user

    token = secrets.token_hex(24)
    ACTIVE_TOKENS[token] = {
        "id": user_id,
        "email": payload.email,
        "name": payload.name,
        "role": payload.role
    }

    return AuthResponse(
        access_token=token,
        token_type="Bearer",
        user=ACTIVE_TOKENS[token]
    )

@router.get("/me")
def get_profile(user: dict = Depends(get_current_user)):
    return user
