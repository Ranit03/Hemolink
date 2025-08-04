from pydantic import BaseModel, Field, validator
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
from enum import Enum

class BloodType(str, Enum):
    """Blood type enumeration"""
    A_POSITIVE = "A_POSITIVE"
    A_NEGATIVE = "A_NEGATIVE"
    B_POSITIVE = "B_POSITIVE"
    B_NEGATIVE = "B_NEGATIVE"
    AB_POSITIVE = "AB_POSITIVE"
    AB_NEGATIVE = "AB_NEGATIVE"
    O_POSITIVE = "O_POSITIVE"
    O_NEGATIVE = "O_NEGATIVE"

class UrgencyLevel(int, Enum):
    """Urgency level enumeration"""
    ROUTINE = 1
    MODERATE = 2
    URGENT = 3
    CRITICAL = 4
    EMERGENCY = 5

class Gender(str, Enum):
    """Gender enumeration"""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

# Base schemas
class LocationSchema(BaseModel):
    """Location information schema"""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    address: Optional[str] = Field(None, description="Human readable address")
    city: Optional[str] = Field(None, description="City name")
    state: Optional[str] = Field(None, description="State name")
    postal_code: Optional[str] = Field(None, description="Postal code")
    population_density: Optional[float] = Field(None, ge=0, description="Population per sq km")
    is_urban: Optional[bool] = Field(True, description="Urban area indicator")
    distance_to_major_city: Optional[float] = Field(None, ge=0, description="Distance to nearest major city in km")

class VitalSigns(BaseModel):
    """Vital signs schema"""
    blood_pressure_systolic: Optional[int] = Field(None, ge=60, le=250, description="Systolic BP in mmHg")
    blood_pressure_diastolic: Optional[int] = Field(None, ge=40, le=150, description="Diastolic BP in mmHg")
    heart_rate: Optional[int] = Field(None, ge=40, le=200, description="Heart rate in BPM")
    temperature: Optional[float] = Field(None, ge=35.0, le=42.0, description="Body temperature in Celsius")
    hemoglobin: Optional[float] = Field(None, ge=5.0, le=20.0, description="Hemoglobin level in g/dL")
    oxygen_saturation: Optional[float] = Field(None, ge=70.0, le=100.0, description="Oxygen saturation percentage")

class MedicalHistory(BaseModel):
    """Medical history schema"""
    chronic_conditions: Optional[List[str]] = Field(default_factory=list, description="List of chronic conditions")
    medications: Optional[List[str]] = Field(default_factory=list, description="Current medications")
    allergies: Optional[List[str]] = Field(default_factory=list, description="Known allergies")
    previous_adverse_reactions: Optional[bool] = Field(False, description="History of adverse reactions")
    recent_illness: Optional[bool] = Field(False, description="Recent illness indicator")
    immune_compromised: Optional[bool] = Field(False, description="Immunocompromised status")
    smoking: Optional[bool] = Field(False, description="Smoking status")
    alcohol_consumption: Optional[bool] = Field(False, description="Regular alcohol consumption")

class PersonSchema(BaseModel):
    """Base person schema"""
    age: int = Field(..., ge=16, le=100, description="Age in years")
    gender: Optional[Gender] = Field(None, description="Gender")
    weight: Optional[float] = Field(None, ge=30, le=200, description="Weight in kg")
    height: Optional[float] = Field(None, ge=100, le=250, description="Height in cm")
    blood_type: BloodType = Field(..., description="Blood type")
    location: Optional[LocationSchema] = Field(None, description="Location information")
    vitals: Optional[VitalSigns] = Field(None, description="Vital signs")
    medical_history: Optional[MedicalHistory] = Field(None, description="Medical history")

# Donor-specific schemas
class DonorSchema(PersonSchema):
    """Donor information schema"""
    donor_id: Optional[str] = Field(None, description="Unique donor identifier")
    donation_count: Optional[int] = Field(0, ge=0, description="Total number of donations")
    days_since_last_donation: Optional[int] = Field(None, ge=0, description="Days since last donation")
    health_score: Optional[float] = Field(0.8, ge=0, le=1, description="Overall health score")
    reliability_score: Optional[float] = Field(0.8, ge=0, le=1, description="Reliability score based on history")
    available_hours: Optional[int] = Field(24, ge=0, le=24, description="Available hours per day")
    preferred_donation_times: Optional[List[str]] = Field(default_factory=list, description="Preferred donation time slots")

class PatientSchema(PersonSchema):
    """Patient information schema"""
    patient_id: Optional[str] = Field(None, description="Unique patient identifier")
    condition_severity: Optional[float] = Field(0.3, ge=0, le=1, description="Medical condition severity score")
    diagnosis: Optional[str] = Field(None, description="Primary diagnosis")
    treatment_type: Optional[str] = Field(None, description="Type of treatment requiring blood")

