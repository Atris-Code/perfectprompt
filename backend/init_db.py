from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import engine, SessionLocal, Base
from models import Role, User
from config import settings

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
        # Fase 5: credenciales desde entorno (ver config.py / .env).
        demo_email = settings.DEMO_EMAIL
        user = db.query(User).filter(User.email == demo_email).first()

        if not user:
            print(f"Creating demo user: {demo_email}")

            r_academic = db.query(Role).filter(Role.name == "Academico").first()
            r_colab = db.query(Role).filter(Role.name == "Colaborador").first()

            hashed_pw = get_password_hash(settings.DEMO_PASSWORD)

            user = User(
                email=demo_email,
                full_name="Dr. Nexo",
                password_hash=hashed_pw,
                token_version=1
            )

            if r_academic: user.roles.append(r_academic)
            if r_colab: user.roles.append(r_colab)

            db.add(user)
            db.commit()
            print("Demo user created successfully.")
        else:
            print("Demo user already exists.")

        # 3. Create Admin User
        admin_email = settings.ADMIN_EMAIL
        admin_user = db.query(User).filter(User.email == admin_email).first()

        if not admin_user:
            print(f"Creating admin user: {admin_email}")
            r_admin = db.query(Role).filter(Role.name == "Admin").first()

            hashed_pw_admin = get_password_hash(settings.ADMIN_PASSWORD)

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
        db.close()

    # NOTA (Fase 2 — unificación de datos):
    # Los materiales (135 registros, 3 fases Sólido/Líquido/Gaseoso) ya NO se
    # siembran aquí. Se importan con:  python seed_materials.py


if __name__ == "__main__":
    print("Initializing Nexo Sinergico Database (roles + usuarios)...")
    init_db()
    print("Roles/usuarios listos. Para sembrar materiales ejecuta: python seed_materials.py")
