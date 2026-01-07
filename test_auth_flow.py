print("Init...")
import requests
import sys
import time
import subprocess
import os
import signal

BASE_URL = "http://localhost:8000"
SERVER_PROCESS = None

def start_server():
    global SERVER_PROCESS
    print("🔧 Starting Backend Server...")
    # Assume we are in root, backend is in ./backend
    # We need to set PYTHONPATH or cd into backend
    # Let's cd into backend
    backend_dir = os.path.join(os.getcwd(), "backend")
    
    # Command to start uvicorn
    cmd = [sys.executable, "-m", "uvicorn", "main:app", "--port", "8000"]
    
    SERVER_PROCESS = subprocess.Popen(
        cmd,
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Wait for server to start
    print("⏳ Waiting for server to be ready...")
    for _ in range(30): # Wait up to 30 seconds
        try:
            requests.get(BASE_URL)
            print("✅ Server is UP!")
            return True
        except requests.exceptions.ConnectionError:
            time.sleep(1)
            
    print("❌ Server failed to start.")
    # Print stderr
    _, stderr = SERVER_PROCESS.communicate()
    print(stderr)
    return False

def stop_server():
    global SERVER_PROCESS
    if SERVER_PROCESS:
        print("🛑 Stopping Server...")
        SERVER_PROCESS.terminate()
        SERVER_PROCESS.wait()

def print_step(step, message):
    print(f"\n[{step}] {message}")
    print("-" * 50)

def login(email, password):
    url = f"{BASE_URL}/auth/login"
    payload = {
        "email": email,
        "password": password
    }
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful for {email}")
            return data["access_token"]
        else:
            print(f"❌ Login failed for {email}: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return None

def access_protected_resource(token, resource_name):
    url = f"{BASE_URL}{resource_name}"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            print(f"✅ Access GRANTED to {resource_name}")
            return True
        elif response.status_code == 401:
            print(f"🛡️ Access DENIED (401 Unauthorized) to {resource_name}")
            return False
        else:
            print(f"⚠️ Unexpected status {response.status_code} for {resource_name}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def revoke_tokens(admin_token, target_email):
    url = f"{BASE_URL}/admin/revoke-user-tokens/{target_email}"
    headers = {"Authorization": f"Bearer {admin_token}"}
    try:
        response = requests.post(url, headers=headers)
        if response.status_code == 200:
            print(f"✅ Revocation successful for {target_email}")
            return True
        else:
            print(f"❌ Revocation failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def main():
    print("🚀 Starting Auth Flow Verification...")
    
    if not start_server():
        sys.exit(1)

    try:
        # 1. Login as Scientist
        print_step(1, "Login as Scientist (cientifico@nexo.com)")
        scientist_token = login("cientifico@nexo.com", "ciencia123")
        if not scientist_token:
            sys.exit(1)

        # 2. Access Protected Resource
        print_step(2, "Access Protected Resource with Valid Token")
        if not access_protected_resource(scientist_token, "/pyrolysis/simulation-data"):
            print("❌ Failed initial access check. Aborting.")
            sys.exit(1)

        # 3. Login as Admin
        print_step(3, "Login as Admin (admin@nexo.com)")
        admin_token = login("admin@nexo.com", "admin123")
        if not admin_token:
            sys.exit(1)

        # 4. Revoke Scientist Tokens
        print_step(4, "Revoke Scientist Tokens")
        if not revoke_tokens(admin_token, "cientifico@nexo.com"):
            print("❌ Failed to revoke tokens. Aborting.")
            sys.exit(1)

        # 5. Try Access with Old Token
        print_step(5, "Attempt Access with REVOKED Token")
        success = access_protected_resource(scientist_token, "/pyrolysis/simulation-data")
        if not success:
            print("✅ Security Check PASSED: Revoked token was rejected.")
        else:
            print("❌ Security Check FAILED: Revoked token was accepted!")
            sys.exit(1)

        # 6. Re-login as Scientist
        print_step(6, "Re-login as Scientist (Get New Token)")
        new_scientist_token = login("cientifico@nexo.com", "ciencia123")
        if not new_scientist_token:
            sys.exit(1)

        # 7. Access with New Token
        print_step(7, "Access with NEW Token")
        if access_protected_resource(new_scientist_token, "/pyrolysis/simulation-data"):
            print("✅ Recovery Check PASSED: New token works.")
        else:
            print("❌ Recovery Check FAILED: New token rejected.")
            sys.exit(1)

        print("\n🎉 ALL CHECKS PASSED! Auth System is Secure.")
    
    finally:
        stop_server()

if __name__ == "__main__":
    main()
