from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User
from security import verify_password, get_password_hash

def debug_user():
    db = SessionLocal()
    try:
        email = "cientifico@nexo.com"
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"User {email} NOT FOUND!")
            return

        print(f"User found: {user.email}")
        print(f"ID: {user.id}")
        print(f"Is Active: {user.is_active}")
        print(f"Password Hash: {user.password_hash}")
        
        # Test password
        test_pass = "ciencia123"
        is_valid = verify_password(test_pass, user.password_hash)
        print(f"Password '{test_pass}' valid? {is_valid}")
        
        if not is_valid:
            print("Resetting password...")
            new_hash = get_password_hash(test_pass)
            user.password_hash = new_hash
            db.commit()
            print("Password reset. Verifying...")
            is_valid_now = verify_password(test_pass, user.password_hash)
            print(f"Password '{test_pass}' valid now? {is_valid_now}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_user()
