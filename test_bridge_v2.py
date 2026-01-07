import requests
import json
import sys
import time
import subprocess
import os

BASE_URL = "http://localhost:8000"
SERVER_PROCESS = None

def start_server():
    global SERVER_PROCESS
    print("🔧 Starting Backend Server...")
    backend_dir = os.path.join(os.getcwd(), "backend")
    cmd = [sys.executable, "-m", "uvicorn", "main:app", "--port", "8000"]
    
    SERVER_PROCESS = subprocess.Popen(
        cmd,
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    print("⏳ Waiting for server to be ready...")
    for _ in range(30):
        try:
            requests.get(BASE_URL)
            print("✅ Server is UP!")
            return True
        except requests.exceptions.ConnectionError:
            time.sleep(1)
            
    print("❌ Server failed to start.")
    _, stderr = SERVER_PROCESS.communicate()
    print(stderr)
    return False

def stop_server():
    global SERVER_PROCESS
    if SERVER_PROCESS:
        print("🛑 Stopping Server...")
        SERVER_PROCESS.terminate()
        SERVER_PROCESS.wait()

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

def test_bridge_generation(token):
    print("\nTesting Data Bridge Generation (Context + Prompt)...")
    url = f"{BASE_URL}/creative/generate-prompt"
    headers = {"Authorization": f"Bearer {token}"}
    
    # The Context Payload
    context_payload = {
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
                "efficiency": 78.4, # Changed from energy_efficiency_percent to match schema if needed, but schema says Dict[str, Any] so it's flexible
                "carbon_sequestration_potential": "High"
            }
        },
        "semantic_bridge": {
            "primary_insight": "Rendimiento de Bio-oil excepcionalmente alto optimizado para biocombustibles.",
            "suggested_keywords": [
                "Sostenibilidad Azul",
                "Biocombustible Avanzado",
                "Economía Circular"
            ],
            "visual_cues": {
                "dominant_color": "Verde esmeralda a Oro negro",
                "process_state": "Fluido, dinámico",
                "elements_to_show": ["Matraces", "Océano", "Gota brillante"]
            }
        },
        "creative_defaults": {
            "suggested_tone": "Innovador / Científico-Optimista"
        }
    }

    # The Bridge Request
    bridge_request = {
        "context": context_payload,
        "prompt": "Genera un prompt visual para DALL-E que represente este proceso."
    }

    try:
        response = requests.post(url, json=bridge_request, headers=headers)
        
        if response.status_code == 200:
            print("✅ Bridge Generation SUCCESS!")
            data = response.json()
            print("\n--- AI Response ---")
            print(data["response"])
            print("-------------------")
        else:
            print(f"❌ Bridge Generation FAILED: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Request Error: {e}")

def main():
    if not start_server():
        sys.exit(1)
        
    try:
        token = get_auth_token()
        if token:
            test_bridge_generation(token)
        else:
            print("❌ Could not get token. Skipping test.")
    finally:
        stop_server()

if __name__ == "__main__":
    main()
