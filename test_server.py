import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoints():
    print("Testing Ad-RPG Backend...")
    
    # 1. Spawn Monster
    print("\n1. Spawning Monster...")
    try:
        res = requests.post(f"{BASE_URL}/monster", json={"width": 300, "height": 250})
        if res.status_code == 200:
            monster = res.json()
            print(f"✅ Success! Spawned: {monster['name']} (HP: {monster['current_hp']})")
        else:
            print(f"❌ Failed: {res.status_code}")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        return

    # 2. Attack Monster
    print("\n2. Attacking Monster...")
    try:
        res = requests.post(f"{BASE_URL}/attack", json={
            "damage": 10,
            "current_hp": monster['current_hp'],
            "xp_reward": monster['xp_reward']
        })
        if res.status_code == 200:
            result = res.json()
            print(f"✅ Success! New HP: {result['current_hp']}, Defeated: {result['defeated']}")
        else:
            print(f"❌ Failed: {res.status_code}")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

    # 3. Get User Stats
    print("\n3. Checking User Stats...")
    try:
        res = requests.get(f"{BASE_URL}/user")
        if res.status_code == 200:
            user = res.json()
            print(f"✅ Success! Level: {user['level']}, XP: {user['xp']}")
        else:
            print(f"❌ Failed: {res.status_code}")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    test_endpoints()
