from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import math

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Game State (In-memory for now)
user_state = {
    "level": 1,
    "xp": 0,
    "xp_to_next_level": 100,
    "gold": 0,
    "monsters_slain": 0
}

# Monster Templates - Tiered by size
MONSTER_TIERS = {
    "tiny": [
        {"name": "Tracker-Spider", "base_hp": 15, "xp_reward": 8, "image": "https://api.dicebear.com/7.x/bottts/svg?seed=spider&backgroundColor=1a1a2e"},
        {"name": "Cookie-Imp", "base_hp": 12, "xp_reward": 6, "image": "https://api.dicebear.com/7.x/bottts/svg?seed=imp&backgroundColor=2d132c"},
    ],
    "small": [
        {"name": "Ad-Goblin", "base_hp": 25, "xp_reward": 15, "image": "https://api.dicebear.com/7.x/bottts/svg?seed=goblin&backgroundColor=1e3d59"},
        {"name": "Pixel-Rat", "base_hp": 20, "xp_reward": 12, "image": "https://api.dicebear.com/7.x/bottts/svg?seed=rat&backgroundColor=17301c"},
    ],
    "medium": [
        {"name": "Banner-Orc", "base_hp": 50, "xp_reward": 30, "image": "https://api.dicebear.com/7.x/bottts/svg?seed=orc&backgroundColor=4a0e0e"},
        {"name": "Sidebar-Troll", "base_hp": 60, "xp_reward": 35, "image": "https://api.dicebear.com/7.x/bottts/svg?seed=troll&backgroundColor=0e4a1c"},
    ],
    "large": [
        {"name": "Popup-Dragon", "base_hp": 100, "xp_reward": 60, "image": "https://api.dicebear.com/7.x/bottts/svg?seed=dragon&backgroundColor=4a1942"},
        {"name": "Overlay-Demon", "base_hp": 120, "xp_reward": 75, "image": "https://api.dicebear.com/7.x/bottts/svg?seed=demon&backgroundColor=2a0a3a"},
    ],
    "boss": [
        {"name": "Fullscreen-Hydra", "base_hp": 200, "xp_reward": 150, "image": "https://api.dicebear.com/7.x/bottts/svg?seed=hydra&backgroundColor=0a0a0a"},
        {"name": "Interstitial-Leviathan", "base_hp": 250, "xp_reward": 200, "image": "https://api.dicebear.com/7.x/bottts/svg?seed=leviathan&backgroundColor=1a0505"},
    ]
}

def get_monster_tier(width, height):
    """Determine monster tier based on ad dimensions"""
    area = width * height
    
    # Boss: fullscreen or very large (>200k px)
    if area > 200000 or (width > 700 and height > 400):
        return "boss"
    # Large: big banners, large rectangles (>90k px)
    elif area > 90000 or (width > 600 and height > 250):
        return "large"
    # Medium: standard banners (>30k px)
    elif area > 30000 or (width > 300 and height > 150):
        return "medium"
    # Small: smaller units (>8k px)
    elif area > 8000:
        return "small"
    # Tiny: tracking pixels, small widgets
    else:
        return "tiny"

def calculate_monster_level(width, height, tier):
    """Calculate monster level based on size and tier"""
    area = width * height
    base_levels = {"tiny": 1, "small": 3, "medium": 5, "large": 8, "boss": 12}
    base = base_levels.get(tier, 1)
    # Add variance based on actual area within tier
    bonus = min(5, int(math.sqrt(area) / 100))
    return base + bonus

@app.route('/user', methods=['GET'])
def get_user():
    return jsonify(user_state)

@app.route('/monster', methods=['POST'])
def spawn_monster():
    data = request.json or {}
    width = int(data.get('width', 300))
    height = int(data.get('height', 250))
    
    # Determine tier and select monster
    tier = get_monster_tier(width, height)
    monster_template = random.choice(MONSTER_TIERS[tier])
    
    # Calculate level based on actual dimensions
    level = calculate_monster_level(width, height, tier)
    
    # Scale HP and XP with level
    hp_multiplier = 1 + (level - 1) * 0.15
    xp_multiplier = 1 + (level - 1) * 0.12
    
    monster = {
        "id": random.randint(1000, 9999),
        "name": monster_template["name"],
        "level": level,
        "tier": tier,
        "max_hp": int(monster_template["base_hp"] * hp_multiplier),
        "current_hp": int(monster_template["base_hp"] * hp_multiplier),
        "xp_reward": int(monster_template["xp_reward"] * xp_multiplier),
        "gold_reward": random.randint(level, level * 3),
        "image": monster_template["image"],
        "width": width,
        "height": height
    }
    
    return jsonify(monster)

@app.route('/attack', methods=['POST'])
def attack_monster():
    data = request.json or {}
    damage = data.get('damage', 10)
    monster_hp = data.get('current_hp', 0)
    xp_reward = data.get('xp_reward', 0)
    gold_reward = data.get('gold_reward', 1)
    
    new_hp = max(0, monster_hp - damage)
    defeated = new_hp == 0
    
    reward = {}
    if defeated:
        user_state['xp'] += xp_reward
        user_state['gold'] += gold_reward
        user_state['monsters_slain'] += 1
        reward = {"xp": xp_reward, "gold": gold_reward, "total_gold": user_state['gold']}
        
        # Level up logic
        if user_state['xp'] >= user_state['xp_to_next_level']:
            user_state['level'] += 1
            user_state['xp'] -= user_state['xp_to_next_level']
            user_state['xp_to_next_level'] = int(user_state['xp_to_next_level'] * 1.25)
            reward['level_up'] = True
            reward['new_level'] = user_state['level']
            
    return jsonify({
        "current_hp": new_hp,
        "defeated": defeated,
        "reward": reward,
        "user_state": user_state
    })

@app.route('/stats', methods=['GET'])
def get_stats():
    return jsonify({
        "user": user_state,
        "next_level_xp": user_state['xp_to_next_level'] - user_state['xp']
    })

if __name__ == '__main__':
    app.run(debug=False, port=5000)

# Reviewed on 2025-12-19T10:29:28.734983

# Reviewed on 2025-12-19T10:29:28.806845

# Reviewed on 2025-12-19T10:29:28.872725

# Reviewed on 2025-12-19T10:29:28.933656

# Reviewed on 2025-12-19T10:29:29.298412

# Reviewed on 2025-12-19T10:29:29.357839

# Reviewed on 2025-12-19T10:29:29.884445

# Reviewed on 2025-12-19T10:29:30.122717
