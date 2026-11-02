from fastapi.testclient import TestClient
from backend.main import app

def test_full_api():
    with TestClient(app) as client:
        # Health check
        r = client.get("/health")
        assert r.status_code == 200
        print("Health status:", r.json())

        # Analytics
        r_overview = client.get("/api/v1/analytics/overview")
        assert r_overview.status_code == 200
        data = r_overview.json()
        print("Metrics:", data["metrics"])

        # Botanical & Relationships
        r_plants = client.get("/api/v1/plants")
        assert r_plants.status_code == 200
        assert r_plants.json()["total"] >= 7

        r_rels = client.get("/api/v1/plants/bot_azadirachta/relationships")
        assert r_rels.status_code == 200
        print("Plant relationships:", r_rels.json()["accepted_scientific_name"])

        # Auth Login
        r_auth = client.post("/api/v1/auth/login", json={
            "email": "researcher@ethnotrace.org",
            "password": "EthnoHack2026!"
        })
        assert r_auth.status_code == 200
        token = r_auth.json()["access_token"]
        print("Auth Login successful. Token generated:", token[:12] + "...")

        # Auth Profile Verification
        r_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r_me.status_code == 200
        assert r_me.json()["email"] == "researcher@ethnotrace.org"
        print("Auth Profile:", r_me.json()["name"], f"({r_me.json()['role']})")

        # Document Status
        docs = client.get("/api/v1/documents").json()
        if docs:
            doc_id = docs[0]["id"]
            r_status = client.get(f"/api/v1/documents/{doc_id}/status")
            assert r_status.status_code == 200
            print("Document status verification:", r_status.json()["processing_status"])

        # Research Copilot
        r_copilot = client.post("/api/v1/copilot/query", json={
            "query": "What are the documented medicinal plants in Tamil Nadu for fever?"
        })
        assert r_copilot.status_code == 200
        copilot_res = r_copilot.json()
        print("Copilot citations count:", len(copilot_res["citations"]))
        assert len(copilot_res["citations"]) > 0

if __name__ == "__main__":
    test_full_api()
