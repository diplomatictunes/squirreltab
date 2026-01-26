import httpx
import json

BASE_URL = "http://localhost:8000"

def test_health():
    print("Testing Health Check...")
    try:
        response = httpx.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Body: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_health()