# Request schemas
class DonorPredictionRequest(BaseModel):
    """Request schema for donor availability prediction"""
    donor_age: Optional[int] = Field(30, ge=16, le=100)
    donor_weight: Optional[float] = Field(70, ge=30, le=200)
    donor_height: Optional[float] = Field(170, ge=100, le=250)
    blood_type: BloodType
    donation_count: Optional[int] = Field(0, ge=0)
    days_since_last_donation: Optional[int] = Field(90, ge=0)
    request_date: Optional[str] = Field(default_factory=lambda: datetime.now().isoformat())
    location: Optional[LocationSchema] = None
    urgency_level: UrgencyLevel = UrgencyLevel.ROUTINE
    units_required: Optional[int] = Field(1, ge=1, le=10)
    local_demand_score: Optional[float] = Field(0.5, ge=0, le=1)
    
    @validator('request_date')
    def validate_request_date(cls, v):
        try:
            datetime.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError('Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)')

class DemandForecastRequest(BaseModel):
    """Request schema for demand forecasting"""
    forecast_date: Optional[str] = Field(default_factory=lambda: datetime.now().isoformat())
    forecast_days: Optional[int] = Field(7, ge=1, le=365)
    blood_type: Optional[BloodType] = None
    hospital_id: Optional[str] = None
    location: Optional[LocationSchema] = None
    avg_daily_demand: Optional[float] = Field(10, ge=0)
    peak_demand_last_week: Optional[float] = Field(15, ge=0)
    seasonal_factor: Optional[float] = Field(1.0, ge=0.1, le=3.0)
    hospital_capacity: Optional[int] = Field(100, ge=1)
    population_served: Optional[int] = Field(50000, ge=1000)
    emergency_events: Optional[int] = Field(0, ge=0)
    current_inventory: Optional[int] = Field(0, ge=0)
    
    @validator('forecast_date')
    def validate_forecast_date(cls, v):
        try:
            datetime.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError('Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)')

class CompatibilityRequest(BaseModel):
    """Request schema for compatibility assessment"""
    donor: DonorSchema
    patient: PatientSchema
    urgency_level: UrgencyLevel = UrgencyLevel.ROUTINE
    units_required: Optional[int] = Field(1, ge=1, le=10)
    procedure_type: Optional[str] = Field(None, description="Type of medical procedure")
    time_to_procedure_hours: Optional[float] = Field(24, ge=0, description="Hours until procedure")
    special_requirements: Optional[List[str]] = Field(default_factory=list, description="Special compatibility requirements")

class RiskAssessmentRequest(BaseModel):
    """Request schema for risk assessment"""
    assessment_type: str = Field(..., regex="^(donation|transfusion)$", description="Type of assessment")
    subject: Union[DonorSchema, PatientSchema] = Field(..., description="Subject being assessed")
    urgency_level: UrgencyLevel = UrgencyLevel.ROUTINE
    units_required: Optional[int] = Field(1, ge=1, le=10)
    emergency_procedure: Optional[bool] = Field(False, description="Emergency procedure indicator")
    days_since_last_procedure: Optional[int] = Field(90, ge=0)
    time_of_day: Optional[int] = Field(12, ge=0, le=23)
    weekend: Optional[bool] = Field(False, description="Weekend procedure indicator")
    facility_risk_score: Optional[float] = Field(0.1, ge=0, le=1, description="Healthcare facility risk score")
    staff_experience_score: Optional[float] = Field(0.8, ge=0, le=1, description="Medical staff experience score")
    equipment_condition_score: Optional[float] = Field(0.9, ge=0, le=1, description="Medical equipment condition score")

# Response schemas
class PredictionResponse(BaseModel):
    """Generic prediction response schema"""
    prediction_type: str = Field(..., description="Type of prediction")
    result: Dict[str, Any] = Field(..., description="Prediction results")
    confidence: float = Field(..., ge=0, le=1, description="Prediction confidence score")
    model_version: str = Field(..., description="Model version used")
    timestamp: Optional[str] = Field(default_factory=lambda: datetime.now().isoformat())
    processing_time_ms: Optional[float] = Field(None, ge=0, description="Processing time in milliseconds")
    
    @validator('timestamp')
    def validate_timestamp(cls, v):
        try:
            datetime.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError('Invalid timestamp format')

class ErrorResponse(BaseModel):
    """Error response schema"""
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    request_id: Optional[str] = Field(None, description="Request identifier for tracking")

class HealthCheckResponse(BaseModel):
    """Health check response schema"""
    status: str = Field(..., description="Service status")
    service: str = Field(..., description="Service name")
    version: str = Field(..., description="Service version")
    models_loaded: int = Field(..., ge=0, description="Number of loaded models")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    uptime_seconds: Optional[float] = Field(None, ge=0, description="Service uptime in seconds")

class ModelMetricsResponse(BaseModel):
    """Model metrics response schema"""
    model: str = Field(..., description="Model name")
    version: str = Field(..., description="Model version")
    metrics: Dict[str, float] = Field(..., description="Model performance metrics")
    last_trained: Optional[str] = Field(None, description="Last training timestamp")
    training_samples: Optional[int] = Field(None, ge=0, description="Number of training samples")
    validation_samples: Optional[int] = Field(None, ge=0, description="Number of validation samples")
