import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score
import joblib
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
import asyncio

logger = logging.getLogger(__name__)

class CompatibilityMatcher:
    """
    Machine Learning model to assess compatibility between donors and patients based on:
    - Blood type compatibility
    - Medical history
    - Geographic proximity
    - Availability timing
    - Risk factors
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.metrics = {}
        self.blood_compatibility_matrix = self._create_compatibility_matrix()
        
    def _create_compatibility_matrix(self) -> Dict[str, List[str]]:
        """Create blood type compatibility matrix"""
        return {
            'O_NEGATIVE': ['O_NEGATIVE', 'O_POSITIVE', 'A_NEGATIVE', 'A_POSITIVE', 
                          'B_NEGATIVE', 'B_POSITIVE', 'AB_NEGATIVE', 'AB_POSITIVE'],
            'O_POSITIVE': ['O_POSITIVE', 'A_POSITIVE', 'B_POSITIVE', 'AB_POSITIVE'],
            'A_NEGATIVE': ['A_NEGATIVE', 'A_POSITIVE', 'AB_NEGATIVE', 'AB_POSITIVE'],
            'A_POSITIVE': ['A_POSITIVE', 'AB_POSITIVE'],
            'B_NEGATIVE': ['B_NEGATIVE', 'B_POSITIVE', 'AB_NEGATIVE', 'AB_POSITIVE'],
            'B_POSITIVE': ['B_POSITIVE', 'AB_POSITIVE'],
            'AB_NEGATIVE': ['AB_NEGATIVE', 'AB_POSITIVE'],
            'AB_POSITIVE': ['AB_POSITIVE']
        }
    
    async def assess(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess compatibility between donor and patient"""
        try:
            if not self.is_trained:
                await self.load_or_train()
            
            # Extract donor and patient data
            donor_data = input_data.get('donor', {})
            patient_data = input_data.get('patient', {})
            
            # Check blood type compatibility
            blood_compatibility = self._check_blood_compatibility(
                donor_data.get('blood_type'), 
                patient_data.get('blood_type')
            )
            
            if not blood_compatibility['compatible']:
                return {
                    'score': 0.0,
                    'compatible': False,
                    'reason': 'Blood type incompatibility',
                    'blood_compatibility': blood_compatibility,
                    'recommendations': ['Find alternative donor with compatible blood type']
                }
            
            # Prepare features for ML assessment
            features = await self.prepare_features(input_data)
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Make prediction
            compatibility_prob = self.model.predict_proba(features_scaled)[0]
            compatibility_score = compatibility_prob[1]  # Probability of compatibility
            
            # Generate detailed assessment
            assessment = {
                'score': float(compatibility_score),
                'compatible': compatibility_score > 0.7,
                'confidence': float(max(compatibility_prob) - min(compatibility_prob)),
                'blood_compatibility': blood_compatibility,
                'risk_factors': self._assess_risk_factors(donor_data, patient_data),
                'geographic_score': self._calculate_geographic_score(donor_data, patient_data),
                'timing_score': self._calculate_timing_score(input_data),
                'recommendations': self._generate_recommendations(compatibility_score, input_data)
            }
            
            return assessment
            
        except Exception as e:
            logger.error(f"Compatibility assessment failed: {e}")
            raise
    
    def _check_blood_compatibility(self, donor_type: str, patient_type: str) -> Dict[str, Any]:
        """Check blood type compatibility"""
        if not donor_type or not patient_type:
            return {'compatible': False, 'reason': 'Missing blood type information'}
        
        compatible_recipients = self.blood_compatibility_matrix.get(donor_type, [])
        is_compatible = patient_type in compatible_recipients
        
        return {
            'compatible': is_compatible,
            'donor_type': donor_type,
            'patient_type': patient_type,
            'compatibility_level': 'PERFECT' if donor_type == patient_type else 'COMPATIBLE' if is_compatible else 'INCOMPATIBLE'
        }
    
    async def prepare_features(self, data: Dict[str, Any]) -> np.ndarray:
        """Prepare features for compatibility assessment"""
        donor_data = data.get('donor', {})
        patient_data = data.get('patient', {})
        
        features = []
        
        # Blood type compatibility score
        blood_compat = self._check_blood_compatibility(
            donor_data.get('blood_type'), 
            patient_data.get('blood_type')
        )
        features.append(1.0 if blood_compat['compatible'] else 0.0)
        
        # Age compatibility
        donor_age = donor_data.get('age', 30)
        patient_age = patient_data.get('age', 30)
        age_diff = abs(donor_age - patient_age)
        features.append(max(0, 1 - age_diff / 50))  # Normalize age difference
        
        # Geographic proximity
        features.append(self._calculate_geographic_score(donor_data, patient_data))
        
        # Medical history compatibility
        features.extend(self._extract_medical_features(donor_data, patient_data))
        
        # Timing features
        features.append(self._calculate_timing_score(data))
        
        # Donor reliability score
        features.append(donor_data.get('reliability_score', 0.8))
        
        # Urgency factor
        features.append(data.get('urgency_level', 1) / 5.0)
        
        return np.array(features).reshape(1, -1)
    
    def _calculate_geographic_score(self, donor_data: Dict, patient_data: Dict) -> float:
        """Calculate geographic proximity score"""
        try:
            donor_lat = donor_data.get('latitude', 0)
            donor_lon = donor_data.get('longitude', 0)
            patient_lat = patient_data.get('latitude', 0)
            patient_lon = patient_data.get('longitude', 0)
            
            # Simple distance calculation (in practice, use proper geospatial libraries)
            distance = np.sqrt((donor_lat - patient_lat)**2 + (donor_lon - patient_lon)**2)
            
            # Convert to score (closer = higher score)
            max_distance = 1.0  # Adjust based on your geographic scale
            score = max(0, 1 - distance / max_distance)
            return score
        except:
            return 0.5  # Default score if location data is missing
    
    def _calculate_timing_score(self, data: Dict[str, Any]) -> float:
        """Calculate timing compatibility score"""
        try:
            urgency = data.get('urgency_level', 1)
            donor_availability = data.get('donor', {}).get('available_hours', 24)
            
            # Higher urgency requires higher availability
            if urgency >= 4:  # Emergency
                return 1.0 if donor_availability >= 2 else 0.3
            elif urgency >= 2:  # Urgent
                return 1.0 if donor_availability >= 8 else 0.7
            else:  # Regular
                return 0.9
        except:
            return 0.8
    
    def _extract_medical_features(self, donor_data: Dict, patient_data: Dict) -> List[float]:
        """Extract medical compatibility features"""
        features = []
        
        # Donor health status
        features.append(donor_data.get('health_score', 0.9))
        
        # Patient condition severity
        features.append(1 - patient_data.get('condition_severity', 0.3))
        
        # Medication compatibility
        donor_meds = set(donor_data.get('medications', []))
        patient_meds = set(patient_data.get('medications', []))
        conflicting_meds = len(donor_meds.intersection(patient_meds))
        features.append(max(0, 1 - conflicting_meds * 0.2))
        
        return features
    
    def _assess_risk_factors(self, donor_data: Dict, patient_data: Dict) -> List[str]:
        """Assess potential risk factors"""
        risks = []
        
        # Age-related risks
        if donor_data.get('age', 30) > 60:
            risks.append("Donor age over 60")
        
        if patient_data.get('age', 30) < 18:
            risks.append("Pediatric patient requires special handling")
        
        # Medical history risks
        if donor_data.get('recent_illness', False):
            risks.append("Donor recent illness history")
        
        if patient_data.get('immune_compromised', False):
            risks.append("Patient is immunocompromised")
        
        return risks
    
    def _generate_recommendations(self, score: float, input_data: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on compatibility score"""
        recommendations = []
        
        if score < 0.5:
            recommendations.extend([
                "Consider alternative donors",
                "Review compatibility factors",
                "Consult with medical team"
            ])
        elif score < 0.7:
            recommendations.extend([
                "Proceed with caution",
                "Monitor for adverse reactions",
                "Have backup donor ready"
            ])
        else:
            recommendations.extend([
                "Excellent compatibility match",
                "Proceed with standard protocols"
            ])
        
        urgency = input_data.get('urgency_level', 1)
        if urgency >= 4:
            recommendations.append("Emergency protocols activated")
        
        return recommendations
    
    async def train(self) -> Dict[str, Any]:
        """Train the compatibility matching model"""
        try:
            logger.info("Starting compatibility matching model training...")
            
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
            
            logger.info(f"Compatibility matching model training completed. Accuracy: {self.metrics['accuracy']:.3f}")
            return self.metrics
            
        except Exception as e:
            logger.error(f"Model training failed: {e}")
            raise
    
    def _generate_synthetic_data(self, n_samples: int) -> pd.DataFrame:
        """Generate synthetic training data"""
        np.random.seed(42)
        
        data = {
            'blood_compatible': np.random.binomial(1, 0.8, n_samples),
            'age_diff': np.random.exponential(10, n_samples),
            'distance': np.random.exponential(20, n_samples),
            'urgency': np.random.randint(1, 6, n_samples),
            'successful_match': np.random.binomial(1, 0.75, n_samples)
        }
        
        return pd.DataFrame(data)
    
    async def _prepare_training_data(self, data: pd.DataFrame) -> tuple:
        """Prepare training data"""
        X = np.random.random((len(data), 8))  # 8 features
        y = data['successful_match'].values
        return X, y
    
    async def save_model(self):
        """Save trained model"""
        try:
            model_path = f"models/saved/compatibility_matcher_v{self.version}.joblib"
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
            model_path = f"models/saved/compatibility_matcher_v{self.version}.joblib"
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
