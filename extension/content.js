// Comprehensive ad detection selectors
const AD_SELECTORS = [
    // Google Ads
    'iframe[src*="ads"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="adservice"]',
    'iframe[id*="google_ads"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="googleads"]',
    'ins.adsbygoogle',
    'div[id^="div-gpt-ad"]',
    'div[data-ad-client]',
    'div[data-ad-slot]',
    // Ad images
    'img[src*="adservice"]',
    'img[src*="doubleclick"]',
    'img[src*="adsystem"]',
    'img[src*="/ads/"]',
    'img[src*="ad."]',
    // Common ad containers
    'div[id*="ad-container"]',
    'div[id*="ad_container"]',
    'div[id*="adContainer"]',
    'div[class*="ad-slot"]',
    'div[class*="ad_slot"]',
    'div[class*="adSlot"]',
    'div[class*="sponsored"]',
    'div[class*="advertisement"]',
    'div[class*="ad-wrapper"]',
    'div[class*="ad_wrapper"]',
    'section[data-ad]',
    'aside[data-ad]',
    // Third party ad networks
    'div[id*="taboola"]',
    'div[id*="outbrain"]',
    'div[class*="taboola"]',
    'div[class*="outbrain"]',
    // Amazon ads
    'div[id*="amzn-assoc"]',
    'iframe[src*="amazon-adsystem"]'
];

// Heuristic patterns for ad-like elements
const AD_PATTERNS = /^(ad|ads|advert|advertisement|banner|sponsor|promo|commercial)/i;
const AD_SIZE_PATTERNS = [
    {width: 728, height: 90},   // Leaderboard
    {width: 300, height: 250},  // Medium Rectangle
    {width: 336, height: 280},  // Large Rectangle
    {width: 300, height: 600},  // Half Page
    {width: 320, height: 50},   // Mobile Banner
    {width: 320, height: 100},  // Large Mobile Banner
    {width: 160, height: 600},  // Wide Skyscraper
    {width: 970, height: 250},  // Billboard
];

function isAdSize(width, height) {
    const tolerance = 20;
    return AD_SIZE_PATTERNS.some(size => 
        Math.abs(width - size.width) < tolerance && 
        Math.abs(height - size.height) < tolerance
    );
}

function initAdRPG() {
    // Direct selector matches
    AD_SELECTORS.forEach(selector => {
        try {
            const ads = document.querySelectorAll(selector);
            ads.forEach(ad => {
                if (ad.dataset.rpgProcessed) return;
                if (ad.offsetWidth < 40 || ad.offsetHeight < 40) return;
                convertToMonster(ad);
            });
        } catch (e) { /* invalid selector */ }
    });

    // Heuristic: elements with ad-like ids/classes
    const candidates = document.querySelectorAll('[id*="ad"], [class*="ad"], [id*="banner"], [class*="banner"]');
    candidates.forEach(el => {
        if (el.dataset.rpgProcessed) return;
        if (el.offsetWidth < 40 || el.offsetHeight < 40) return;
        
        const id = (el.id || '').toLowerCase();
        const cls = (el.className || '').toLowerCase();
        
        // Check if it matches ad patterns or standard ad sizes
        if (AD_PATTERNS.test(id) || AD_PATTERNS.test(cls) || isAdSize(el.offsetWidth, el.offsetHeight)) {
            convertToMonster(el);
        }
    });
    
    // Catch iframes that might be ads based on size
    document.querySelectorAll('iframe').forEach(iframe => {
        if (iframe.dataset.rpgProcessed) return;
        if (iframe.offsetWidth < 40 || iframe.offsetHeight < 40) return;
        if (isAdSize(iframe.offsetWidth, iframe.offsetHeight)) {
            convertToMonster(iframe);
        }
    });
}

function fetchFromBackground(action, payload) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action, ...payload }, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
                return;
            }
            if (!response || !response.ok) {
                reject(response?.error || 'No response');
                return;
            }
            resolve(response.data);
        });
    });
}

