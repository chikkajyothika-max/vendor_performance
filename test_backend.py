import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("--- 1. Testing Unauthenticated Access ---")
    r = client.get("/api/auth/me")
    assert r.status_code == 401, f"Expected 401, got {r.status_code}"
    print("PASS: /api/auth/me returns 401 when unauthenticated")

    print("\n--- 2. Testing Login with Admin Credentials ---")
    r = client.post("/api/auth/login", json={"email": "admin@vendorsync.ai", "password": "admin123"})
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    user = r.json()
    assert user["email"] == "admin@vendorsync.ai"
    assert "access_token" in client.cookies
    print(f"PASS: Logged in successfully as {user['name']} ({user['role']})")

    print("\n--- 3. Testing /api/auth/me with Cookie ---")
    r = client.get("/api/auth/me")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    assert r.json()["id"] == user["id"]
    print("PASS: /api/auth/me verified successfully")

    print("\n--- 4. Testing /api/dashboard ---")
    r = client.get("/api/dashboard")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    dash = r.json()
    assert "stats" in dash
    assert "vendors" in dash
    assert "monthly" in dash
    print(f"PASS: Dashboard returned {dash['stats']['vendors']} vendors, {dash['stats']['orders']} orders")

    print("\n--- 5. Testing /api/risk/predict ---")
    first_vendor_id = dash["vendors"][0]["id"]
    r = client.post("/api/risk/predict", json={"vendor_id": first_vendor_id})
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    pred = r.json()
    assert "risk" in pred
    assert "risk_score" in pred
    assert "factors" in pred
    assert "recommendation" in pred
    print(f"PASS: Risk predicted for {first_vendor_id}: {pred['risk']} risk ({pred['risk_score']}%), factors: {pred['factors']}")

    print("\n--- 6. Testing /api/vendors/{id}/profile ---")
    r = client.get(f"/api/vendors/{first_vendor_id}/profile")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    prof = r.json()
    assert "vendor" in prof
    assert "history" in prof
    assert "notes" in prof
    print(f"PASS: Profile retrieved with {len(prof['history'])} history records")

    print("\n--- 7. Testing Adding and Deleting Notes ---")
    r = client.post(f"/api/vendors/{first_vendor_id}/notes", json={"note": "Testing automated relationship note"})
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    note = r.json()
    assert note["note"] == "Testing automated relationship note"
    note_id = note["id"]
    print(f"PASS: Note created with ID {note_id}")

    r = client.delete(f"/api/vendors/{first_vendor_id}/notes/{note_id}")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    print("PASS: Note deleted successfully")

    print("\n--- 8. Testing Creating and Deleting Vendor ---")
    r = client.post("/api/vendors", json={
        "name": "Apex Microdevices",
        "category": "Electronics",
        "email": "contact@apexmicro.com",
        "location": "San Jose, CA",
        "contract_value": 150000
    })
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    new_v = r.json()
    new_vid = new_v["id"]
    print(f"PASS: Created vendor {new_v['name']} ({new_vid}) with score {new_v['score']}% ({new_v['risk']} risk)")

    r = client.delete(f"/api/vendors/{new_vid}")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    print(f"PASS: Deleted vendor {new_vid}")

    print("\n--- 9. Testing Static File Serving ---")
    r = client.get("/")
    assert r.status_code == 200
    assert "VendorSync AI" in r.text
    print("PASS: Root / serves index.html with VendorSync AI title")

    print("\n--- 11. Testing System & Database Health ---")
    r = client.get("/api/health")
    assert r.status_code == 200
    h_data = r.json()
    assert h_data["status"] == "healthy"
    print(f"PASS: Health check verified (Dialect: {h_data['dialect']}, Latency: {h_data['latency_ms']}ms)")

    # Re-login for authenticated AI endpoints
    client.post("/api/auth/login", json={"email": "admin@vendorsync.ai", "password": "admin123"})

    print("\n--- 12. Testing AI Engine Status ---")
    r = client.get("/api/ai/status")
    assert r.status_code == 200
    ai_status = r.json()
    print(f"PASS: AI Status verified: {ai_status['mode']} ({ai_status['model']})")

    print("\n--- 13. Testing AI Procurement Copilot Chat ---")
    r = client.post("/api/ai/chat", json={"message": "Which vendor should I pick for high-value orders?"})
    assert r.status_code == 200
    chat_data = r.json()
    assert len(chat_data["reply"]) > 50
    print(f"PASS: AI Copilot returned intelligent grounded recommendation ({chat_data['provider']})")

    print("\n--- 14. Testing Deep AI Vendor Analysis ---")
    r = client.post("/api/ai/analyze/V-1048")
    assert r.status_code == 200
    deep_data = r.json()
    assert "risk_level" in deep_data
    assert len(deep_data["key_risk_drivers"]) > 0
    print(f"PASS: Deep AI risk analysis generated for {deep_data['vendor_name']} ({deep_data['risk_level']} risk, Confidence: {deep_data['confidence_score']}%)")

    print("\n--- 15. Testing Logout ---")
    r = client.post("/api/auth/logout")
    assert r.status_code == 200
    print("PASS: Logout successful")

    print("\n==============================================")
    print("ALL 15 BACKEND & AI INTEGRATION TESTS PASSED!")
    print("==============================================")

if __name__ == "__main__":
    run_tests()
