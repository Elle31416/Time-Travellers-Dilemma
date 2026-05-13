"""Time Traveler's Dilemma API tests."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

DEVICE_ID = f"TEST_{uuid.uuid4().hex}"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    yield s
    # cleanup
    try:
        s.delete(f"{API}/games", params={"device_id": DEVICE_ID}, timeout=10)
    except Exception:
        pass


# ---- eras ----
class TestEras:
    def test_list_eras(self, client):
        r = client.get(f"{API}/eras", timeout=15)
        assert r.status_code == 200
        data = r.json()
        eras = data["eras"]
        assert len(eras) == 6
        tiers = [e["tier"] for e in eras]
        assert tiers.count("free") == 3
        assert tiers.count("premium") == 3
        ids = {e["id"] for e in eras}
        assert ids == {"roman", "titanic", "moon", "pompeii", "dday", "mars"}
        required = {"id", "name", "year", "scenario", "teaser", "danger", "tier", "image"}
        for e in eras:
            assert required.issubset(e.keys())


# ---- items ----
class TestItems:
    def test_list_items(self, client):
        r = client.get(f"{API}/items", timeout=15)
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) == 8
        for it in items:
            assert {"id", "name", "icon"}.issubset(it.keys())


# ---- judge ----
class TestJudge:
    def test_judge_happy_path(self, client):
        payload = {
            "device_id": DEVICE_ID,
            "era_id": "moon",
            "item_id": "compass",
            "plan": "Find Gene Kranz, claim to be a contracted engineer.",
        }
        r = client.post(f"{API}/judge", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "_id" not in data
        expected_keys = {
            "id", "survived", "survival_score", "narrative", "twist",
            "verdict", "era_id", "era_name", "item_id", "item_name",
            "plan", "created_at",
        }
        assert expected_keys.issubset(data.keys())
        assert isinstance(data["survived"], bool)
        assert 0 <= data["survival_score"] <= 100
        assert data["verdict"] in {
            "LEGENDARY", "SURVIVED", "BARELY MADE IT", "PERISHED", "CATASTROPHIC"
        }
        assert data["era_id"] == "moon"
        assert data["item_id"] == "compass"
        assert data["plan"] == payload["plan"]
        assert len(data["narrative"]) > 0
        assert len(data["twist"]) > 0

    def test_judge_invalid_era(self, client):
        r = client.post(
            f"{API}/judge",
            json={"device_id": DEVICE_ID, "era_id": "nope", "item_id": "compass", "plan": "x"},
            timeout=30,
        )
        assert r.status_code == 400

    def test_judge_invalid_item(self, client):
        r = client.post(
            f"{API}/judge",
            json={"device_id": DEVICE_ID, "era_id": "moon", "item_id": "nope", "plan": "x"},
            timeout=30,
        )
        assert r.status_code == 400


# ---- games / stats / delete ----
class TestGamesStats:
    def test_games_listed_and_sorted(self, client):
        r = client.get(f"{API}/games", params={"device_id": DEVICE_ID}, timeout=15)
        assert r.status_code == 200
        games = r.json()["games"]
        assert len(games) >= 1
        for g in games:
            assert "_id" not in g
        # desc sort
        ts = [g["created_at"] for g in games]
        assert ts == sorted(ts, reverse=True)

    def test_stats(self, client):
        r = client.get(f"{API}/stats", params={"device_id": DEVICE_ID}, timeout=15)
        assert r.status_code == 200
        s = r.json()
        assert set(s.keys()) == {
            "total_games", "survival_rate", "best_score", "current_streak", "legendary_count"
        }
        assert s["total_games"] >= 1

    def test_delete_games(self, client):
        r = client.delete(f"{API}/games", params={"device_id": DEVICE_ID}, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert "deleted" in body and body["deleted"] >= 1
        # verify cleared
        r2 = client.get(f"{API}/games", params={"device_id": DEVICE_ID}, timeout=15)
        assert r2.json()["games"] == []
