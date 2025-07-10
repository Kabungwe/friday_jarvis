from fastapi import FastAPI, Request, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import os
import json
import uvicorn
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Dr. Kay - AI Medical Tutor",
    description="AI-powered voice and video medical education assistant",
    version="1.0.0"
)

# Mount static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# =============================================================================
# Data Models for API Endpoints
# =============================================================================

class QuizRequest(BaseModel):
    topic: str
    difficulty: str = "intermediate"
    question_type: str = "multiple_choice"
    num_questions: int = 5

class StudyPlanRequest(BaseModel):
    specialty: str
    duration_days: int = 7
    study_hours_per_day: int = 2
    focus_areas: Optional[List[str]] = None

class CalculatorRequest(BaseModel):
    calculator_type: str
    parameters: dict

class SymptomRequest(BaseModel):
    symptoms: List[str]
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None

# =============================================================================
# Web Interface Routes
# =============================================================================

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Main Dr. Kay interface page"""
    return templates.TemplateResponse("index.html", {
        "request": request,
        "livekit_url": os.getenv("LIVEKIT_URL", ""),
        "livekit_api_key": os.getenv("LIVEKIT_API_KEY", ""),
    })

@app.get("/widget", response_class=HTMLResponse)
async def widget(request: Request):
    """Embeddable Dr. Kay widget for AllStarMedics.com"""
    return templates.TemplateResponse("widget.html", {
        "request": request,
        "livekit_url": os.getenv("LIVEKIT_URL", ""),
        "livekit_api_key": os.getenv("LIVEKIT_API_KEY", ""),
    })

# =============================================================================
# Medical Education API Endpoints
# =============================================================================

@app.get("/api/quiz-generator")
async def generate_quiz(
    topic: str,
    difficulty: str = "intermediate",
    question_type: str = "multiple_choice",
    num_questions: int = 5
):
    """Generate medical quiz questions"""
    try:
        # This would integrate with your actual quiz generation logic
        quiz_data = {
            "quiz_id": f"quiz_{topic}_{difficulty}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "topic": topic,
            "difficulty": difficulty,
            "question_type": question_type,
            "questions": [
                {
                    "id": i + 1,
                    "question": f"Sample {question_type} question about {topic} (Level: {difficulty})",
                    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"] if question_type == "multiple_choice" else None,
                    "correct_answer": "A",
                    "explanation": f"This question tests understanding of {topic} concepts at {difficulty} level.",
                    "tags": [topic, difficulty]
                } for i in range(min(num_questions, 10))
            ],
            "created_at": datetime.now().isoformat()
        }
        
        logger.info(f"Generated quiz: {topic} - {difficulty}")
        return JSONResponse(quiz_data)
        
    except Exception as e:
        logger.error(f"Error generating quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/study-plan")
async def create_study_plan(request: StudyPlanRequest):
    """Create personalized medical study plan"""
    try:
        study_plan = {
            "plan_id": f"plan_{request.specialty.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "specialty": request.specialty,
            "duration_days": request.duration_days,
            "daily_hours": request.study_hours_per_day,
            "total_hours": request.duration_days * request.study_hours_per_day,
            "focus_areas": request.focus_areas or [
                f"Core {request.specialty} concepts",
                "Clinical applications",
                "Diagnostic procedures",
                "Treatment protocols"
            ],
            "daily_schedule": [
                {
                    "day": i + 1,
                    "topics": [f"Topic {i+1} for {request.specialty}"],
                    "hours": request.study_hours_per_day,
                    "activities": ["Reading", "Practice questions", "Case studies"]
                } for i in range(request.duration_days)
            ],
            "created_at": datetime.now().isoformat()
        }
        
        logger.info(f"Created study plan: {request.specialty}")
        return JSONResponse(study_plan)
        
    except Exception as e:
        logger.error(f"Error creating study plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-document")
async def upload_document(file: UploadFile = File(...), analysis_type: str = "summary"):
    """Upload and analyze medical documents"""
    try:
        # Read file content
        content = await file.read()
        
        # Simulate document analysis
        analysis_result = {
            "document_id": f"doc_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "filename": file.filename,
            "file_type": file.content_type,
            "size_bytes": len(content),
            "analysis_type": analysis_type,
            "summary": f"Analysis of {file.filename} completed. Document contains medical education content suitable for {analysis_type}.",
            "key_points": [
                "Key medical concept 1",
                "Important diagnostic criteria 2", 
                "Treatment considerations 3"
            ],
            "generated_flashcards": [
                {"front": "What is the primary treatment?", "back": "Based on document analysis"},
                {"front": "Key diagnostic criteria?", "back": "Multiple criteria identified"}
            ] if analysis_type == "flashcards" else None,
            "processed_at": datetime.now().isoformat()
        }
        
        logger.info(f"Analyzed document: {file.filename}")
        return JSONResponse(analysis_result)
        
    except Exception as e:
        logger.error(f"Error analyzing document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/calculators")
async def medical_calculator(type: str, **parameters):
    """Perform medical calculations"""
    try:
        calc_result = {
            "calculator_type": type,
            "parameters": dict(parameters),
            "calculated_at": datetime.now().isoformat()
        }
        
        if type == "gfr":
            creatinine = float(parameters.get("creatinine", 1.0))
            age = int(parameters.get("age", 40))
            # Simplified MDRD equation
            gfr = 175 * (creatinine ** -1.154) * (age ** -0.203)
            calc_result["result"] = {
                "gfr": round(gfr, 1),
                "unit": "mL/min/1.73m²",
                "interpretation": "Normal" if gfr >= 90 else "Reduced" if gfr >= 60 else "Significantly reduced"
            }
        elif type == "bmi":
            weight = float(parameters.get("weight", 70))
            height = float(parameters.get("height", 170))
            bmi = weight / ((height / 100) ** 2)
            
            if bmi < 18.5:
                category = "Underweight"
            elif bmi < 25:
                category = "Normal"
            elif bmi < 30:
                category = "Overweight"
            else:
                category = "Obese"
                
            calc_result["result"] = {
                "bmi": round(bmi, 1),
                "category": category,
                "unit": "kg/m²"
            }
        else:
            calc_result["result"] = {"message": f"Calculation for {type} completed"}
        
        logger.info(f"Performed calculation: {type}")
        return JSONResponse(calc_result)
        
    except Exception as e:
        logger.error(f"Error in calculation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/symptom-checker")
async def symptom_checker(request: SymptomRequest):
    """Educational symptom analysis for learning"""
    try:
        analysis = {
            "analysis_id": f"symptom_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "symptoms": request.symptoms,
            "patient_context": {
                "age": request.patient_age,
                "gender": request.patient_gender
            },
            "educational_analysis": {
                "common_differentials": [
                    "Common condition related to symptoms",
                    "Alternative diagnosis to consider",
                    "Rare but serious condition"
                ],
                "learning_points": [
                    "Key diagnostic criteria to remember",
                    "Important red flags to watch for",
                    "Systematic approach to evaluation"
                ],
                "next_steps": [
                    "Additional history questions",
                    "Physical examination findings",
                    "Diagnostic tests to consider"
                ]
            },
            "disclaimer": "FOR EDUCATIONAL PURPOSES ONLY - Always consult healthcare providers for actual patient care",
            "analyzed_at": datetime.now().isoformat()
        }
        
        logger.info(f"Symptom analysis completed for: {', '.join(request.symptoms)}")
        return JSONResponse(analysis)
        
    except Exception as e:
        logger.error(f"Error in symptom analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# Health Check and Info
# =============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Dr. Kay Medical Education Assistant"}

@app.get("/api/info")
async def get_info():
    """Get Dr. Kay service information"""
    return {
        "name": "Dr. Kay",
        "version": "1.0.0",
        "description": "AI-powered voice and video medical tutor and educational assistant",
        "features": [
            "Real-time voice/video interaction",
            "Medical quiz generation",
            "Study plan creation",
            "Document analysis",
            "Medical calculators",
            "Educational symptom analysis",
            "Research search"
        ],
        "supported_specialties": [
            "Internal Medicine",
            "OBGYN",
            "Pediatrics",
            "Pharmacology",
            "Cardiology",
            "Emergency Medicine"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "web_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )