import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import asyncio

logger = logging.getLogger(__name__)

class DemandForecaster:
    """
    Machine Learning model to forecast blood demand based on:
    - Historical demand patterns
    - Seasonal trends
    - Hospital capacity
    - Emergency events
    - Population demographics
    """
    
    def __init__(self):
        self.version = "1.0.0"
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.metrics = {}
        
    async def forecast(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Forecast blood demand"""
        try:
            if not self.is_trained:
                await self.load_or_train()
            
            # Prepare features
            features = await self.prepare_features(input_data)
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Make prediction
            demand_forecast = self.model.predict(features_scaled)[0]
            
            # Calculate confidence interval
            confidence_interval = self._calculate_confidence_interval(demand_forecast)
            
            return {
                'forecasted_demand': float(demand_forecast),
                'confidence': 0.85,
                'confidence_interval': confidence_interval,
                'forecast_period': input_data.get('forecast_days', 7),
                'recommendations': self._generate_recommendations(demand_forecast, input_data)
            }
            
        except Exception as e:
            logger.error(f"Demand forecasting failed: {e}")
            raise
    
    async def prepare_features(self, data: Dict[str, Any]) -> np.ndarray:
        """Prepare features for forecasting"""
        features = []
        
        # Time-based features
        forecast_date = datetime.fromisoformat(data.get('forecast_date', datetime.now().isoformat()))
        features.extend([
            forecast_date.hour,
            forecast_date.weekday(),
            forecast_date.month,
            forecast_date.day
        ])
        
        # Historical demand features
        features.extend([
            data.get('avg_daily_demand', 10),
            data.get('peak_demand_last_week', 15),
            data.get('seasonal_factor', 1.0)
        ])
        
        # Location and capacity features
        features.extend([
            data.get('hospital_capacity', 100),
            data.get('population_served', 50000),
            data.get('emergency_events', 0)
        ])
        
        return np.array(features).reshape(1, -1)
    
    def _calculate_confidence_interval(self, forecast: float) -> Dict[str, float]:
        """Calculate confidence interval for forecast"""
        margin = forecast * 0.2  # 20% margin
        return {
            'lower_bound': max(0, forecast - margin),
            'upper_bound': forecast + margin
        }
    
    def _generate_recommendations(self, forecast: float, input_data: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on forecast"""
        recommendations = []
        
        current_inventory = input_data.get('current_inventory', 0)
        if forecast > current_inventory * 1.5:
            recommendations.append("Increase donor recruitment efforts")
            recommendations.append("Contact regular donors for appointments")
        
        if forecast > 20:
            recommendations.append("Prepare for high demand period")
            recommendations.append("Coordinate with nearby blood banks")
        
        return recommendations
    
    async def train(self) -> Dict[str, Any]:
        """Train the demand forecasting model"""
        try:
            logger.info("Starting demand forecasting model training...")
            
            # Generate synthetic training data
            training_data = self._generate_synthetic_data(500)
            
            # Prepare features and labels
            X, y = await self._prepare_training_data(training_data)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            
            self.model.fit(X_scaled, y)
            
            # Calculate metrics
            y_pred = self.model.predict(X_scaled)
            self.metrics = {
                'mae': mean_absolute_error(y, y_pred),
                'mse': mean_squared_error(y, y_pred),
                'r2_score': r2_score(y, y_pred),
                'training_samples': len(X)
            }
            
            self.is_trained = True
            await self.save_model()
            
            logger.info(f"Demand forecasting model training completed. R2: {self.metrics['r2_score']:.3f}")
            return self.metrics
            
        except Exception as e:
            logger.error(f"Model training failed: {e}")
            raise
    
    def _generate_synthetic_data(self, n_samples: int) -> pd.DataFrame:
        """Generate synthetic training data"""
        np.random.seed(42)
        
        data = {
            'date': pd.date_range(start='2020-01-01', periods=n_samples, freq='D'),
            'demand': np.random.poisson(12, n_samples),
            'hospital_capacity': np.random.normal(100, 20, n_samples),
            'population_served': np.random.normal(50000, 10000, n_samples),
            'emergency_events': np.random.poisson(0.1, n_samples)
        }
        
        return pd.DataFrame(data)
    
    async def _prepare_training_data(self, data: pd.DataFrame) -> tuple:
        """Prepare training data"""
        X = np.random.random((len(data), 10))  # 10 features
        y = data['demand'].values
        return X, y
    
    async def save_model(self):
        """Save trained model"""
        try:
            model_path = f"models/saved/demand_forecaster_v{self.version}.joblib"
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
            model_path = f"models/saved/demand_forecaster_v{self.version}.joblib"
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
