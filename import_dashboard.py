#!/usr/bin/env python3
"""
Script para importar dashboard en Grafana usando su API
"""
import requests
import json
import time

# Configuración
GRAFANA_URL = "http://localhost:3002"
GRAFANA_USER = "admin"
GRAFANA_PASSWORD = "admin123"

# Path al dashboard JSON
DASHBOARD_PATH = r"F:\PerfectPrompt\monitoring\grafana\dashboards\nexo-backend-dashboard.json"

def import_dashboard():
    """Importa el dashboard en Grafana"""
    
    # Leer el dashboard JSON
    with open(DASHBOARD_PATH, 'r') as f:
        dashboard_json = json.load(f)
    
    # Preparar el payload para la API de Grafana
    payload = {
        "dashboard": dashboard_json,
        "overwrite": True,
        "message": "Importing Nexo Backend Dashboard"
    }
    
    # Realizar la importación
    headers = {
        "Content-Type": "application/json"
    }
    
    url = f"{GRAFANA_URL}/api/dashboards/db"
    
    try:
        response = requests.post(
            url,
            json=payload,
            auth=(GRAFANA_USER, GRAFANA_PASSWORD),
            headers=headers,
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"✅ Dashboard importado exitosamente!")
            print(f"   ID: {result.get('id')}")
            print(f"   UID: {result.get('uid')}")
            print(f"   URL: {GRAFANA_URL}/d/{result.get('uid')}")
            return True
        else:
            print(f"❌ Error al importar: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ No se puede conectar a Grafana en {GRAFANA_URL}")
        print("   Asegúrate de que Grafana está corriendo")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("Importando dashboard en Grafana...")
    print(f"URL: {GRAFANA_URL}")
    print(f"Dashboard: {DASHBOARD_PATH}\n")
    
    # Esperar un poco para que Grafana esté listo
    time.sleep(2)
    
    success = import_dashboard()
    exit(0 if success else 1)
