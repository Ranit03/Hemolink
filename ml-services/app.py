#!/usr/bin/env python3
import os
import logging
import json
import random
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime
import threading
import time

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Global model instances (simplified for demo)
models = {
    'donor_predictor': {'loaded': True, 'version': '1.0.0'},
    'demand_forecaster': {'loaded': True, 'version': '1.0.0'},
    'compatibility_matcher': {'loaded': True, 'version': '1.0.0'},
    'risk_assessor': {'loaded': True, 'version': '1.0.0'}
}

class MLServiceHandler(BaseHTTPRequestHandler):
    """HTTP request handler for ML services"""

    def _set_cors_headers(self):
        """Set CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _send_json_response(self, data, status_code=200):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def _send_error_response(self, message, status_code=500):
        """Send error response"""
        error_data = {
            'error': 'Internal Server Error' if status_code == 500 else 'Bad Request',
            'message': message,
            'timestamp': datetime.now().isoformat()
        }
        self._send_json_response(error_data, status_code)

    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        try:
            parsed_path = urlparse(self.path)
            path = parsed_path.path

            if path == '/health':
                self._handle_health_check()
            elif path.startswith('/models/') and path.endswith('/metrics'):
                model_name = path.split('/')[2]
                self._handle_model_metrics(model_name)
            else:
                self._send_error_response('Route not found', 404)

        except Exception as e:
            logger.error(f"GET request failed: {e}")
            self._send_error_response(str(e))

    def do_POST(self):
        """Handle POST requests"""
        try:
            parsed_path = urlparse(self.path)
            path = parsed_path.path

            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            request_body = self.rfile.read(content_length).decode('utf-8')
            request_data = json.loads(request_body) if request_body else {}

            if path == '/predict/donor-availability':
                self._handle_donor_prediction(request_data)
            elif path == '/predict/demand-forecast':
                self._handle_demand_forecast(request_data)
            elif path == '/predict/compatibility':
                self._handle_compatibility_assessment(request_data)
            elif path == '/predict/risk-assessment':
                self._handle_risk_assessment(request_data)
            elif path.startswith('/models/train/'):
                model_name = path.split('/')[-1]
                self._handle_model_training(model_name)
            else:
                self._send_error_response('Route not found', 404)

        except json.JSONDecodeError:
            self._send_error_response('Invalid JSON in request body', 400)
        except Exception as e:
            logger.error(f"POST request failed: {e}")
            self._send_error_response(str(e))

    def _handle_health_check(self):
        """Handle health check endpoint"""
        response = {
            "status": "healthy",
            "service": "HemoLink AI ML Services",
            "version": "1.0.0-demo",
            "models_loaded": len(models),
            "timestamp": datetime.now().isoformat()
        }
        self._send_json_response(response)

    def _handle_donor_prediction(self, request_data):
        """Handle donor availability prediction"""
        try:
            # Simplified prediction logic for demo
            blood_type = request_data.get('blood_type', 'O_POSITIVE')
            urgency = request_data.get('urgency_level', 1)

            # Generate realistic prediction based on blood type and urgency
            base_availability = {
                'O_NEGATIVE': 0.6,  # Universal donor, lower availability
                'O_POSITIVE': 0.8,  # Most common, higher availability
                'A_POSITIVE': 0.7,
                'A_NEGATIVE': 0.5,
                'B_POSITIVE': 0.6,
                'B_NEGATIVE': 0.4,
                'AB_POSITIVE': 0.5,
                'AB_NEGATIVE': 0.3
            }.get(blood_type, 0.7)

            # Adjust for urgency
            urgency_factor = min(urgency / 5.0, 1.0)
            availability_score = base_availability * (1 + urgency_factor * 0.2)
            availability_score = min(availability_score, 1.0)

            prediction = {
                'availability_score': availability_score,
                'availability_category': 'HIGH' if availability_score > 0.7 else 'MEDIUM' if availability_score > 0.5 else 'LOW',
                'confidence': 0.85,
                'estimated_response_time': {'estimated_hours': int(24 * (2 - availability_score)), 'min_hours': 2, 'max_hours': 48},
                'recommendations': ['Contact regular donors', 'Check nearby blood banks'] if availability_score < 0.6 else ['Standard protocols apply']
            }

            response = {
                "prediction_type": "donor_availability",
                "result": prediction,
                "confidence": 0.85,
                "model_version": "1.0.0-demo",
                "timestamp": datetime.now().isoformat()
            }
            self._send_json_response(response)

        except Exception as e:
            logger.error(f"Donor availability prediction failed: {e}")
            self._send_error_response(str(e))

    def _handle_demand_forecast(self, request_data):
        """Handle demand forecasting"""
        try:
            # Simplified demand forecasting for demo
            forecast_days = request_data.get('forecast_days', 7)
            hospital_capacity = request_data.get('hospital_capacity', 100)
            population_served = request_data.get('population_served', 50000)

            # Generate realistic demand forecast
            base_demand = population_served / 5000  # Base demand per day
            seasonal_factor = 1.0 + 0.2 * random.uniform(-1, 1)  # ±20% seasonal variation
            forecasted_demand = base_demand * seasonal_factor

            forecast = {
                'forecasted_demand': round(forecasted_demand, 1),
                'confidence': 0.82,
                'confidence_interval': {
                    'lower_bound': round(forecasted_demand * 0.8, 1),
                    'upper_bound': round(forecasted_demand * 1.2, 1)
                },
                'forecast_period': forecast_days,
                'recommendations': [
                    'Monitor inventory levels closely',
                    'Schedule regular donor drives'
                ] if forecasted_demand > 15 else ['Standard inventory management']
            }

            response = {
                "prediction_type": "demand_forecast",
                "result": forecast,
                "confidence": 0.82,
                "model_version": "1.0.0-demo",
                "timestamp": datetime.now().isoformat()
            }
            self._send_json_response(response)

        except Exception as e:
            logger.error(f"Demand forecasting failed: {e}")
            self._send_error_response(str(e))

    def _handle_compatibility_assessment(self, request_data):
        """Handle compatibility assessment"""
        try:
            # Simplified compatibility assessment for demo
            donor = request_data.get('donor', {})
            patient = request_data.get('patient', {})

            donor_blood_type = donor.get('blood_type', 'O_POSITIVE')
            patient_blood_type = patient.get('blood_type', 'O_POSITIVE')

            # Blood type compatibility matrix
            compatibility_matrix = {
                'O_NEGATIVE': ['O_NEGATIVE', 'O_POSITIVE', 'A_NEGATIVE', 'A_POSITIVE', 'B_NEGATIVE', 'B_POSITIVE', 'AB_NEGATIVE', 'AB_POSITIVE'],
                'O_POSITIVE': ['O_POSITIVE', 'A_POSITIVE', 'B_POSITIVE', 'AB_POSITIVE'],
                'A_NEGATIVE': ['A_NEGATIVE', 'A_POSITIVE', 'AB_NEGATIVE', 'AB_POSITIVE'],
                'A_POSITIVE': ['A_POSITIVE', 'AB_POSITIVE'],
                'B_NEGATIVE': ['B_NEGATIVE', 'B_POSITIVE', 'AB_NEGATIVE', 'AB_POSITIVE'],
                'B_POSITIVE': ['B_POSITIVE', 'AB_POSITIVE'],
                'AB_NEGATIVE': ['AB_NEGATIVE', 'AB_POSITIVE'],
                'AB_POSITIVE': ['AB_POSITIVE']
            }

            is_compatible = patient_blood_type in compatibility_matrix.get(donor_blood_type, [])
            compatibility_score = 0.95 if is_compatible else 0.1

            # Add some randomness for other factors
            if is_compatible:
                compatibility_score *= (0.8 + 0.2 * random.random())

            compatibility = {
                'score': compatibility_score,
                'compatible': compatibility_score > 0.7,
                'confidence': 0.9,
                'blood_compatibility': {
                    'compatible': is_compatible,
                    'donor_type': donor_blood_type,
                    'patient_type': patient_blood_type
                },
                'recommendations': [
                    'Proceed with standard protocols'
                ] if is_compatible else [
                    'Find alternative donor with compatible blood type'
                ]
            }

            response = {
                "prediction_type": "compatibility",
                "result": compatibility,
                "confidence": 0.9,
                "model_version": "1.0.0-demo",
                "timestamp": datetime.now().isoformat()
            }
            self._send_json_response(response)

        except Exception as e:
            logger.error(f"Compatibility assessment failed: {e}")
            self._send_error_response(str(e))

    def _handle_risk_assessment(self, request_data):
        """Handle risk assessment"""
        try:
            # Simplified risk assessment for demo
            subject = request_data.get('subject', {})
            assessment_type = request_data.get('assessment_type', 'donation')

            age = subject.get('age', 30)
            chronic_conditions = len(subject.get('chronic_conditions', []))
            emergency_procedure = request_data.get('emergency_procedure', False)

            # Calculate risk score
            risk_score = 0.1  # Base risk

            # Age factor
            if age > 65:
                risk_score += 0.3
            elif age < 18:
                risk_score += 0.2

            # Chronic conditions
            risk_score += chronic_conditions * 0.15

            # Emergency procedure
            if emergency_procedure:
                risk_score += 0.4

            risk_score = min(risk_score, 1.0)

            # Categorize risk
            if risk_score < 0.3:
                risk_category = 'LOW'
            elif risk_score < 0.6:
                risk_category = 'MODERATE'
            elif risk_score < 0.8:
                risk_category = 'HIGH'
            else:
                risk_category = 'CRITICAL'

            risk_assessment = {
                'risk_score': risk_score,
                'risk_category': risk_category,
                'confidence': 0.88,
                'assessment_type': assessment_type,
                'recommendations': [
                    'Proceed with standard protocols'
                ] if risk_score < 0.3 else [
                    'Enhanced monitoring required',
                    'Consider specialist consultation'
                ] if risk_score < 0.6 else [
                    'High-risk procedure',
                    'Specialist supervision required',
                    'Emergency protocols may be needed'
                ]
            }

            response = {
                "prediction_type": "risk_assessment",
                "result": risk_assessment,
                "confidence": 0.88,
                "model_version": "1.0.0-demo",
                "timestamp": datetime.now().isoformat()
            }
            self._send_json_response(response)

        except Exception as e:
            logger.error(f"Risk assessment failed: {e}")
            self._send_error_response(str(e))

    def _handle_model_training(self, model_name):
        """Handle model training"""
        try:
            if model_name not in models:
                self._send_error_response(f"Model {model_name} not found", 404)
                return

            # Simulate training
            training_result = {
                "status": "completed",
                "accuracy": 0.85 + 0.1 * random.random(),
                "training_samples": random.randint(800, 1200),
                "training_time_seconds": random.randint(30, 120)
            }

            response = {
                "status": "success",
                "model": model_name,
                "training_result": training_result,
                "timestamp": datetime.now().isoformat()
            }
            self._send_json_response(response)

        except Exception as e:
            logger.error(f"Model training failed for {model_name}: {e}")
            self._send_error_response(str(e))

    def _handle_model_metrics(self, model_name):
        """Handle model metrics request"""
        try:
            if model_name not in models:
                self._send_error_response(f"Model {model_name} not found", 404)
                return

            # Generate demo metrics
            metrics = {
                "accuracy": 0.85 + 0.1 * random.random(),
                "precision": 0.82 + 0.1 * random.random(),
                "recall": 0.88 + 0.1 * random.random(),
                "f1_score": 0.85 + 0.1 * random.random(),
                "last_trained": datetime.now().isoformat(),
                "training_samples": random.randint(800, 1200)
            }

            response = {
                "model": model_name,
                "version": "1.0.0-demo",
                "metrics": metrics,
                "timestamp": datetime.now().isoformat()
            }
            self._send_json_response(response)

        except Exception as e:
            logger.error(f"Failed to get metrics for {model_name}: {e}")
            self._send_error_response(str(e))

def run_server():
    """Run the ML services HTTP server"""
    port = int(os.getenv("ML_SERVICE_PORT", 8001))
    host = "0.0.0.0"

    logger.info(f"🚀 Starting HemoLink AI ML Services on {host}:{port}")
    logger.info("📊 Available endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /predict/donor-availability - Donor availability prediction")
    logger.info("  POST /predict/demand-forecast - Blood demand forecasting")
    logger.info("  POST /predict/compatibility - Donor-patient compatibility")
    logger.info("  POST /predict/risk-assessment - Risk assessment")
    logger.info("  POST /models/train/{model_name} - Train model")
    logger.info("  GET  /models/{model_name}/metrics - Get model metrics")
    logger.info("🩸 HemoLink AI - Empowering Thalassemia Care")

    server = HTTPServer((host, port), MLServiceHandler)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down ML services...")
        server.shutdown()

if __name__ == "__main__":
    run_server()
