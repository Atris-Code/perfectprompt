"""
seed_materials.py — Siembra la tabla `materials` con los 135 registros de biomasa
unificados (Sólido / Líquido / Gaseoso) desde frontend/data/pyrolysisMaterials.ts.

Esto convierte al backend en la fuente de verdad de los datos de pirólisis.
Ejecutar:  cd backend && python seed_materials.py
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base
from models import Material

DATA_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "frontend", "data", "pyrolysisMaterials.ts",
)


def extract_materials() -> list:
    """Extrae el array PYROLYSIS_MATERIALS del archivo TS y lo parsea como JSON."""
    with open(DATA_FILE, encoding="utf-8") as f:
        src = f.read()
    m = re.search(r'PYROLYSIS_MATERIALS[^=]*=\s*\[', src)
    if not m:
        raise RuntimeError("No se encontró PYROLYSIS_MATERIALS en el archivo de datos")
    start = m.end() - 1  # índice del '['
    depth = 0
    end = None
    i = start
    while i < len(src):
        c = src[i]
        if c == '[':
            depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0:
                end = i
                break
        i += 1
    if end is None:
        raise RuntimeError("No se encontró el cierre del array PYROLYSIS_MATERIALS")
    return json.loads(src[start:end + 1])


def derive_type(record: dict) -> str:
    text = f"{record.get('categoria', '')} {record.get('nombre', '')}".lower()
    if 'plástic' in text or 'plastic' in text:
        return 'POLYMER'
    return 'BIOMASS'


def derive_state(fase: str) -> str:
    return {'Sólido': 'SOLID', 'Líquido': 'LIQUID', 'Gaseoso': 'GAS'}.get(fase, 'SOLID')


def seed():
    materials = extract_materials()
    print(f"Extracted {len(materials)} materials from {DATA_FILE}")

    # Migración de esquema: la tabla antigua no tiene fase/categoria/origen_feedstock.
    # La recreamos con el esquema nuevo y la sembramos con los 135 registros.
    Material.__table__.drop(engine, checkfirst=True)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        for rec in materials:
            db.add(Material(
                source_id=rec.get("id"),
                name=rec.get("nombre"),
                fase=rec.get("fase", "Sólido"),
                categoria=rec.get("categoria"),
                origen_feedstock=rec.get("origen_feedstock"),
                type=derive_type(rec),
                state=derive_state(rec.get("fase", "Sólido")),
                properties=rec.get("propiedades", {}),
            ))
        db.commit()
        print(f"Inserted {len(materials)} materials.")

        # Reporte rápido de distribución
        from sqlalchemy import func
        rows = db.query(Material.fase, func.count(Material.id)).group_by(Material.fase).all()
        for fase, count in rows:
            print(f"  {fase}: {count}")
    except Exception as e:
        db.rollback()
        print(f"Error seeding materials: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
