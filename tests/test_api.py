import requests
import json

BASE_URL = "${API_BASE_URL}"
HEADERS = {}


def test_get(endpoint, expected_status=200):
    print(f"\nTesting GET {endpoint}...")
    try:
        print(f"Sending request to {BASE_URL}{endpoint}")
        response = requests.get(f"{BASE_URL}{endpoint}", headers=HEADERS)
        print(f"Status Code: {response.status_code}")
        # פענוח ה-JSON והדפסה עם ensure_ascii=False כדי להציג עברית כראוי
        response_data = response.json()
        print(f"Raw Response: {json.dumps(response_data, ensure_ascii=False, indent=2)}")
        if response.status_code == expected_status:
            return response_data
        else:
            raise ValueError(f"Unexpected status code: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")
        return None


def test_post(endpoint, data, expected_status=201):
    print(f"\nTesting POST {endpoint}...")
    try:
        print(f"Sending request to {BASE_URL}{endpoint}")
        response = requests.post(f"{BASE_URL}{endpoint}", json=data, headers=HEADERS)
        print(f"Status Code: {response.status_code}")
        # פענוח ה-JSON והדפסה עם ensure_ascii=False כדי להציג עברית כראוי
        response_data = response.json()
        print(f"Raw Response: {json.dumps(response_data, ensure_ascii=False, indent=2)}")
        if response.status_code == expected_status:
            return response_data
        else:
            raise ValueError(f"Unexpected status code: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")
        return None


def test_delete(endpoint, id, expected_status=200):
    print(f"\nTesting DELETE {endpoint}/{id}...")
    try:
        print(f"Sending request to {BASE_URL}{endpoint}/{id}")
        response = requests.delete(f"{BASE_URL}{endpoint}/{id}", headers=HEADERS)
        print(f"Status Code: {response.status_code}")
        # פענוח ה-JSON והדפסה עם ensure_ascii=False
        if response.text:
            response_data = response.json()
            print(f"Raw Response: {json.dumps(response_data, ensure_ascii=False, indent=2)}")
        else:
            print(f"Raw Response: {response.text}")
        if response.status_code == expected_status:
            return response_data if response.text else None
        else:
            raise ValueError(f"Unexpected status code: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")


def check_unique_ids(data, entity_type):
    print(f"\nChecking for duplicate IDs in {entity_type}...")
    if data:
        ids = [item['id'] for item in data if 'id' in item]
        duplicates = set([id for id in ids if ids.count(id) > 1])
        if duplicates:
            print(f"Duplicate IDs found in {entity_type}: {duplicates}")
        else:
            print(f"No duplicate IDs found in {entity_type}.")
    else:
        print(f"No data to check for duplicates in {entity_type}.")


def run_tests():
    # בדיקת רשתות
    networks = test_get("/api/networks")
    if networks:
        check_unique_ids(networks, "networks")

    new_network = test_post("/api/networks", {
        "name": "רשת חדשה 2",
        "color": "#FF0000"
    })

    # בדיקת נתבים
    routers = test_get("/api/routers")
    if routers:
        check_unique_ids(routers, "routers")

    new_router = test_post("/api/routers", {
        "name": "נתב חדש נוסף",
        "ip_address": "192.168.1.102",
        "floor": 4,
        "building": "בניין צפון",
        "connection_speed": "1Gbps",
        "network_id": 5,
        "model_id": 6
    })

    # בדיקת נקודות קצה
    endpoints = test_get("/api/endpoints")
    if endpoints:
        check_unique_ids(endpoints, "endpoints")

    new_endpoint = test_post("/api/endpoints", {
        "technician_name": "מיכאל",
        "point_location": "חדר 201",
        "destination_room": "חדר 202",
        "connected_port_number": 7,
        "router_id": 10
    })

    # בדיקת מחיקה (למשל, מחיקת נתב)
    if new_router:
        test_delete("/api/routers", new_router['id'])


if __name__ == "__main__":
    run_tests()