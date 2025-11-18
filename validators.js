// Basic URL validation with URL constructor and protocol check
function isValidUrl(input) {
  try {
    const u = new URL(input);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

// Code: [A-Za-z0-9]{6,8}
function isValidCode(code) {
  if (typeof code !== "string") return false;
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

// Generate a random code (6-8 chars); default to 7 for balance
function genCode(len = 7) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

module.exports = { isValidUrl, isValidCode, genCode };
