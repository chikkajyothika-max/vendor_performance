import os
from typing import Dict, Any, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from .models import (
    UserCreate, UserLogin, UserResponse,
    VendorCreate, VendorResponse,
    NoteCreate, NoteResponse,
    RiskPredictRequest, RiskPredictResponse,
    DashboardResponse,
    HealthResponse, AIStatusResponse,
    AIChatRequest, AIChatResponse, AIDeepAnalysisResponse
)
from .database import (
    init_db, get_user_by_email, get_user_by_id, create_user,
    get_all_vendors, get_vendor_by_id, create_vendor, delete_vendor,
    get_vendor_profile, add_vendor_note, delete_vendor_note,
    get_dashboard_data, get_database_health
)
from .auth import (
    hash_password, verify_password, create_access_token,
    decode_access_token, get_token_from_request
)
from .scoring import predict_vendor_risk
from .ai_service import (
    get_ai_status, analyze_vendor_risk_ai, chat_with_procurement_ai
)

app = FastAPI(
    title="VendorSync AI API",
    description="Vendor Intelligence and Risk Evaluation Platform Backend",
    version="2.4"
)

# CORS configuration supporting any origin with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on module load
init_db()

@app.on_event("startup")
def on_startup():
    init_db()

# --- Auth Dependency ---

def current_user(request: Request) -> Dict[str, Any]:
    token = get_token_from_request(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

# --- Auth Routes ---

@app.post("/api/auth/register", response_model=UserResponse)
def register(user_in: UserCreate, response: Response):
    existing = get_user_by_email(user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    new_user = create_user(
        name=user_in.name,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
        role="procurement_manager"
    )
    token = create_access_token({"sub": new_user["id"], "type": "access"})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=86400,
        samesite="lax",
        path="/"
    )
    return new_user

@app.post("/api/auth/login", response_model=UserResponse)
def login(login_in: UserLogin, response: Response):
    user = get_user_by_email(login_in.email)
    if not user or not verify_password(login_in.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    token = create_access_token({"sub": user["id"], "type": "access"})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=86400,
        samesite="lax",
        path="/"
    )
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"]
    }

@app.get("/api/auth/me", response_model=UserResponse)
def me(user: Dict[str, Any] = Depends(current_user)):
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"]
    }

@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Logged out successfully"}

# --- Dashboard ---

@app.get("/api/dashboard", response_model=DashboardResponse)
def dashboard(user: Dict[str, Any] = Depends(current_user)):
    return get_dashboard_data(user)

# --- Vendors ---

@app.post("/api/vendors", response_model=VendorResponse)
def add_vendor(vendor_in: VendorCreate, user: Dict[str, Any] = Depends(current_user)):
    created = create_vendor(vendor_in.dict())
    return created

@app.delete("/api/vendors/{vendor_id}")
def remove_vendor(vendor_id: str, user: Dict[str, Any] = Depends(current_user)):
    success = delete_vendor(vendor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {"message": "Vendor deleted successfully"}

@app.get("/api/vendors/{vendor_id}/profile")
def vendor_profile(vendor_id: str, user: Dict[str, Any] = Depends(current_user)):
    prof = get_vendor_profile(vendor_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return prof

@app.post("/api/vendors/{vendor_id}/notes", response_model=NoteResponse)
def add_note(vendor_id: str, note_in: NoteCreate, user: Dict[str, Any] = Depends(current_user)):
    vendor = get_vendor_by_id(vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return add_vendor_note(vendor_id, user["name"], note_in.note)

@app.delete("/api/vendors/{vendor_id}/notes/{note_id}")
def remove_note(vendor_id: str, note_id: str, user: Dict[str, Any] = Depends(current_user)):
    success = delete_vendor_note(vendor_id, note_id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted"}

# --- System & Database Health Check ---

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return get_database_health()

# --- AI Intelligence & Copilot Endpoints ---

@app.get("/api/ai/status", response_model=AIStatusResponse)
def ai_status(user: Dict[str, Any] = Depends(current_user)):
    return get_ai_status()

@app.post("/api/ai/chat", response_model=AIChatResponse)
async def ai_copilot_chat(req: AIChatRequest, user: Dict[str, Any] = Depends(current_user)):
    portfolio = get_dashboard_data(user)
    return await chat_with_procurement_ai(req.message, portfolio, req.history)

@app.post("/api/ai/analyze/{vendor_id}", response_model=AIDeepAnalysisResponse)
async def ai_deep_analysis(vendor_id: str, user: Dict[str, Any] = Depends(current_user)):
    prof = get_vendor_profile(vendor_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor = prof["vendor"]
    notes = prof.get("notes", [])
    orders = prof.get("orders", [])
    return await analyze_vendor_risk_ai(vendor, notes, orders)

# --- Risk Prediction Engine ---

@app.post("/api/risk/predict", response_model=RiskPredictResponse)
async def predict_risk(req: RiskPredictRequest, user: Dict[str, Any] = Depends(current_user)):
    prof = get_vendor_profile(req.vendor_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor = prof["vendor"]
    base_result = predict_vendor_risk(vendor)
    # Augment with AI diagnosis
    ai_diag = await analyze_vendor_risk_ai(vendor, prof.get("notes", []), prof.get("orders", []))
    base_result["confidence_score"] = ai_diag.get("confidence_score", 92)
    base_result["executive_summary"] = ai_diag.get("executive_summary")
    base_result["engine"] = ai_diag.get("engine", "VendorSync AI Engine")
    if ai_diag.get("strategic_recommendations"):
        base_result["recommendation"] = ai_diag["strategic_recommendations"][0]
    return base_result

# --- Static Frontend Serving ---

FRONTEND_PUBLIC_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "frontend", "public"
)

if os.path.exists(FRONTEND_PUBLIC_DIR):
    static_dir = os.path.join(FRONTEND_PUBLIC_DIR, "static")
    if os.path.exists(static_dir):
        app.mount("/static", StaticFiles(directory=static_dir), name="static")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_PUBLIC_DIR, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(FRONTEND_PUBLIC_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"detail": "Not found"})
