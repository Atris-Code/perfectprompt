import requests
import json

BASE_URL = "http://localhost:8001"

def get_auth_token():
    url = f"{BASE_URL}/auth/login"
    payload = {
        "email": "cientifico@nexo.com",
        "password": "ciencia123"
    }
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            return response.json()['access_token']
        else:
            print(f"Login Failed: {response.text}")
            return None
    except Exception as e:
        print(f"Connection Error: {e}")
        return None

def test_bridge(token):
    print("\nTesting Data Bridge (Context Ingestion)...")
    url = f"{BASE_URL}/creative/receive-context"
    headers = {"Authorization": f"Bearer {token}"}
    
    # The Payload from PDF 4
    payload = {
        "meta": {
            "version": "1.0",
            "timestamp": "2025-10-27T14:30:00Z",
            "trace_id": "sim-998877-bridge",
            "origin_system": "PyrolysisHub_Core_v2"
        },
        "project_identity": {
            "project_id": "uuid-del-proyecto-analitico",
            "project_name": "Valorización de Algas Marinas - Fase 3",
            "user_role": "Academico"
        },
        "technical_core": {
            "inputs": {
                "feedstock_type": "Microalgas (Spirulina)",
                "moisture_content_percent": 12.5,
                "process_temperature_celsius": 550,
                "residence_time_seconds": 45
            },
            "outcomes": {
                "yield_distribution": {
                    "biochar_percent": 25.0,
                    "biooil_percent": 55.0,
                    "syngas_percent": 20.0
                },
                "energy_efficiency_percent": 78.4,
                "carbon_sequestration_potential": "High"
            }
        },
        "semantic_bridge": {
            "primary_insight": "Rendimiento de Bio-oil excepcionalmente alto optimizado para biocombustibles.",
            "key_success_metrics": [
                "Eficiencia energética superior al 75%",
                "Baja producción de residuos"
            ],
            "suggested_keywords": [
                "Sostenibilidad Azul",
                "Biocombustible Avanzado",
                "Economía Circular",
                "Energía Renovable"
            ],
            "visual_cues": {
                "dominant_color": "Verde esmeralda (alga) a Oro negro (aceite)",
                "process_state": "Fluido, dinámico, transformación limpia",
                "elements_to_show": ["Matraces de laboratorio", "Océano abstracto", "Gota de combustible brillante"]
            }
        },
        "creative_defaults": {
            "suggested_tone": "Innovador / Científico-Optimista",
            "target_audience_hint": "Inversores de Green Tech",
            "prompt_starter_text": "Crea una narrativa visual que destaque la transformación eficiente de algas en energía limpia, enfatizando..."
        }
    }

    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        print("Bridge SUCCESS! Context Ingested.")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Bridge FAILED: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    token = get_auth_token()
    if token:
        test_bridge(token)