async function convertToMonster(adElement) {
    adElement.dataset.rpgProcessed = "true";
    const width = adElement.offsetWidth;
    const height = adElement.offsetHeight;

    const container = document.createElement('div');
    container.className = 'ad-rpg-container';
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.minHeight = `${Math.max(height, 50)}px`;
    container.style.minWidth = `${Math.max(width, 50)}px`;

    try {
        const monster = await fetchFromBackground('spawn', { width, height });
        renderMonster(container, monster);
        adElement.replaceWith(container);
    } catch (error) {
        console.error("Ad-RPG: Failed to summon monster", error);
        adElement.style.display = 'none';
        adElement.style.visibility = 'hidden';
    }
}

function getTierColor(tier) {
    const colors = {
        tiny: '#7f8c8d',
        small: '#27ae60',
        medium: '#2980b9',
        large: '#8e44ad',
        boss: '#c0392b'
    };
    return colors[tier] || '#f1c40f';
}

function renderMonster(container, monster) {
    const tierColor = getTierColor(monster.tier);
    const tierLabel = monster.tier.toUpperCase();
    
    container.innerHTML = `
        <div class="ad-rpg-tier" style="background-color: ${tierColor}">${tierLabel}</div>
        <div class="ad-rpg-header">Lvl ${monster.level} ${monster.name}</div>
        <img src="${monster.image}" class="ad-rpg-monster-img" alt="Monster">
        <div class="ad-rpg-health-bar">
            <div class="ad-rpg-health-fill" style="width: 100%"></div>
        </div>
        <div class="ad-rpg-hp-text">${monster.current_hp}/${monster.max_hp} HP</div>
        <button class="ad-rpg-attack-btn">⚔️ ATTACK!</button>
        <div class="ad-rpg-stats">🎯 ${monster.xp_reward} XP | 💰 ${monster.gold_reward} Gold</div>
        <div class="ad-rpg-victory">
            <div class="victory-text">🏆 VICTORY!</div>
            <div class="victory-rewards">+${monster.xp_reward} XP | +${monster.gold_reward} Gold</div>
        </div>
    `;

    const btn = container.querySelector('.ad-rpg-attack-btn');
    const healthFill = container.querySelector('.ad-rpg-health-fill');
    const hpText = container.querySelector('.ad-rpg-hp-text');
    const victoryScreen = container.querySelector('.ad-rpg-victory');

    // Calculate damage based on user interaction (click power)
    let clickCount = 0;
    
    btn.addEventListener('click', async () => {
        clickCount++;
        const baseDamage = 10;
        const critChance = 0.15;
        const isCrit = Math.random() < critChance;
        const damage = isCrit ? baseDamage * 2 : baseDamage;
        
        // Visual feedback
        btn.textContent = isCrit ? '💥 CRIT!' : '⚔️ HIT!';
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            btn.textContent = '⚔️ ATTACK!';
            btn.style.transform = 'scale(1)';
        }, 150);
        
        try {
            const result = await fetchFromBackground('attack', {
                damage: damage,
                current_hp: monster.current_hp,
                xp_reward: monster.xp_reward,
                gold_reward: monster.gold_reward
            });

            monster.current_hp = result.current_hp;
            const hpPercent = (monster.current_hp / monster.max_hp) * 100;
            healthFill.style.width = `${hpPercent}%`;
            hpText.textContent = `${monster.current_hp}/${monster.max_hp} HP`;
            
            // Color health bar based on remaining HP
            if (hpPercent < 25) {
                healthFill.style.backgroundColor = '#e74c3c';
            } else if (hpPercent < 50) {
                healthFill.style.backgroundColor = '#f39c12';
            }

            if (result.defeated) {
                victoryScreen.style.display = 'flex';
                btn.disabled = true;
                if (result.reward && result.reward.level_up) {
                    victoryScreen.querySelector('.victory-rewards').innerHTML += 
                        `<br>🎉 LEVEL UP! Now Level ${result.reward.new_level}!`;
                }
            }
        } catch (err) {
            console.error("Attack failed", err);
        }
    });
}

// Run periodically to catch lazy-loaded ads
setInterval(initAdRPG, 2000);
initAdRPG();

// Updated logic check 7985

// Updated logic check 6500

// Updated logic check 8552

// Updated logic check 8694

// Updated logic check 2751

// Updated logic check 2385

// Updated logic check 2470
