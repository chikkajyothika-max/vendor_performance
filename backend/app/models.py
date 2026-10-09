from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str = "procurement_manager"
    created_at: str

class VendorCreate(BaseModel):
    name: str
    category: str = "Electronics"
    email: str
    location: str = "United States"
    contract_value: float = 100000.0

class VendorResponse(BaseModel):
    id: str
    name: str
    category: str
    email: str
    location: str
    status: str = "Active"
    score: int
    risk_score: int
    risk: str
    delivery: int
    quality: int
    cost: int
    reliability: int
    orders: int
    delayed: int
    complaints: int
    defects: int
    trend: List[int]
    contract_value: Optional[float] = 100000.0

class NoteCreate(BaseModel):
    note: str

class NoteResponse(BaseModel):
    id: str
    author: str
    note: str
    created_at: str

class RiskPredictRequest(BaseModel):
    vendor_id: str

class RiskPredictResponse(BaseModel):
    vendor_id: str
    risk_score: int
    risk: str
    performance: int
    factors: List[str]
    recommendation: str
    confidence_score: Optional[int] = 92
    executive_summary: Optional[str] = None
    engine: Optional[str] = "VendorSync AI Engine"

class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None

class AIChatResponse(BaseModel):
    reply: str
    provider: str
    model: str
    connected: bool

class AIDeepAnalysisResponse(BaseModel):
    vendor_id: str
    vendor_name: str
    risk_level: str
    risk_score: int
    confidence_score: int
    executive_summary: str
    key_risk_drivers: List[str]
    positive_indicators: List[str]
    strategic_recommendations: List[str]
    contract_negotiation_advice: str
    engine: str
    gemini_connected: bool

class AIStatusResponse(BaseModel):
    provider: str
    model: str
    connected: bool
    mode: str
    message: str

class HealthResponse(BaseModel):
    status: str
    dialect: str
    database_url_configured: bool
    latency_ms: Optional[float] = None
    user_count: Optional[int] = None
    error: Optional[str] = None

class MonthlyScore(BaseModel):
    month: str
    score: int

class DashboardStats(BaseModel):
    vendors: int
    low: int
    medium: int
    high: int
    orders: int

class DashboardResponse(BaseModel):
    user: Optional[UserResponse] = None
    vendors: List[VendorResponse]
    orders: List[Any]
    stats: DashboardStats
    monthly: List[MonthlyScore]
