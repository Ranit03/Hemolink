import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import asyncio

from services.data_service import DataService
from utils.feature_engineering import FeatureEngineer

logger = logging.getLogger(__name__)

class DonorAvailabilityPredictor:
    """
    Machine Learning model to predict donor availability based on:
    - Historical donation patterns
    - Seasonal trends
    - Donor demographics
    - Location factors
    - Time-based features
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_engineer = FeatureEngineer()
        self.is_trained = False
        self.metrics = {}
        
    async def prepare_features(self, data: Dict[str, Any]) -> np.ndarray:
        """Prepare features for prediction"""
        try:
            # Extract features from input data
            features = []
            
            # Donor demographics
            features.extend([
                data.get('donor_age', 0),
                data.get('donor_weight', 0),
                data.get('donor_height', 0),
                data.get('donation_count', 0),
                data.get('days_since_last_donation', 0),
            ])
            
            # Blood type encoding
            blood_type = data.get('blood_type', 'O_POSITIVE')
            blood_type_encoded = self._encode_blood_type(blood_type)
            features.extend(blood_type_encoded)
            
            # Time-based features
            request_date = datetime.fromisoformat(data.get('request_date', datetime.now().isoformat()))
            time_features = self.feature_engineer.extract_time_features(request_date)
            features.extend(time_features)
            
            # Location features
            location = data.get('location', {})
            location_features = self.feature_engineer.extract_location_features(location)
            features.extend(location_features)
            
            # Urgency and demand features
            features.extend([
                data.get('urgency_level', 1),
                data.get('units_required', 1),
                data.get('local_demand_score', 0.5),
            ])
            
            # Weather features (if available)
            weather_features = await self._get_weather_features(location)
            features.extend(weather_features)
            
            return np.array(features).reshape(1, -1)
            
        except Exception as e:
            logger.error(f"Feature preparation failed: {e}")
            raise
    
    def _encode_blood_type(self, blood_type: str) -> List[float]:
        """Encode blood type as one-hot vector"""
        blood_types = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 
                      'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
        encoding = [1.0 if bt == blood_type else 0.0 for bt in blood_types]
        return encoding
    
    async def _get_weather_features(self, location: Dict[str, Any]) -> List[float]:
        """Extract weather-based features that might affect donor availability"""
        try:
            # Placeholder for weather API integration
            # In production, integrate with weather service
            return [
                0.5,  # temperature_normalized
                0.5,  # precipitation_probability
                0.5,  # weather_severity_score
            ]
        except Exception:
            return [0.5, 0.5, 0.5]  # Default values
    
    async def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict donor availability"""
        try:
            if not self.is_trained:
                await self.load_or_train()
            
            # Prepare features
            features = await self.prepare_features(input_data)
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Make prediction
            availability_prob = self.model.predict_proba(features_scaled)[0]
            availability_score = availability_prob[1]  # Probability of being available
            
            # Calculate confidence based on model certainty
            confidence = max(availability_prob) - min(availability_prob)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                availability_score, input_data
            )
            
            return {
                'availability_score': float(availability_score),
                'availability_category': self._categorize_availability(availability_score),
                'confidence': float(confidence),
                'recommendations': recommendations,
                'predicted_response_time': self._estimate_response_time(availability_score),
                'factors': self._explain_prediction(features_scaled[0], input_data)
            }
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise
    
    def _categorize_availability(self, score: float) -> str:
        """Categorize availability score"""
        if score >= 0.8:
            return "HIGH"
        elif score >= 0.6:
            return "MEDIUM"
        elif score >= 0.4:
            return "LOW"
        else:
            return "VERY_LOW"
    
    def _estimate_response_time(self, availability_score: float) -> Dict[str, int]:
        """Estimate response time based on availability"""
        base_hours = 24
        multiplier = 2 - availability_score  # Higher availability = faster response
        
        estimated_hours = int(base_hours * multiplier)
        
        return {
            'estimated_hours': estimated_hours,
            'min_hours': max(2, estimated_hours - 6),
            'max_hours': estimated_hours + 12
        }
    
    def _generate_recommendations(self, score: float, input_data: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if score < 0.5:
            recommendations.extend([
                "Consider expanding search radius",
                "Check for alternative blood types",
                "Contact donors who haven't donated recently"
            ])
        
        urgency = input_data.get('urgency_level', 1)
        if urgency >= 4:
            recommendations.append("Activate emergency donor network")
        
        if input_data.get('units_required', 1) > 2:
            recommendations.append("Consider splitting request among multiple donors")
        
        return recommendations
    
    def _explain_prediction(self, features: np.ndarray, input_data: Dict[str, Any]) -> Dict[str, float]:
        """Provide feature importance for prediction explanation"""
        try:
            if hasattr(self.model, 'feature_importances_'):
                feature_names = self._get_feature_names()
                importances = self.model.feature_importances_
                
                # Get top 5 most important features
                top_indices = np.argsort(importances)[-5:]
                top_factors = {
                    feature_names[i]: float(importances[i]) 
                    for i in top_indices
                }
                return top_factors
        except Exception:
            pass
        
        return {"model_confidence": 0.8}
    
    def _get_feature_names(self) -> List[str]:
        """Get feature names for explanation"""
        return [
            'donor_age', 'donor_weight', 'donor_height', 'donation_count',
            'days_since_last_donation', 'blood_type_A_POS', 'blood_type_A_NEG',
            'blood_type_B_POS', 'blood_type_B_NEG', 'blood_type_AB_POS',
            'blood_type_AB_NEG', 'blood_type_O_POS', 'blood_type_O_NEG',
            'hour_of_day', 'day_of_week', 'month', 'is_weekend', 'is_holiday',
            'latitude', 'longitude', 'population_density', 'urgency_level',
            'units_required', 'local_demand_score', 'temperature', 'precipitation',
            'weather_severity'
        ]
    
    async def train(self) -> Dict[str, Any]:
        """Train the donor availability prediction model"""
        try:
            logger.info("Starting donor availability model training...")
            
            # Get training data
            data_service = DataService()
            training_data = await data_service.get_donor_training_data()
            
            if len(training_data) < 100:
                logger.warning("Insufficient training data, using synthetic data")
                training_data = self._generate_synthetic_data(1000)
            
            # Prepare features and labels
            X, y = await self._prepare_training_data(training_data)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
            
            self.model.fit(X_train_scaled, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test_scaled)
            
            self.metrics = {
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred, average='weighted'),
                'recall': recall_score(y_test, y_pred, average='weighted'),
                'f1_score': f1_score(y_test, y_pred, average='weighted'),
                'training_samples': len(X_train),
                'test_samples': len(X_test)
            }
            
            self.is_trained = True
            
            # Save model
            await self.save_model()
            
            logger.info(f"Model training completed. Accuracy: {self.metrics['accuracy']:.3f}")
            return self.metrics
            
        except Exception as e:
            logger.error(f"Model training failed: {e}")
            raise
    
    def _generate_synthetic_data(self, n_samples: int) -> pd.DataFrame:
        """Generate synthetic training data for development"""
        np.random.seed(42)
        
        data = {
            'donor_id': range(n_samples),
            'age': np.random.normal(35, 10, n_samples),
            'weight': np.random.normal(70, 15, n_samples),
            'donation_count': np.random.poisson(3, n_samples),
            'days_since_last_donation': np.random.exponential(90, n_samples),
            'blood_type': np.random.choice(['A_POSITIVE', 'B_POSITIVE', 'O_POSITIVE', 'AB_POSITIVE'], n_samples),
            'hour_of_day': np.random.randint(0, 24, n_samples),
            'day_of_week': np.random.randint(0, 7, n_samples),
            'urgency_level': np.random.randint(1, 6, n_samples),
            'responded': np.random.binomial(1, 0.7, n_samples)  # 70% response rate
        }
        
        return pd.DataFrame(data)
    
    async def _prepare_training_data(self, data: pd.DataFrame) -> tuple:
        """Prepare training data"""
        # This would be implemented based on actual data structure
        # For now, return placeholder
        X = np.random.random((len(data), 25))  # 25 features
        y = data.get('responded', np.random.binomial(1, 0.7, len(data)))
        return X, y
    
    async def save_model(self):
        """Save trained model"""
        try:
            model_path = f"models/saved/donor_predictor_v{self.version}.joblib"
            joblib.dump({
                'model': self.model,
                'scaler': self.scaler,
                'metrics': self.metrics,
                'version': self.version
            }, model_path)
            logger.info(f"Model saved to {model_path}")
        except Exception as e:
            logger.error(f"Failed to save model: {e}")
    
    async def load_model(self, model_path: str):
        """Load pre-trained model"""
        try:
            saved_data = joblib.load(model_path)
            self.model = saved_data['model']
            self.scaler = saved_data['scaler']
            self.metrics = saved_data.get('metrics', {})
            self.version = saved_data.get('version', self.version)
            self.is_trained = True
            logger.info(f"Model loaded from {model_path}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    async def load_or_train(self):
        """Load existing model or train new one"""
        try:
            model_path = f"models/saved/donor_predictor_v{self.version}.joblib"
            await self.load_model(model_path)
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
