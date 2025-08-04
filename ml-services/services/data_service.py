import asyncio
import logging
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import os

logger = logging.getLogger(__name__)

class DataService:
    """
    Service for managing data operations for ML models:
    - Data loading and preprocessing
    - Feature engineering
    - Data validation
    - Synthetic data generation for development
    """
    
    def __init__(self):
        self.data_cache = {}
        self.cache_ttl = 3600  # 1 hour cache TTL
        self.data_dir = "data"
        
    async def initialize(self):
        """Initialize data service"""
        try:
            # Create data directory if it doesn't exist
            os.makedirs(self.data_dir, exist_ok=True)
            os.makedirs(f"{self.data_dir}/raw", exist_ok=True)
            os.makedirs(f"{self.data_dir}/processed", exist_ok=True)
            os.makedirs(f"{self.data_dir}/synthetic", exist_ok=True)
            
            logger.info("Data service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize data service: {e}")
            raise
    
    async def get_donor_training_data(self) -> pd.DataFrame:
        """Get training data for donor availability prediction"""
        try:
            # Check cache first
            cache_key = "donor_training_data"
            if self._is_cache_valid(cache_key):
                return self.data_cache[cache_key]['data']
            
            # Try to load from file
            data_file = f"{self.data_dir}/processed/donor_training_data.csv"
            if os.path.exists(data_file):
                data = pd.read_csv(data_file)
                self._cache_data(cache_key, data)
                return data
            
            # Generate synthetic data if no real data available
            logger.info("No donor training data found, generating synthetic data")
            data = await self._generate_synthetic_donor_data(1000)
            
            # Save synthetic data
            data.to_csv(data_file, index=False)
            self._cache_data(cache_key, data)
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to get donor training data: {e}")
            raise
    
    async def get_demand_training_data(self) -> pd.DataFrame:
        """Get training data for demand forecasting"""
        try:
            cache_key = "demand_training_data"
            if self._is_cache_valid(cache_key):
                return self.data_cache[cache_key]['data']
            
            data_file = f"{self.data_dir}/processed/demand_training_data.csv"
            if os.path.exists(data_file):
                data = pd.read_csv(data_file)
                self._cache_data(cache_key, data)
                return data
            
            logger.info("No demand training data found, generating synthetic data")
            data = await self._generate_synthetic_demand_data(500)
            
            data.to_csv(data_file, index=False)
            self._cache_data(cache_key, data)
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to get demand training data: {e}")
            raise
    
    async def get_compatibility_training_data(self) -> pd.DataFrame:
        """Get training data for compatibility matching"""
        try:
            cache_key = "compatibility_training_data"
            if self._is_cache_valid(cache_key):
                return self.data_cache[cache_key]['data']
            
            data_file = f"{self.data_dir}/processed/compatibility_training_data.csv"
            if os.path.exists(data_file):
                data = pd.read_csv(data_file)
                self._cache_data(cache_key, data)
                return data
            
            logger.info("No compatibility training data found, generating synthetic data")
            data = await self._generate_synthetic_compatibility_data(800)
            
            data.to_csv(data_file, index=False)
            self._cache_data(cache_key, data)
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to get compatibility training data: {e}")
            raise
    
    async def get_risk_training_data(self) -> pd.DataFrame:
        """Get training data for risk assessment"""
        try:
            cache_key = "risk_training_data"
            if self._is_cache_valid(cache_key):
                return self.data_cache[cache_key]['data']
            
            data_file = f"{self.data_dir}/processed/risk_training_data.csv"
            if os.path.exists(data_file):
                data = pd.read_csv(data_file)
                self._cache_data(cache_key, data)
                return data
            
            logger.info("No risk training data found, generating synthetic data")
            data = await self._generate_synthetic_risk_data(1200)
            
            data.to_csv(data_file, index=False)
            self._cache_data(cache_key, data)
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to get risk training data: {e}")
            raise
    
    async def _generate_synthetic_donor_data(self, n_samples: int) -> pd.DataFrame:
        """Generate synthetic donor data for training"""
        np.random.seed(42)
        
        # Blood types with realistic distribution
        blood_types = ['O_POSITIVE', 'A_POSITIVE', 'B_POSITIVE', 'AB_POSITIVE',
                      'O_NEGATIVE', 'A_NEGATIVE', 'B_NEGATIVE', 'AB_NEGATIVE']
        blood_type_probs = [0.37, 0.36, 0.12, 0.06, 0.06, 0.02, 0.01, 0.01]
        
        data = {
            'donor_id': [f"D{i:06d}" for i in range(n_samples)],
            'age': np.clip(np.random.normal(35, 12, n_samples), 18, 65).astype(int),
            'gender': np.random.choice(['male', 'female'], n_samples, p=[0.6, 0.4]),
            'weight': np.clip(np.random.normal(70, 15, n_samples), 50, 120),
            'height': np.clip(np.random.normal(170, 10, n_samples), 150, 200),
            'blood_type': np.random.choice(blood_types, n_samples, p=blood_type_probs),
            'donation_count': np.random.poisson(5, n_samples),
            'days_since_last_donation': np.random.exponential(90, n_samples),
            'health_score': np.random.beta(8, 2, n_samples),  # Skewed towards healthy
            'reliability_score': np.random.beta(7, 3, n_samples),
            'response_time_hours': np.random.exponential(12, n_samples),
            'available': np.random.binomial(1, 0.7, n_samples),
            'latitude': np.random.uniform(12.0, 35.0, n_samples),  # India coordinates
            'longitude': np.random.uniform(68.0, 97.0, n_samples),
            'created_at': [
                (datetime.now() - timedelta(days=np.random.randint(0, 365))).isoformat()
                for _ in range(n_samples)
            ]
        }
        
        df = pd.DataFrame(data)
        
        # Add some realistic correlations
        # Older donors might be less available
        age_factor = (df['age'] - 18) / (65 - 18)
        df['available'] = np.where(
            np.random.random(n_samples) < (0.8 - 0.3 * age_factor),
            1, 0
        )
        
        # More experienced donors (higher donation count) are more reliable
        df['reliability_score'] = np.clip(
            df['reliability_score'] + 0.1 * np.log1p(df['donation_count']),
            0, 1
        )
        
        return df
    
    async def _generate_synthetic_demand_data(self, n_samples: int) -> pd.DataFrame:
        """Generate synthetic demand data for training"""
        np.random.seed(42)
        
        # Generate date range
        start_date = datetime.now() - timedelta(days=n_samples)
        dates = [start_date + timedelta(days=i) for i in range(n_samples)]
        
        data = {
            'date': dates,
            'hospital_id': [f"H{np.random.randint(1, 21):03d}" for _ in range(n_samples)],
            'blood_type': np.random.choice(
                ['O_POSITIVE', 'A_POSITIVE', 'B_POSITIVE', 'AB_POSITIVE',
                 'O_NEGATIVE', 'A_NEGATIVE', 'B_NEGATIVE', 'AB_NEGATIVE'],
                n_samples,
                p=[0.37, 0.36, 0.12, 0.06, 0.06, 0.02, 0.01, 0.01]
            ),
            'units_requested': np.random.poisson(8, n_samples),
            'urgency_level': np.random.choice([1, 2, 3, 4, 5], n_samples, p=[0.3, 0.3, 0.2, 0.15, 0.05]),
            'patient_age': np.random.normal(45, 20, n_samples),
            'procedure_type': np.random.choice(
                ['surgery', 'emergency', 'chronic_treatment', 'trauma'],
                n_samples,
                p=[0.4, 0.2, 0.3, 0.1]
            ),
            'hospital_capacity': np.random.normal(200, 50, n_samples),
            'current_inventory': np.random.poisson(15, n_samples),
            'seasonal_factor': [1 + 0.2 * np.sin(2 * np.pi * d.timetuple().tm_yday / 365) for d in dates],
            'fulfilled': np.random.binomial(1, 0.85, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Add realistic correlations
        # Higher urgency should correlate with lower fulfillment rate
        urgency_factor = (df['urgency_level'] - 1) / 4
        df['fulfilled'] = np.where(
            np.random.random(n_samples) < (0.95 - 0.2 * urgency_factor),
            1, 0
        )
        
        return df
    
    async def _generate_synthetic_compatibility_data(self, n_samples: int) -> pd.DataFrame:
        """Generate synthetic compatibility data for training"""
        np.random.seed(42)
        
        blood_types = ['O_POSITIVE', 'A_POSITIVE', 'B_POSITIVE', 'AB_POSITIVE',
                      'O_NEGATIVE', 'A_NEGATIVE', 'B_NEGATIVE', 'AB_NEGATIVE']
        
        data = {
            'match_id': [f"M{i:06d}" for i in range(n_samples)],
            'donor_blood_type': np.random.choice(blood_types, n_samples),
            'patient_blood_type': np.random.choice(blood_types, n_samples),
            'donor_age': np.random.normal(35, 12, n_samples),
            'patient_age': np.random.normal(45, 20, n_samples),
            'distance_km': np.random.exponential(25, n_samples),
            'urgency_level': np.random.choice([1, 2, 3, 4, 5], n_samples),
            'donor_health_score': np.random.beta(8, 2, n_samples),
            'patient_condition_severity': np.random.beta(3, 7, n_samples),
            'time_to_procedure_hours': np.random.exponential(24, n_samples),
            'successful_match': np.random.binomial(1, 0.75, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Add blood type compatibility logic
        compatibility_matrix = {
            'O_NEGATIVE': blood_types,  # Universal donor
            'O_POSITIVE': ['O_POSITIVE', 'A_POSITIVE', 'B_POSITIVE', 'AB_POSITIVE'],
            'A_NEGATIVE': ['A_NEGATIVE', 'A_POSITIVE', 'AB_NEGATIVE', 'AB_POSITIVE'],
            'A_POSITIVE': ['A_POSITIVE', 'AB_POSITIVE'],
            'B_NEGATIVE': ['B_NEGATIVE', 'B_POSITIVE', 'AB_NEGATIVE', 'AB_POSITIVE'],
            'B_POSITIVE': ['B_POSITIVE', 'AB_POSITIVE'],
            'AB_NEGATIVE': ['AB_NEGATIVE', 'AB_POSITIVE'],
            'AB_POSITIVE': ['AB_POSITIVE']
        }
        
        # Adjust success rate based on blood type compatibility
        for i in range(n_samples):
            donor_type = df.iloc[i]['donor_blood_type']
            patient_type = df.iloc[i]['patient_blood_type']
            
            if patient_type in compatibility_matrix.get(donor_type, []):
                # Compatible blood types have higher success rate
                if np.random.random() < 0.9:
                    df.iloc[i, df.columns.get_loc('successful_match')] = 1
            else:
                # Incompatible blood types have very low success rate
                if np.random.random() < 0.1:
                    df.iloc[i, df.columns.get_loc('successful_match')] = 1
                else:
                    df.iloc[i, df.columns.get_loc('successful_match')] = 0
        
        return df
    
    async def _generate_synthetic_risk_data(self, n_samples: int) -> pd.DataFrame:
        """Generate synthetic risk assessment data for training"""
        np.random.seed(42)
        
        data = {
            'assessment_id': [f"R{i:06d}" for i in range(n_samples)],
            'subject_age': np.random.normal(40, 18, n_samples),
            'subject_weight': np.random.normal(70, 15, n_samples),
            'chronic_conditions_count': np.random.poisson(1.5, n_samples),
            'medications_count': np.random.poisson(2, n_samples),
            'allergies_count': np.random.poisson(0.5, n_samples),
            'bp_systolic': np.random.normal(130, 20, n_samples),
            'bp_diastolic': np.random.normal(80, 10, n_samples),
            'heart_rate': np.random.normal(75, 15, n_samples),
            'hemoglobin': np.random.normal(14, 2, n_samples),
            'previous_adverse_reactions': np.random.binomial(1, 0.1, n_samples),
            'emergency_procedure': np.random.binomial(1, 0.2, n_samples),
            'facility_risk_score': np.random.beta(2, 8, n_samples),  # Most facilities are low risk
            'staff_experience_score': np.random.beta(8, 2, n_samples),  # Most staff are experienced
            'high_risk_outcome': np.random.binomial(1, 0.25, n_samples)
        }
        
        df = pd.DataFrame(data)
        
        # Add realistic risk correlations
        # Age increases risk
        age_risk = (df['subject_age'] - 18) / (80 - 18)
        
        # Chronic conditions increase risk
        condition_risk = np.clip(df['chronic_conditions_count'] / 5, 0, 1)
        
        # Abnormal vitals increase risk
        bp_risk = np.where(
            (df['bp_systolic'] > 160) | (df['bp_systolic'] < 90) |
            (df['bp_diastolic'] > 100) | (df['bp_diastolic'] < 60),
            0.3, 0
        )
        
        # Emergency procedures increase risk
        emergency_risk = df['emergency_procedure'] * 0.4
        
        # Combine risk factors
        total_risk = np.clip(age_risk * 0.2 + condition_risk * 0.3 + bp_risk + emergency_risk, 0, 1)
        
        # Adjust outcomes based on total risk
        df['high_risk_outcome'] = np.where(
            np.random.random(n_samples) < total_risk,
            1, 0
        )
        
        return df
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid"""
        if cache_key not in self.data_cache:
            return False
        
        cache_time = self.data_cache[cache_key]['timestamp']
        return (datetime.now() - cache_time).total_seconds() < self.cache_ttl
    
    def _cache_data(self, cache_key: str, data: pd.DataFrame):
        """Cache data with timestamp"""
        self.data_cache[cache_key] = {
            'data': data,
            'timestamp': datetime.now()
        }
    
    async def clear_cache(self):
        """Clear data cache"""
        self.data_cache.clear()
        logger.info("Data cache cleared")
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            'cached_datasets': list(self.data_cache.keys()),
            'cache_size': len(self.data_cache),
            'cache_ttl_seconds': self.cache_ttl
        }
