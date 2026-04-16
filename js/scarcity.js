// ================================
// SCARCITY ENGINE — PROJECT ERAMDAM
// ================================
// 👇 track visit start (runs once per session)
if (!sessionStorage.getItem("pe_visit_start")) {
  sessionStorage.setItem("pe_visit_start", Date.now());
}
// PERSONALITY PROFILES
const SCARCITY_PROFILES = {
  hot: { base: 16, decay: 6, min: 2 },
  balanced: { base: 22, decay: 8, min: 3 },
  slow: { base: 30, decay: 12, min: 5 }
};

// AUTO PERSONALITY (NO JSON CHANGE)
function getPersonality(product) {
  const price = parseInt(product.price.replace(/[^\d]/g, ''));

  let type;

  if (price >= 1500) type = "slow";
  else if (price <= 900) type = "hot";
  else type = "balanced";

  // MICRO VARIATION
  const seed = (product.id * 7) % 3;

  if (type === "hot" && seed === 1) return "balanced";
  if (type === "balanced" && seed === 2) return "hot";

  return type;
}

// GET / INIT DEVICE STATE
function getScarcityState(productId) {
  const key = "pe_scarcity_" + productId;
  let data = JSON.parse(localStorage.getItem(key));

  if (!data) {
    data = {
      startTime: Date.now(),
      seed: Math.random() * 5
    };
    localStorage.setItem(key, JSON.stringify(data));
  }

  return data;
}

// CORE CALCULATION
function calculateStock(product) {
  const personality = getPersonality(product);
  const profile = SCARCITY_PROFILES[personality];
  const state = getScarcityState(product.id);

  const minutesPassed = (Date.now() - state.startTime) / 60000;
  const decaySteps = Math.floor(minutesPassed / profile.decay);

  let stock = profile.base - decaySteps + state.seed;
  // 👇 TIME-BASED INTEREST (no HTML needed)
const visitStart = sessionStorage.getItem("pe_visit_start");

let timeBoost = 0;

if (visitStart) {
  const start = parseInt(visitStart);

  if (!isNaN(start)) {
    const minutesOnPage = (Date.now() - start) / 60000;

    if (minutesOnPage > 3) timeBoost = 1;
    if (minutesOnPage > 7) timeBoost = 2;
  }
}

stock -= timeBoost;

  // FLOOR PROTECTION
  stock = Math.max(profile.min, Math.floor(stock));

  // SOFT RESET (18–42 hrs randomized)
  const resetWindow = 1080 + (product.id % 24) * 60;

  if (minutesPassed > resetWindow) {
    state.startTime = Date.now();
  }

  return stock;
}

// SINGLE MESSAGE RULE
function getScarcityMessage(stock) {
  if (stock <= 5) return `Only ${stock} left`;

  if (stock <= 10) return "Selling fast";

  // ✅ MOST IMPORTANT CHANGE
  return ""; // show nothing when not needed
}

// PUBLIC FUNCTION (USE THIS)
function getScarcityText(product) {
  const stock = calculateStock(product);
  return getScarcityMessage(stock);
}
