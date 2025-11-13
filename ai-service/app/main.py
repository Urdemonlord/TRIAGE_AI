"""
TRIAGE.AI - AI Symptom Checker + Smart Triage System
FastAPI Backend Service
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import os
import asyncio
from datetime import datetime

# Import our custom modules
from app.utils.preprocessor import preprocess_text, extract_symptoms, extract_numeric_data
from app.models.urgency_engine import analyze_urgency
from app.models.classifier import SymptomClassifier
from app.utils.llm_service import generate_medical_summary, generate_category_explanation, generate_first_aid_advice

# Initialize FastAPI app
app = FastAPI(
    title="TRIAGE.AI API",
    description="AI-powered symptom checker and triage system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'data/trained_model')
classifier = SymptomClassifier()

# Try to load existing model, if not found will need to train first
try:
    if os.path.exists(MODEL_PATH):
        classifier.load_model(MODEL_PATH)
        print("✓ Model loaded successfully")
    else:
        print("⚠ No trained model found. Please run training first.")
except Exception as e:
    print(f"⚠ Warning: Could not load model: {e}")


# Pydantic models for request/response
class TriageRequest(BaseModel):
    complaint: str = Field(..., description="Patient's complaint text in Bahasa Indonesia")
    patient_data: Optional[Dict] = Field(default=None, description="Optional patient demographic data")


class SymptomInfo(BaseModel):
    symptom: str
    detected: bool


class CategoryPrediction(BaseModel):
    category: str
    probability: float
    confidence: str


class RedFlag(BaseModel):
    urgency: str
    keyword: str
    reason: str
    action: str
    severity: str


class UrgencyResult(BaseModel):
    urgency_level: str
    urgency_score: int
    description: str
    recommendation: str
    detected_flags: List[RedFlag]
    flags_summary: Dict


class TriageResponse(BaseModel):
    success: bool
    triage_id: Optional[str] = None
    timestamp: str

    # Input processing
    original_complaint: str
    processed_complaint: str
    extracted_symptoms: List[str]
    numeric_data: Dict

    # ML prediction
    primary_category: str
    category_confidence: str
    category_probability: float
    alternative_categories: List[CategoryPrediction]
    requires_doctor_review: bool

    # Urgency analysis
    urgency: UrgencyResult

    # Summary (LLM-enhanced)
    summary: str
    category_explanation: Optional[str] = None
    first_aid_advice: Optional[str] = None


class HealthCheckResponse(BaseModel):
    status: str
    model_loaded: bool
    timestamp: str


# API Endpoints

@app.get("/", response_model=HealthCheckResponse)
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "model_loaded": classifier.is_trained,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/api/v1/triage", response_model=TriageResponse)
async def perform_triage(request: TriageRequest):
    """
    Main triage endpoint

    Analyzes patient complaint and returns:
    - Disease category prediction
    - Urgency level (Green/Yellow/Red)
    - Detected symptoms and red flags
    - Medical recommendations
    """

    if not classifier.is_trained:
        raise HTTPException(
            status_code=503,
            detail="AI model not ready. Please contact administrator."
        )

    try:
        # 1. Preprocess complaint text
        preprocessed = preprocess_text(request.complaint, remove_stopwords=False)
        processed_text = preprocessed['processed']

        # 2. Extract symptoms
        symptoms = extract_symptoms(request.complaint)

        # 3. Extract numeric data
        numeric_data = extract_numeric_data(request.complaint)

        # 4. Classify disease category
        category_result = classifier.predict_with_details(processed_text)

        # 5. Analyze urgency
        urgency_result = analyze_urgency(processed_text, numeric_data)

        # 6. Generate triage ID
        triage_id = f"TRG-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        # 7-9. Generate LLM-enhanced outputs (async, run in parallel)
        # Prepare async tasks
        async def get_summary():
            return await asyncio.to_thread(
                generate_medical_summary,
                complaint=request.complaint,
                category=category_result['primary_category'],
                urgency=urgency_result['urgency_level'],
                symptoms=symptoms,
                red_flags=urgency_result['detected_flags']
            )

        async def get_category_explanation():
            return await asyncio.to_thread(
                generate_category_explanation,
                category=category_result['primary_category'],
                confidence=category_result['probability']
            )

        async def get_first_aid():
            if urgency_result['urgency_level'] != 'Red':
                return await asyncio.to_thread(
                    generate_first_aid_advice,
                    category=category_result['primary_category'],
                    urgency=urgency_result['urgency_level']
                )
            return None

        # Run all LLM calls concurrently for better performance
        summary, category_explanation, first_aid_advice = await asyncio.gather(
            get_summary(),
            get_category_explanation(),
            get_first_aid()
        )

        # 10. Build response
        response = {
            "success": True,
            "triage_id": triage_id,
            "timestamp": datetime.utcnow().isoformat(),

            # Input processing
            "original_complaint": request.complaint,
            "processed_complaint": processed_text,
            "extracted_symptoms": symptoms,
            "numeric_data": numeric_data,

            # ML prediction
            "primary_category": category_result['primary_category'],
            "category_confidence": category_result['confidence'],
            "category_probability": category_result['probability'],
            "alternative_categories": category_result['alternative_categories'],
            "requires_doctor_review": category_result['requires_review'] or urgency_result['urgency_level'] == 'Red',

            # Urgency analysis
            "urgency": urgency_result,

            # Summary (LLM-enhanced)
            "summary": summary,
            "category_explanation": category_explanation,
            "first_aid_advice": first_aid_advice
        }

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Triage processing error: {str(e)}"
        )


@app.post("/api/v1/analyze-symptoms")
async def analyze_symptoms(request: TriageRequest):
    """
    Simplified endpoint for symptom extraction only
    """
    try:
        preprocessed = preprocess_text(request.complaint)
        symptoms = extract_symptoms(request.complaint)
        numeric_data = extract_numeric_data(request.complaint)

        return {
            "success": True,
            "processed_text": preprocessed['processed'],
            "symptoms": symptoms,
            "numeric_data": numeric_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/check-urgency")
async def check_urgency(request: TriageRequest):
    """
    Endpoint for urgency checking only
    """
    try:
        preprocessed = preprocess_text(request.complaint)
        numeric_data = extract_numeric_data(request.complaint)
        urgency_result = analyze_urgency(preprocessed['processed'], numeric_data)

        return {
            "success": True,
            "urgency": urgency_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/categories")
async def get_categories():
    """
    Get list of available disease categories
    """
    if not classifier.is_trained:
        raise HTTPException(status_code=503, detail="Model not loaded")

    return {
        "success": True,
        "categories": classifier.categories,
        "total": len(classifier.categories)
    }


# Helper functions

def generate_summary(category: str, urgency: str, symptoms: List[str]) -> str:
    """Generate human-readable summary"""

    urgency_text = {
        'Green': 'Kondisi Anda tergolong ringan',
        'Yellow': 'Kondisi Anda memerlukan perhatian medis',
        'Red': 'Kondisi Anda memerlukan penanganan SEGERA'
    }

    summary = f"{urgency_text.get(urgency, 'Kondisi Anda perlu dievaluasi')}. "
    summary += f"Gejala Anda mengarah pada kategori {category}. "

    if symptoms:
        summary += f"Gejala utama: {', '.join(symptoms[:3])}. "

    if urgency == 'Red':
        summary += "Segera cari bantuan medis atau pergi ke IGD."
    elif urgency == 'Yellow':
        summary += "Sebaiknya konsultasi dengan dokter dalam 24 jam."
    else:
        summary += "Istirahat cukup dan monitor perkembangan gejala."

    return summary


# Training endpoint (for development only, remove in production)
@app.post("/api/v1/train")
async def train_model():
    """
    Train the ML model (DEV only)
    Should be disabled in production
    """
    try:
        dataset_path = os.path.join(os.path.dirname(__file__), 'data/symptoms_dataset.csv')

        global classifier
        classifier = SymptomClassifier()
        metrics = classifier.train(dataset_path)
        classifier.save_model(MODEL_PATH)

        return {
            "success": True,
            "message": "Model trained successfully",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
