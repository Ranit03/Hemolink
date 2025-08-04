import asyncio
import logging
import os
import joblib
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class ModelService:
    """
    Service for managing ML model operations:
    - Model loading and saving
    - Model versioning
    - Model performance tracking
    - Model deployment management
    """
    
    def __init__(self):
        self.models_dir = "models/saved"
        self.model_registry = {}
        self.performance_history = {}
        
    async def initialize(self):
        """Initialize model service"""
        try:
            # Create models directory if it doesn't exist
            os.makedirs(self.models_dir, exist_ok=True)
            
            # Load model registry
            await self._load_model_registry()
            
            logger.info("Model service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize model service: {e}")
            raise
    
    async def load_models(self, model_instances: Dict[str, Any]):
        """Load pre-trained models if available"""
        try:
            for model_name, model_instance in model_instances.items():
                await self._load_model_if_exists(model_name, model_instance)
            
            logger.info(f"Loaded {len(model_instances)} model instances")
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            raise
    
    async def _load_model_if_exists(self, model_name: str, model_instance: Any):
        """Load a specific model if it exists"""
        try:
            model_files = self._find_model_files(model_name)
            
            if model_files:
                # Load the latest version
                latest_file = max(model_files, key=lambda x: os.path.getmtime(x))
                
                # Load model data
                model_data = joblib.load(latest_file)
                
                # Update model instance
                if hasattr(model_instance, 'model'):
                    model_instance.model = model_data.get('model')
                if hasattr(model_instance, 'scaler'):
                    model_instance.scaler = model_data.get('scaler')
                if hasattr(model_instance, 'metrics'):
                    model_instance.metrics = model_data.get('metrics', {})
                if hasattr(model_instance, 'version'):
                    model_instance.version = model_data.get('version', '1.0.0')
                if hasattr(model_instance, 'is_trained'):
                    model_instance.is_trained = True
                
                # Update registry
                self.model_registry[model_name] = {
                    'file_path': latest_file,
                    'version': model_data.get('version', '1.0.0'),
                    'loaded_at': datetime.now().isoformat(),
                    'metrics': model_data.get('metrics', {})
                }
                
                logger.info(f"Loaded model {model_name} from {latest_file}")
            else:
                logger.info(f"No pre-trained model found for {model_name}")
                
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            # Don't raise exception, let model train from scratch
    
    def _find_model_files(self, model_name: str) -> List[str]:
        """Find model files for a given model name"""
        try:
            model_files = []
            for file in os.listdir(self.models_dir):
                if file.startswith(model_name) and file.endswith('.joblib'):
                    model_files.append(os.path.join(self.models_dir, file))
            return model_files
        except Exception:
            return []
    
    async def save_model(self, model_name: str, model_data: Dict[str, Any]):
        """Save a trained model"""
        try:
            version = model_data.get('version', '1.0.0')
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{model_name}_v{version}_{timestamp}.joblib"
            file_path = os.path.join(self.models_dir, filename)
            
            # Add metadata
            model_data['saved_at'] = datetime.now().isoformat()
            model_data['model_name'] = model_name
            
            # Save model
            joblib.dump(model_data, file_path)
            
            # Update registry
            self.model_registry[model_name] = {
                'file_path': file_path,
                'version': version,
                'saved_at': model_data['saved_at'],
                'metrics': model_data.get('metrics', {})
            }
            
            # Save registry
            await self._save_model_registry()
            
            # Track performance
            await self._track_model_performance(model_name, model_data.get('metrics', {}))
            
            logger.info(f"Model {model_name} saved to {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"Failed to save model {model_name}: {e}")
            raise
    
    async def get_model_info(self, model_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific model"""
        try:
            if model_name in self.model_registry:
                model_info = self.model_registry[model_name].copy()
                
                # Add file size and modification time
                file_path = model_info['file_path']
                if os.path.exists(file_path):
                    stat = os.stat(file_path)
                    model_info['file_size_mb'] = round(stat.st_size / (1024 * 1024), 2)
                    model_info['last_modified'] = datetime.fromtimestamp(stat.st_mtime).isoformat()
                
                # Add performance history
                if model_name in self.performance_history:
                    model_info['performance_history'] = self.performance_history[model_name]
                
                return model_info
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get model info for {model_name}: {e}")
            return None
    
    async def list_models(self) -> Dict[str, Any]:
        """List all registered models"""
        try:
            models_info = {}
            
            for model_name in self.model_registry:
                models_info[model_name] = await self.get_model_info(model_name)
            
            return {
                'models': models_info,
                'total_models': len(models_info),
                'registry_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to list models: {e}")
            return {'models': {}, 'total_models': 0, 'error': str(e)}
    
    async def delete_model(self, model_name: str, version: Optional[str] = None):
        """Delete a model and its files"""
        try:
            if model_name not in self.model_registry:
                raise ValueError(f"Model {model_name} not found in registry")
            
            model_info = self.model_registry[model_name]
            file_path = model_info['file_path']
            
            # Delete file if it exists
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Deleted model file: {file_path}")
            
            # Remove from registry
            del self.model_registry[model_name]
            
            # Remove from performance history
            if model_name in self.performance_history:
                del self.performance_history[model_name]
            
            # Save updated registry
            await self._save_model_registry()
            
            logger.info(f"Model {model_name} deleted successfully")
            
        except Exception as e:
            logger.error(f"Failed to delete model {model_name}: {e}")
            raise
    
    async def backup_models(self, backup_dir: str):
        """Backup all models to a specified directory"""
        try:
            os.makedirs(backup_dir, exist_ok=True)
            
            backup_count = 0
            for model_name, model_info in self.model_registry.items():
                source_path = model_info['file_path']
                if os.path.exists(source_path):
                    filename = os.path.basename(source_path)
                    backup_path = os.path.join(backup_dir, filename)
                    
                    # Copy file
                    import shutil
                    shutil.copy2(source_path, backup_path)
                    backup_count += 1
            
            # Backup registry
            registry_backup_path = os.path.join(backup_dir, 'model_registry.json')
            with open(registry_backup_path, 'w') as f:
                json.dump(self.model_registry, f, indent=2)
            
            # Backup performance history
            history_backup_path = os.path.join(backup_dir, 'performance_history.json')
            with open(history_backup_path, 'w') as f:
                json.dump(self.performance_history, f, indent=2)
            
            logger.info(f"Backed up {backup_count} models to {backup_dir}")
            return backup_count
            
        except Exception as e:
            logger.error(f"Failed to backup models: {e}")
            raise
    
    async def restore_models(self, backup_dir: str):
        """Restore models from a backup directory"""
        try:
            if not os.path.exists(backup_dir):
                raise ValueError(f"Backup directory {backup_dir} does not exist")
            
            # Restore registry
            registry_backup_path = os.path.join(backup_dir, 'model_registry.json')
            if os.path.exists(registry_backup_path):
                with open(registry_backup_path, 'r') as f:
                    self.model_registry = json.load(f)
            
            # Restore performance history
            history_backup_path = os.path.join(backup_dir, 'performance_history.json')
            if os.path.exists(history_backup_path):
                with open(history_backup_path, 'r') as f:
                    self.performance_history = json.load(f)
            
            # Restore model files
            restore_count = 0
            for file in os.listdir(backup_dir):
                if file.endswith('.joblib'):
                    source_path = os.path.join(backup_dir, file)
                    dest_path = os.path.join(self.models_dir, file)
                    
                    import shutil
                    shutil.copy2(source_path, dest_path)
                    restore_count += 1
            
            # Save restored registry
            await self._save_model_registry()
            
            logger.info(f"Restored {restore_count} models from {backup_dir}")
            return restore_count
            
        except Exception as e:
            logger.error(f"Failed to restore models: {e}")
            raise
    
    async def _load_model_registry(self):
        """Load model registry from file"""
        try:
            registry_file = os.path.join(self.models_dir, 'model_registry.json')
            if os.path.exists(registry_file):
                with open(registry_file, 'r') as f:
                    self.model_registry = json.load(f)
                logger.info("Model registry loaded")
            else:
                self.model_registry = {}
                logger.info("No existing model registry found, starting fresh")
                
            # Load performance history
            history_file = os.path.join(self.models_dir, 'performance_history.json')
            if os.path.exists(history_file):
                with open(history_file, 'r') as f:
                    self.performance_history = json.load(f)
                logger.info("Performance history loaded")
            else:
                self.performance_history = {}
                
        except Exception as e:
            logger.error(f"Failed to load model registry: {e}")
            self.model_registry = {}
            self.performance_history = {}
    
    async def _save_model_registry(self):
        """Save model registry to file"""
        try:
            registry_file = os.path.join(self.models_dir, 'model_registry.json')
            with open(registry_file, 'w') as f:
                json.dump(self.model_registry, f, indent=2)
            
            history_file = os.path.join(self.models_dir, 'performance_history.json')
            with open(history_file, 'w') as f:
                json.dump(self.performance_history, f, indent=2)
                
        except Exception as e:
            logger.error(f"Failed to save model registry: {e}")
    
    async def _track_model_performance(self, model_name: str, metrics: Dict[str, Any]):
        """Track model performance over time"""
        try:
            if model_name not in self.performance_history:
                self.performance_history[model_name] = []
            
            performance_entry = {
                'timestamp': datetime.now().isoformat(),
                'metrics': metrics
            }
            
            self.performance_history[model_name].append(performance_entry)
            
            # Keep only last 10 entries per model
            if len(self.performance_history[model_name]) > 10:
                self.performance_history[model_name] = self.performance_history[model_name][-10:]
                
        except Exception as e:
            logger.error(f"Failed to track performance for {model_name}: {e}")
    
    async def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary for all models"""
        try:
            summary = {}
            
            for model_name, history in self.performance_history.items():
                if history:
                    latest_metrics = history[-1]['metrics']
                    summary[model_name] = {
                        'latest_metrics': latest_metrics,
                        'history_entries': len(history),
                        'last_updated': history[-1]['timestamp']
                    }
            
            return summary
            
        except Exception as e:
            logger.error(f"Failed to get performance summary: {e}")
            return {}
    
    async def cleanup_old_models(self, keep_versions: int = 3):
        """Clean up old model versions, keeping only the specified number"""
        try:
            cleaned_count = 0
            
            for model_name in list(self.model_registry.keys()):
                model_files = self._find_model_files(model_name)
                
                if len(model_files) > keep_versions:
                    # Sort by modification time, keep newest
                    model_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
                    files_to_delete = model_files[keep_versions:]
                    
                    for file_path in files_to_delete:
                        try:
                            os.remove(file_path)
                            cleaned_count += 1
                            logger.info(f"Deleted old model file: {file_path}")
                        except Exception as e:
                            logger.error(f"Failed to delete {file_path}: {e}")
            
            logger.info(f"Cleaned up {cleaned_count} old model files")
            return cleaned_count
            
        except Exception as e:
            logger.error(f"Failed to cleanup old models: {e}")
            return 0
