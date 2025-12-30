from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import engine, SessionLocal, Base
from models import Role, User, Material
import json

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def init_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Create Roles
        roles_data = [
            {"name": "Admin", "description": "Acceso total al sistema, gestión de usuarios y configuración global."},
            {"name": "Operador", "description": "Acceso de escritura y ejecución en Pyrolysis Hub (Ala Analítica)."},
            {"name": "Viewer", "description": "Acceso de solo lectura a reportes finales y dashboards."},
            {"name": "Academico", "description": "Acceso a datos crudos y exportación científica, validación de modelos."},
            {"name": "Colaborador", "description": "Acceso principal al Creador de Prompt (Ala Creativa) y edición de narrativa."}
        ]

        for r_data in roles_data:
            role = db.query(Role).filter(Role.name == r_data["name"]).first()
            if not role:
                print(f"Creating role: {r_data['name']}")
                role = Role(**r_data)
                db.add(role)
        
        db.commit()

        # 2. Create Demo User (Hybrid: Academico + Colaborador)
        demo_email = "cientifico@nexo.com"
        user = db.query(User).filter(User.email == demo_email).first()
        
        if not user:
            print(f"Creating demo user: {demo_email}")
            
            # Fetch roles
            r_academic = db.query(Role).filter(Role.name == "Academico").first()
            r_colab = db.query(Role).filter(Role.name == "Colaborador").first()
            
            hashed_pw = get_password_hash("ciencia123")
            
            user = User(
                email=demo_email,
                full_name="Dr. Nexo",
                password_hash=hashed_pw,
                token_version=1
            )
            
            # Assign roles
            if r_academic: user.roles.append(r_academic)
            if r_colab: user.roles.append(r_colab)
            
            db.add(user)
            db.commit()
            print("Demo user created successfully.")
        else:
            print("Demo user already exists. Updating password...")
            hashed_pw = get_password_hash("ciencia123")
            user.password_hash = hashed_pw
            db.commit()
            print("Password updated.")

        # 3. Create Admin User
        admin_email = "admin@nexo.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        
        if not admin_user:
            print(f"Creating admin user: {admin_email}")
            r_admin = db.query(Role).filter(Role.name == "Admin").first()
            
            hashed_pw_admin = get_password_hash("admin123")
            
            admin_user = User(
                email=admin_email,
                full_name="System Administrator",
                password_hash=hashed_pw_admin,
                token_version=1
            )
            
            if r_admin: admin_user.roles.append(r_admin)
            
            db.add(admin_user)
            db.commit()
            print("Admin user created successfully.")
        else:
            print("Admin user already exists.")

    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        # 3. Create Seed Materials
        materials_data = [
            {
                "name": "Microalgas (Spirulina)",
                "type": "BIOMASS",
                "properties": {
                    "moisture_default": 12,
                    "volatiles": 78,
                    "ash": 8,
                    "c_h_o_n": {"c": 46, "h": 7, "o": 30, "n": 9}
                }
            },
            {
                "name": "Residuos Forestales (Pino)",
                "type": "BIOMASS",
                "properties": {
                    "moisture_default": 20,
                    "volatiles": 82,
                    "ash": 1,
                    "c_h_o_n": {"c": 50, "h": 6, "o": 43, "n": 0.1}
                }
            },
            {
                "name": "Plástico (HDPE)",
                "type": "POLYMER",
                "properties": {
                    "moisture_default": 0,
                    "volatiles": 99,
                    "ash": 0.5,
                    "c_h_o_n": {"c": 85, "h": 14, "o": 0, "n": 0}
                }
            },
            {
                "name": "Plástico (LDPE)",
                "type": "POLYMER",
                "properties": {
                    "moisture_default": 0,
                    "volatiles": 99.5,
                    "ash": 0.2,
                    "c_h_o_n": {"c": 85.7, "h": 14.3, "o": 0, "n": 0}
                }
            },
            {
                "name": "Plástico (PP)",
                "type": "POLYMER",
                "properties": {
                    "moisture_default": 0,
                    "volatiles": 99,
                    "ash": 0.3,
                    "c_h_o_n": {"c": 85.7, "h": 14.3, "o": 0, "n": 0}
                }
            },
            {
                "name": "Plástico (PS)",
                "type": "POLYMER",
                "properties": {
                    "moisture_default": 0,
                    "volatiles": 99.8,
                    "ash": 0.1,
                    "c_h_o_n": {"c": 92.3, "h": 7.7, "o": 0, "n": 0}
                }
            },
            {
                "name": "Plástico (PET)",
                "type": "POLYMER",
                "properties": {
                    "moisture_default": 0.5,
                    "volatiles": 86,
                    "ash": 0.1,
                    "c_h_o_n": {"c": 62.5, "h": 4.2, "o": 33.3, "n": 0}
                }
            },
            {
                "name": "Plástico (PVC)",
                "type": "POLYMER",
                "properties": {
                    "moisture_default": 0,
                    "volatiles": 95,
                    "ash": 2,
                    "c_h_o_n": {"c": 38.4, "h": 4.8, "o": 0, "n": 0},
                    "cl": 56.8
                }
            },
            {
                "name": "Neumáticos Usados (TDF)",
                "type": "TIRE",
                "properties": {
                    "moisture_default": 1,
                    "volatiles": 65,
                    "ash": 15,
                    "c_h_o_n": {"c": 80, "h": 7, "o": 2, "n": 0.5},
                    "s": 1.5
                }
            },
            {
                "name": "Paja de Trigo",
                "type": "BIOMASS",
                "properties": {
                    "moisture_default": 15,
                    "volatiles": 75,
                    "ash": 9,
                    "c_h_o_n": {"c": 45, "h": 6, "o": 40, "n": 0.7}
                }
            },
            {
                "name": "Cáscara de Arroz",
                "type": "BIOMASS",
                "properties": {
                    "moisture_default": 10,
                    "volatiles": 65,
                    "ash": 20,
                    "c_h_o_n": {"c": 38, "h": 5, "o": 36, "n": 0.5}
                }
            },
            {
                "name": "Bagazo de Caña",
                "type": "BIOMASS",
                "properties": {
                    "moisture_default": 50,
                    "volatiles": 80,
                    "ash": 3,
                    "c_h_o_n": {"c": 47, "h": 6.5, "o": 44, "n": 0.3}
                }
            }
        ]

        for m_data in materials_data:
            material = db.query(Material).filter(Material.name == m_data["name"]).first()
            if not material:
                print(f"Creating material: {m_data['name']}")
                material = Material(**m_data)
                db.add(material)
        
        db.commit()

        db.close()

if __name__ == "__main__":
    print("Initializing Nexo Sinergico Database...")
    init_db()
    print("Initialization complete.")
