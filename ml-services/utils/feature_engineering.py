import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class FeatureEngineer:
    """
    Feature engineering utilities for ML models
    """
    
    def __init__(self):
        self.holidays = self._get_indian_holidays()
    
    def extract_time_features(self, timestamp: datetime) -> List[float]:
        """Extract time-based features from timestamp"""
        try:
            features = []
            
            # Hour of day (normalized)
            features.append(timestamp.hour / 23.0)
            
            # Day of week (0=Monday, 6=Sunday)
            features.append(timestamp.weekday() / 6.0)
            
            # Day of month (normalized)
            features.append((timestamp.day - 1) / 30.0)
            
            # Month (normalized)
            features.append((timestamp.month - 1) / 11.0)
            
            # Quarter
            quarter = (timestamp.month - 1) // 3
            features.append(quarter / 3.0)
            
            # Is weekend
            features.append(1.0 if timestamp.weekday() >= 5 else 0.0)
            
            # Is holiday
            features.append(1.0 if self._is_holiday(timestamp) else 0.0)
            
            # Cyclical features for hour and day of week
            hour_sin = np.sin(2 * np.pi * timestamp.hour / 24)
            hour_cos = np.cos(2 * np.pi * timestamp.hour / 24)
            features.extend([hour_sin, hour_cos])
            
            dow_sin = np.sin(2 * np.pi * timestamp.weekday() / 7)
            dow_cos = np.cos(2 * np.pi * timestamp.weekday() / 7)
            features.extend([dow_sin, dow_cos])
            
            return features
            
        except Exception as e:
            logger.error(f"Failed to extract time features: {e}")
            return [0.0] * 12  # Return default features
    
    def extract_location_features(self, location: Dict[str, Any]) -> List[float]:
        """Extract location-based features"""
        try:
            features = []
            
            # Coordinates (normalized for India)
            lat = location.get('latitude', 20.0)  # Default to central India
            lon = location.get('longitude', 77.0)
            
            # Normalize coordinates
            lat_norm = (lat - 8.0) / (37.0 - 8.0)  # India lat range: 8°N to 37°N
            lon_norm = (lon - 68.0) / (97.0 - 68.0)  # India lon range: 68°E to 97°E
            
            features.extend([lat_norm, lon_norm])
            
            # Population density (if available)
            pop_density = location.get('population_density', 400)  # India average
            pop_density_norm = min(pop_density / 10000, 1.0)  # Normalize to 0-1
            features.append(pop_density_norm)
            
            # Urban/rural classification
            is_urban = location.get('is_urban', True)
            features.append(1.0 if is_urban else 0.0)
            
            # Distance to major city (if available)
            distance_to_city = location.get('distance_to_major_city', 50)  # km
            distance_norm = min(distance_to_city / 500, 1.0)  # Normalize
            features.append(distance_norm)
            
            return features
            
        except Exception as e:
            logger.error(f"Failed to extract location features: {e}")
            return [0.5, 0.5, 0.4, 1.0, 0.1]  # Default features
    
    def extract_medical_features(self, medical_data: Dict[str, Any]) -> List[float]:
        """Extract medical history features"""
        try:
            features = []
            
            # Age (normalized)
            age = medical_data.get('age', 30)
            age_norm = min(age / 100, 1.0)
            features.append(age_norm)
            
            # BMI calculation and normalization
            weight = medical_data.get('weight', 70)
            height = medical_data.get('height', 170) / 100  # Convert to meters
            bmi = weight / (height ** 2)
            bmi_norm = min(bmi / 40, 1.0)  # Normalize BMI
            features.append(bmi_norm)
            
            # Blood pressure features
            bp_systolic = medical_data.get('bp_systolic', 120)
            bp_diastolic = medical_data.get('bp_diastolic', 80)
            
            # Normalize blood pressure
            bp_sys_norm = min(bp_systolic / 200, 1.0)
            bp_dia_norm = min(bp_diastolic / 120, 1.0)
            features.extend([bp_sys_norm, bp_dia_norm])
            
            # Hemoglobin level
            hemoglobin = medical_data.get('hemoglobin', 14.0)
            hb_norm = min(hemoglobin / 20, 1.0)
            features.append(hb_norm)
            
            # Chronic conditions count
            chronic_conditions = len(medical_data.get('chronic_conditions', []))
            chronic_norm = min(chronic_conditions / 10, 1.0)
            features.append(chronic_norm)
            
            # Medications count
            medications = len(medical_data.get('medications', []))
            meds_norm = min(medications / 20, 1.0)
            features.append(meds_norm)
            
            # Risk factors
            smoking = medical_data.get('smoking', False)
            alcohol = medical_data.get('alcohol_consumption', False)
            features.extend([1.0 if smoking else 0.0, 1.0 if alcohol else 0.0])
            
            return features
            
        except Exception as e:
            logger.error(f"Failed to extract medical features: {e}")
            return [0.3, 0.5, 0.6, 0.4, 0.7, 0.1, 0.2, 0.0, 0.0]  # Default features
    
    def extract_donation_history_features(self, history: List[Dict[str, Any]]) -> List[float]:
        """Extract features from donation history"""
        try:
            features = []
            
            if not history:
                return [0.0] * 8  # Return zeros if no history
            
            # Total donations
            total_donations = len(history)
            donations_norm = min(total_donations / 50, 1.0)
            features.append(donations_norm)
            
            # Recent donation frequency (last 6 months)
            recent_cutoff = datetime.now() - timedelta(days=180)
            recent_donations = [
                d for d in history 
                if datetime.fromisoformat(d.get('date', '2020-01-01')) > recent_cutoff
            ]
            recent_freq = len(recent_donations) / 6  # Donations per month
            recent_freq_norm = min(recent_freq / 2, 1.0)  # Max 2 per month
            features.append(recent_freq_norm)
            
            # Days since last donation
            if history:
                last_donation_date = max(
                    datetime.fromisoformat(d.get('date', '2020-01-01')) 
                    for d in history
                )
                days_since = (datetime.now() - last_donation_date).days
                days_norm = min(days_since / 365, 1.0)  # Normalize to year
                features.append(days_norm)
            else:
                features.append(1.0)  # Long time since last donation
            
            # Average donation volume
            volumes = [d.get('volume', 450) for d in history]
            avg_volume = np.mean(volumes) if volumes else 450
            volume_norm = min(avg_volume / 500, 1.0)
            features.append(volume_norm)
            
            # Consistency score (regularity of donations)
            if len(history) > 1:
                dates = [datetime.fromisoformat(d.get('date', '2020-01-01')) for d in history]
                dates.sort()
                intervals = [(dates[i] - dates[i-1]).days for i in range(1, len(dates))]
                consistency = 1.0 / (1.0 + np.std(intervals) / 30)  # Lower std = higher consistency
                features.append(consistency)
            else:
                features.append(0.5)  # Neutral consistency for single donation
            
            # Adverse reactions history
            adverse_reactions = sum(1 for d in history if d.get('adverse_reaction', False))
            adverse_rate = adverse_reactions / total_donations if total_donations > 0 else 0
            features.append(adverse_rate)
            
            # Cancellation rate
            cancellations = sum(1 for d in history if d.get('cancelled', False))
            cancel_rate = cancellations / total_donations if total_donations > 0 else 0
            features.append(cancel_rate)
            
            # Seasonal donation pattern
            months = [datetime.fromisoformat(d.get('date', '2020-01-01')).month for d in history]
            seasonal_variance = np.var([months.count(m) for m in range(1, 13)])
            seasonal_norm = min(seasonal_variance / 10, 1.0)
            features.append(seasonal_norm)
            
            return features
            
        except Exception as e:
            logger.error(f"Failed to extract donation history features: {e}")
            return [0.0] * 8  # Default features
    
    def create_interaction_features(self, features_dict: Dict[str, List[float]]) -> List[float]:
        """Create interaction features between different feature groups"""
        try:
            interactions = []
            
            # Age-location interactions
            if 'medical' in features_dict and 'location' in features_dict:
                age = features_dict['medical'][0]  # Normalized age
                urban = features_dict['location'][3]  # Urban indicator
                interactions.append(age * urban)  # Age-urban interaction
            
            # Time-location interactions
            if 'time' in features_dict and 'location' in features_dict:
                weekend = features_dict['time'][5]  # Weekend indicator
                pop_density = features_dict['location'][2]  # Population density
                interactions.append(weekend * pop_density)  # Weekend-density interaction
            
            # Medical-history interactions
            if 'medical' in features_dict and 'history' in features_dict:
                chronic_conditions = features_dict['medical'][5]  # Chronic conditions
                donation_frequency = features_dict['history'][1]  # Recent frequency
                interactions.append(chronic_conditions * (1 - donation_frequency))  # Health-frequency interaction
            
            return interactions
            
        except Exception as e:
            logger.error(f"Failed to create interaction features: {e}")
            return [0.0] * 3  # Default interactions
    
    def _get_indian_holidays(self) -> List[datetime]:
        """Get list of major Indian holidays (simplified)"""
        # This is a simplified list - in production, use a proper holiday library
        current_year = datetime.now().year
        holidays = [
            datetime(current_year, 1, 26),   # Republic Day
            datetime(current_year, 8, 15),   # Independence Day
            datetime(current_year, 10, 2),   # Gandhi Jayanti
            datetime(current_year, 12, 25),  # Christmas
        ]
        return holidays
    
    def _is_holiday(self, date: datetime) -> bool:
        """Check if date is a holiday"""
        return any(
            holiday.month == date.month and holiday.day == date.day 
            for holiday in self.holidays
        )
    
    def normalize_features(self, features: np.ndarray, method: str = 'minmax') -> np.ndarray:
        """Normalize features using specified method"""
        try:
            if method == 'minmax':
                return (features - features.min()) / (features.max() - features.min() + 1e-8)
            elif method == 'zscore':
                return (features - features.mean()) / (features.std() + 1e-8)
            else:
                return features
        except Exception as e:
            logger.error(f"Failed to normalize features: {e}")
            return features
    
    def select_top_features(self, features: np.ndarray, labels: np.ndarray, k: int = 10) -> List[int]:
        """Select top k features using simple correlation"""
        try:
            correlations = []
            for i in range(features.shape[1]):
                corr = np.corrcoef(features[:, i], labels)[0, 1]
                correlations.append((abs(corr) if not np.isnan(corr) else 0, i))
            
            # Sort by correlation and return top k indices
            correlations.sort(reverse=True)
            return [idx for _, idx in correlations[:k]]
            
        except Exception as e:
            logger.error(f"Failed to select top features: {e}")
            return list(range(min(k, features.shape[1])))
    
    def create_polynomial_features(self, features: np.ndarray, degree: int = 2) -> np.ndarray:
        """Create polynomial features"""
        try:
            if degree == 1:
                return features
            
            poly_features = [features]
            
            if degree >= 2:
                # Add squared terms
                squared = features ** 2
                poly_features.append(squared)
            
            if degree >= 3:
                # Add cubic terms
                cubed = features ** 3
                poly_features.append(cubed)
            
            return np.concatenate(poly_features, axis=1)
            
        except Exception as e:
            logger.error(f"Failed to create polynomial features: {e}")
            return features
