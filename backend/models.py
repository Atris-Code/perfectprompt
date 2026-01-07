from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Table, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
from database import Base

# Association Table for Many-to-Many relationship between Users and Roles
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', String, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id', ondelete="CASCADE"), primary_key=True),
    Column('assigned_at', DateTime(timezone=True), server_default=func.now())
)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    users = relationship("User", secondary=user_roles, back_populates="roles")

class User(Base):
    __tablename__ = "users"

    # Using String for UUID compatibility with SQLite. In Postgres use UUID type.
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # SECURITY CRITICAL: Token Version for immediate invalidation
    token_version = Column(Integer, default=1)
    
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="refresh_tokens")

class Assistant(Base):
    __tablename__ = "assistants"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String, nullable=False)
    role_prompt = Column(Text, nullable=False)
    knowledge_source_type = Column(String, nullable=False) # 'upload' or 'kb'
    knowledge_source_content = Column(Text, nullable=True) # Extracted text content
    owner_titan_id = Column(String, nullable=False) # e.g., "Dr. Pirolis"
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(String, ForeignKey("users.id"), nullable=True)  # Nullable for system actions
    target_id = Column(String, nullable=True)  # ID of the object being affected
    action_type = Column(String, nullable=False, index=True)  # CREATE, UPDATE, DELETE, LOGIN, etc.
    details = Column(Text, nullable=True)  # JSON string or text description
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    actor = relationship("User", backref="audit_logs")

class Material(Base):
    __tablename__ = "materials"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # BIOMASS, POLYMER, SLUDGE, TIRE
    state = Column(String, default='SOLID')
    properties = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

