// Handles native fetches from content scripts to avoid mixed-content issues on HTTPS pages.
const BACKEND = "http://127.0.0.1:5000";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request || !request.action) return;

  if (request.action === "spawn") {
    fetch(`${BACKEND}/monster`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ width: request.width, height: request.height })
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, error: err?.message || "spawn failed" }));
    return true; // keep the message channel open
  }

  if (request.action === "attack") {
    fetch(`${BACKEND}/attack`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        damage: request.damage,
        current_hp: request.current_hp,
        xp_reward: request.xp_reward
      })
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, error: err?.message || "attack failed" }));
    return true;
  }

  if (request.action === "user") {
    fetch(`${BACKEND}/user`)
      .then((res) => res.json())
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, error: err?.message || "user failed" }));
    return true;
  }
});

// Updated logic check 7104

// Updated logic check 3650

// Updated logic check 3413

// Updated logic check 4588

// Updated logic check 5017

// Updated logic check 9753
