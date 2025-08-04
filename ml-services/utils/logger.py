import logging
import sys
import os
from datetime import datetime
from typing import Optional

def setup_logger(name: str, level: str = "INFO", log_file: Optional[str] = None) -> logging.Logger:
    """
    Set up a logger with consistent formatting
    
    Args:
        name: Logger name
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional log file path
    
    Returns:
        Configured logger instance
    """
    
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    
    # Avoid adding handlers multiple times
    if logger.handlers:
        return logger
    
    # Create formatter
    formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, level.upper()))
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler (if specified)
    if log_file:
        # Create logs directory if it doesn't exist
        log_dir = os.path.dirname(log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
        
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(getattr(logging, level.upper()))
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

def get_default_log_file(service_name: str = "ml_service") -> str:
    """Get default log file path"""
    timestamp = datetime.now().strftime("%Y%m%d")
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    return os.path.join(log_dir, f"{service_name}_{timestamp}.log")

# Configure root logger for the ML services
def configure_ml_logging():
    """Configure logging for ML services"""
    log_level = os.getenv("LOG_LEVEL", "INFO")
    log_file = os.getenv("LOG_FILE", get_default_log_file())
    
    # Setup root logger
    root_logger = setup_logger("hemolink_ml", log_level, log_file)
    
    # Setup specific loggers
    setup_logger("models", log_level, log_file)
    setup_logger("services", log_level, log_file)
    setup_logger("utils", log_level, log_file)
    
    return root_logger
