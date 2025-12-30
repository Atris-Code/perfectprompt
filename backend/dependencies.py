from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from database import get_db
from models import User
from security import SECRET_KEY, ALGORITHM

# Define the source of the token (Header "Authorization: Bearer <token>")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
):
    """
    The Guardian.
    Validates signature, expiration, and TOKEN VERSION.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token revocado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # 1. Decode JWS
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        user_id: str = payload.get("sub")
        token_ver: int = payload.get("ver") # Extract token version

        if user_id is None or token_ver is None:
            raise credentials_exception
        
    except JWTError:
        raise credentials_exception

    # 2. Query User in DB
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise credentials_exception

    # 3. CRITICAL CHECK: Do versions match?
    if user.token_version != token_ver:
        print(f"ALERTA: Intento de uso de token revocado (v{token_ver}) para usuario v{user.token_version}")
        raise credentials_exception

    # 4. Check if active
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    return user

def require_role(user: User, required_role: str):
    """
    Helper to verify roles inside a route.
    """
    user_roles = [r.name for r in user.roles]
    if required_role not in user_roles and "Admin" not in user_roles:
        raise HTTPException(
            status_code=403, 
            detail=f"Se requiere rol de {required_role} para esta acción"
        )
