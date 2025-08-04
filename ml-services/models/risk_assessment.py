import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score
import joblib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import asyncio

logger = logging.getLogger(__name__)

class RiskAssessment:
    """
    Machine Learning model to assess risks for blood donation and transfusion:
    - Donor health risks
    - Patient transfusion risks
    - Procedural risks
    - Adverse reaction prediction
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.metrics = {}
        self.risk_categories = {
            'LOW': (0.0, 0.3),
            'MODERATE': (0.3, 0.6),
            'HIGH': (0.6, 0.8),
            'CRITICAL': (0.8, 1.0)
        }
        
    async def assess(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess risk factors for donation or transfusion"""
        try:
            if not self.is_trained:
                await self.load_or_train()
            
            assessment_type = input_data.get('assessment_type', 'donation')  # 'donation' or 'transfusion'
            
            # Prepare features
            features = await self.prepare_features(input_data)
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Make prediction
            risk_prob = self.model.predict_proba(features_scaled)[0]
            risk_score = risk_prob[1]  # Probability of high risk
            
            # Categorize risk
            risk_category = self._categorize_risk(risk_score)
            
            # Generate detailed assessment
            assessment = {
                'risk_score': float(risk_score),
                'risk_category': risk_category,
                'confidence': float(max(risk_prob) - min(risk_prob)),
                'assessment_type': assessment_type,
                'risk_factors': self._identify_risk_factors(input_data),
                'mitigation_strategies': self._generate_mitigation_strategies(risk_score, input_data),
                'recommendations': self._generate_recommendations(risk_score, assessment_type),
                'monitoring_requirements': self._get_monitoring_requirements(risk_category)
            }
            
            return assessment
            
        except Exception as e:
            logger.error(f"Risk assessment failed: {e}")
            raise
    
    async def prepare_features(self, data: Dict[str, Any]) -> np.ndarray:
        """Prepare features for risk assessment"""
        features = []
        
        # Subject information (donor or patient)
        subject = data.get('subject', {})
        
        # Demographics
        features.extend([
            subject.get('age', 30),
            1 if subject.get('gender') == 'male' else 0,
            subject.get('weight', 70),
            subject.get('height', 170)
        ])
        
        # Medical history
        features.extend([
            len(subject.get('chronic_conditions', [])),
            len(subject.get('medications', [])),
            len(subject.get('allergies', [])),
            1 if subject.get('previous_adverse_reactions', False) else 0
        ])
        
        # Vital signs
        vitals = subject.get('vitals', {})
        features.extend([
            vitals.get('blood_pressure_systolic', 120),
            vitals.get('blood_pressure_diastolic', 80),
            vitals.get('heart_rate', 70),
            vitals.get('hemoglobin', 14.0)
        ])
        
        # Procedure-specific features
        features.extend([
            data.get('urgency_level', 1),
            data.get('units_required', 1),
            1 if data.get('emergency_procedure', False) else 0
        ])
        
        # Time-based features
        features.extend([
            data.get('days_since_last_procedure', 90),
            data.get('time_of_day', 12),  # Hour of day
            1 if data.get('weekend', False) else 0
        ])
        
        # Environmental factors
        features.extend([
            data.get('facility_risk_score', 0.1),
            data.get('staff_experience_score', 0.8),
            data.get('equipment_condition_score', 0.9)
        ])
        
        return np.array(features).reshape(1, -1)
    
    def _categorize_risk(self, risk_score: float) -> str:
        """Categorize risk score into risk levels"""
        for category, (min_score, max_score) in self.risk_categories.items():
            if min_score <= risk_score < max_score:
                return category
        return 'CRITICAL'  # Default to highest risk
    
    def _identify_risk_factors(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify specific risk factors"""
        risk_factors = []
        subject = data.get('subject', {})
        
        # Age-related risks
        age = subject.get('age', 30)
        if age < 18:
            risk_factors.append({
                'factor': 'Young age',
                'severity': 'MODERATE',
                'description': 'Pediatric subjects require special protocols'
            })
        elif age > 65:
            risk_factors.append({
                'factor': 'Advanced age',
                'severity': 'MODERATE',
                'description': 'Increased risk of complications in elderly subjects'
            })
        
        # Medical history risks
        chronic_conditions = subject.get('chronic_conditions', [])
        high_risk_conditions = ['diabetes', 'heart_disease', 'kidney_disease', 'liver_disease']
        for condition in chronic_conditions:
            if condition.lower() in high_risk_conditions:
                risk_factors.append({
                    'factor': f'Chronic condition: {condition}',
                    'severity': 'HIGH',
                    'description': f'{condition} increases procedural risks'
                })
        
        # Medication risks
        medications = subject.get('medications', [])
        high_risk_meds = ['anticoagulants', 'immunosuppressants', 'chemotherapy']
        for med in medications:
            if med.lower() in high_risk_meds:
                risk_factors.append({
                    'factor': f'High-risk medication: {med}',
                    'severity': 'HIGH',
                    'description': f'{med} may affect procedure safety'
                })
        
        # Vital signs risks
        vitals = subject.get('vitals', {})
        bp_systolic = vitals.get('blood_pressure_systolic', 120)
        if bp_systolic > 160 or bp_systolic < 90:
            risk_factors.append({
                'factor': 'Abnormal blood pressure',
                'severity': 'HIGH',
                'description': f'Blood pressure {bp_systolic} mmHg is outside safe range'
            })
        
        hemoglobin = vitals.get('hemoglobin', 14.0)
        if hemoglobin < 12.0:
            risk_factors.append({
                'factor': 'Low hemoglobin',
                'severity': 'MODERATE',
                'description': f'Hemoglobin {hemoglobin} g/dL may indicate anemia'
            })
        
        # Emergency procedure risks
        if data.get('emergency_procedure', False):
            risk_factors.append({
                'factor': 'Emergency procedure',
                'severity': 'HIGH',
                'description': 'Emergency procedures carry increased risks'
            })
        
        return risk_factors
    
    def _generate_mitigation_strategies(self, risk_score: float, data: Dict[str, Any]) -> List[str]:
        """Generate risk mitigation strategies"""
        strategies = []
        
        if risk_score > 0.6:  # High risk
            strategies.extend([
                "Implement enhanced monitoring protocols",
                "Ensure senior medical staff supervision",
                "Prepare emergency response equipment",
                "Consider pre-medication if appropriate"
            ])
        
        if risk_score > 0.3:  # Moderate risk
            strategies.extend([
                "Conduct thorough pre-procedure assessment",
                "Monitor vital signs closely during procedure",
                "Have emergency medications readily available"
            ])
        
        # Specific strategies based on risk factors
        subject = data.get('subject', {})
        if subject.get('age', 30) > 65:
            strategies.append("Use age-appropriate protocols and dosing")
        
        if data.get('emergency_procedure', False):
            strategies.append("Follow emergency procedure protocols")
        
        return strategies
    
    def _generate_recommendations(self, risk_score: float, assessment_type: str) -> List[str]:
        """Generate recommendations based on risk assessment"""
        recommendations = []
        
        if risk_score < 0.3:  # Low risk
            recommendations.extend([
                "Proceed with standard protocols",
                "Routine monitoring sufficient"
            ])
        elif risk_score < 0.6:  # Moderate risk
            recommendations.extend([
                "Proceed with enhanced precautions",
                "Consider additional pre-procedure tests",
                "Ensure experienced staff availability"
            ])
        elif risk_score < 0.8:  # High risk
            recommendations.extend([
                "Consider postponing if not urgent",
                "Require specialist consultation",
                "Implement comprehensive monitoring",
                "Prepare for potential complications"
            ])
        else:  # Critical risk
            recommendations.extend([
                "Proceed only if life-threatening emergency",
                "Require multiple specialist consultations",
                "Implement maximum monitoring protocols",
                "Have emergency team on standby"
            ])
        
        return recommendations
    
    def _get_monitoring_requirements(self, risk_category: str) -> Dict[str, Any]:
        """Get monitoring requirements based on risk category"""
        monitoring_requirements = {
            'LOW': {
                'frequency': 'Standard',
                'duration': '2 hours post-procedure',
                'parameters': ['vital signs', 'general condition']
            },
            'MODERATE': {
                'frequency': 'Every 15 minutes',
                'duration': '4 hours post-procedure',
                'parameters': ['vital signs', 'neurological status', 'bleeding assessment']
            },
            'HIGH': {
                'frequency': 'Every 10 minutes',
                'duration': '8 hours post-procedure',
                'parameters': ['continuous vital signs', 'neurological status', 'laboratory values', 'fluid balance']
            },
            'CRITICAL': {
                'frequency': 'Continuous',
                'duration': '24 hours post-procedure',
                'parameters': ['continuous monitoring', 'intensive care protocols', 'frequent laboratory assessments']
            }
        }
        
        return monitoring_requirements.get(risk_category, monitoring_requirements['LOW'])
    
    async def train(self) -> Dict[str, Any]:
        """Train the risk assessment model"""
        try:
            logger.info("Starting risk assessment model training...")
            
            # Generate synthetic training data
            training_data = self._generate_synthetic_data(1000)
            
            # Prepare features and labels
            X, y = await self._prepare_training_data(training_data)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            
            self.model.fit(X_scaled, y)
            
            # Calculate metrics
            y_pred = self.model.predict(X_scaled)
            self.metrics = {
                'accuracy': accuracy_score(y, y_pred),
                'precision': precision_score(y, y_pred, average='weighted'),
                'recall': recall_score(y, y_pred, average='weighted'),
                'training_samples': len(X)
            }
            
            self.is_trained = True
            await self.save_model()
            
            logger.info(f"Risk assessment model training completed. Accuracy: {self.metrics['accuracy']:.3f}")
            return self.metrics
            
        except Exception as e:
            logger.error(f"Model training failed: {e}")
            raise
    
    def _generate_synthetic_data(self, n_samples: int) -> pd.DataFrame:
        """Generate synthetic training data"""
        np.random.seed(42)
        
        data = {
            'age': np.random.normal(40, 15, n_samples),
            'chronic_conditions': np.random.poisson(1, n_samples),
            'medications': np.random.poisson(2, n_samples),
            'bp_systolic': np.random.normal(130, 20, n_samples),
            'hemoglobin': np.random.normal(14, 2, n_samples),
            'emergency': np.random.binomial(1, 0.2, n_samples),
            'high_risk': np.random.binomial(1, 0.3, n_samples)
        }
        
        return pd.DataFrame(data)
    
    async def _prepare_training_data(self, data: pd.DataFrame) -> tuple:
        """Prepare training data"""
        X = np.random.random((len(data), 20))  # 20 features
        y = data['high_risk'].values
        return X, y
    
    async def save_model(self):
        """Save trained model"""
        try:
            model_path = f"models/saved/risk_assessment_v{self.version}.joblib"
            joblib.dump({
                'model': self.model,
                'scaler': self.scaler,
                'metrics': self.metrics,
                'version': self.version
            }, model_path)
            logger.info(f"Model saved to {model_path}")
        except Exception as e:
            logger.error(f"Failed to save model: {e}")
    
    async def load_or_train(self):
        """Load existing model or train new one"""
        try:
            model_path = f"models/saved/risk_assessment_v{self.version}.joblib"
            saved_data = joblib.load(model_path)
            self.model = saved_data['model']
            self.scaler = saved_data['scaler']
            self.metrics = saved_data.get('metrics', {})
            self.is_trained = True
            logger.info(f"Model loaded from {model_path}")
        except:
            logger.info("No pre-trained model found, training new model...")
            await self.train()
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get model performance metrics"""
        return {
            'version': self.version,
            'is_trained': self.is_trained,
            'metrics': self.metrics,
            'last_updated': datetime.now().isoformat()
        }
