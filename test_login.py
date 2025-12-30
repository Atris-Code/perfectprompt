import requests

BASE_URL = "http://localhost:8001"

def test_login():
    print("Testing Login...")
    url = f"{BASE_URL}/auth/login"
    payload = {
        "email": "cientifico@nexo.com",
        "password": "ciencia123"
    }
    
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            print("Login SUCCESS!")
            print(f"Token: {data['access_token'][:20]}...")
            print(f"Roles: {data['roles']}")
            print(f"User: {data['user_name']}")
            return data['access_token']
        else:
            print(f"Login FAILED: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Error connecting to server: {e}")
        return None

def test_protected_route(token):
    print("\nTesting Protected Route (Pyrolysis Hub)...")
    url = f"{BASE_URL}/pyrolysis/simulation-data"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        print("Access GRANTED!")
        print(response.json())
    else:
        print(f"Access DENIED: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    token = test_login()
    if token:
        test_protected_route(token)
