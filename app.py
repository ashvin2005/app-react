from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import os
import subprocess
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Determine if we're in production
IS_PRODUCTION = os.getenv("RENDER", "false").lower() == "true"

app = FastAPI(
    title="Shift Booking API",
    docs_url="/api/docs" if IS_PRODUCTION else "/docs",
    redoc_url="/api/redoc" if IS_PRODUCTION else "/redoc",
    openapi_url="/api/openapi.json" if IS_PRODUCTION else "/openapi.json"
)

# Add security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if not IS_PRODUCTION else [os.getenv("HOST", "localhost")]
)

# Add compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add CORS middleware with production settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if not IS_PRODUCTION else [os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Build the frontend
def build_frontend():
    try:
        subprocess.run(["npm", "install"], check=True)
        subprocess.run(["npm", "run", "build"], check=True)
        print("Frontend built successfully")
    except subprocess.CalledProcessError as e:
        print(f"Error building frontend: {e}")
        raise

# Data Models
class Shift(BaseModel):
    id: UUID
    area: str
    booked: bool
    startTime: int
    endTime: int
    position: str  # Added position field
    department: str  # Added department field

# In-memory storage
shifts: List[Shift] = []

# Helper functions
def get_shift_by_id(shift_id: UUID) -> Optional[Shift]:
    for shift in shifts:
        if shift.id == shift_id:
            return shift
    return None

def has_overlapping_shifts(new_shift: Shift) -> bool:
    for shift in shifts:
        if shift.booked and (
            (new_shift.startTime <= shift.startTime < new_shift.endTime) or
            (new_shift.startTime < shift.endTime <= new_shift.endTime) or
            (shift.startTime <= new_shift.startTime and shift.endTime >= new_shift.endTime)
        ):
            return True
    return False

# API Endpoints
@app.get("/shifts", response_model=List[Shift])
async def get_shifts():
    return shifts

@app.get("/shifts/{shift_id}", response_model=Shift)
async def get_shift(shift_id: UUID):
    shift = get_shift_by_id(shift_id)
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    return shift

@app.post("/shifts/{shift_id}/book", response_model=Shift)
async def book_shift(shift_id: UUID):
    shift = get_shift_by_id(shift_id)
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    if shift.booked:
        raise HTTPException(status_code=400, detail="Shift is already booked")
    
    current_time = int(datetime.now().timestamp() * 1000)
    if shift.startTime <= current_time:
        raise HTTPException(status_code=400, detail="Cannot book a shift that has already started")
    
    if has_overlapping_shifts(shift):
        raise HTTPException(status_code=400, detail="Shift overlaps with another booked shift")
    
    shift.booked = True
    return shift

@app.post("/shifts/{shift_id}/cancel", response_model=Shift)
async def cancel_shift(shift_id: UUID):
    shift = get_shift_by_id(shift_id)
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    if not shift.booked:
        raise HTTPException(status_code=400, detail="Shift is not booked")
    
    shift.booked = False
    return shift

# Mount the static files
@app.on_event("startup")
async def startup_event():
    # Build the frontend
    build_frontend()
    
    # Mount the static files
    static_dir = "dist" if os.path.exists("dist") else "build"
    if not os.path.exists(static_dir):
        raise RuntimeError(f"Frontend build directory '{static_dir}' not found after build")
    
    app.mount(
        "/",
        StaticFiles(
            directory=static_dir,
            html=True,
            check_dir=True
        ),
        name="static"
    )
    
    # Create demo shifts
    global shifts
    current_time = int(datetime.now().timestamp() * 1000)
    
    shifts = [
        # Mumbai shifts
        Shift(
            id=uuid4(),
            area="Mumbai",
            booked=False,
            startTime=current_time + 3600000,  # 1 hour from now
            endTime=current_time + 7200000,    # 2 hours from now
            position="Senior Nurse",
            department="Emergency"
        ),
        Shift(
            id=uuid4(),
            area="Mumbai",
            booked=True,
            startTime=current_time + 10800000,  # 3 hours from now
            endTime=current_time + 14400000,    # 4 hours from now
            position="Junior Doctor",
            department="ICU"
        ),
        
        # Delhi shifts
        Shift(
            id=uuid4(),
            area="Delhi",
            booked=False,
            startTime=current_time + 7200000,   # 2 hours from now
            endTime=current_time + 10800000,    # 3 hours from now
            position="Staff Nurse",
            department="General Ward"
        ),
        
        # Bangalore shifts
        Shift(
            id=uuid4(),
            area="Bangalore",
            booked=True,
            startTime=current_time + 14400000,  # 4 hours from now
            endTime=current_time + 18000000,    # 5 hours from now
            position="Senior Doctor",
            department="Cardiology"
        ),
        
        # Chennai shifts
        Shift(
            id=uuid4(),
            area="Chennai",
            booked=False,
            startTime=current_time + 18000000,  # 5 hours from now
            endTime=current_time + 21600000,    # 6 hours from now
            position="Junior Nurse",
            department="Pediatrics"
        )
    ]

# Add health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"} 