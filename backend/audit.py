from sqlalchemy.orm import Session
from database import SessionLocal
from models import AuditLog
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def log_action_background(actor_id: str, action_type: str, target_id: str = None, details: dict = None, ip_address: str = None):
    """
    Creates an audit log entry in a background task.
    Uses its own database session to avoid conflicts with the request session.
    
    Args:
        actor_id (str): The ID of the user performing the action.
        action_type (str): The type of action (e.g., "LOGIN", "CREATE_USER").
        target_id (str, optional): The ID of the object being affected.
        details (dict, optional): Additional details about the action.
        ip_address (str, optional): The IP address of the actor.
    """
    db = SessionLocal()
    try:
        details_str = json.dumps(details) if details else None
        
        audit_entry = AuditLog(
            actor_id=actor_id,
            target_id=target_id,
            action_type=action_type,
            details=details_str,
            ip_address=ip_address
        )
        
        db.add(audit_entry)
        db.commit()
        logger.info(f"AUDIT LOG: {action_type} by {actor_id} on {target_id}")
        
    except Exception as e:
        logger.error(f"Failed to create audit log: {str(e)}")
        db.rollback()
    finally:
        db.close()
