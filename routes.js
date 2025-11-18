const express = require("express");
const path = require("path");
const pool = require("./db");
const { isValidUrl, isValidCode, genCode } = require("./validators");

const router = express.Router();

// Healthcheck
router.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
});

// Dashboard page
router.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Stats page
router.get("/code/:code", (_req, res) => {
  res.sendFile(path.join(__dirname, "views", "stats.html"));
});

// Create link
router.post("/api/links", async (req, res) => {
  let { url, code } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid or missing URL" });
  }

  if (code && !isValidCode(code)) {
    return res.status(400).json({ error: "Code must match [A-Za-z0-9]{6,8}" });
  }

  try {
    // If code not provided, generate a unique one
    if (!code) {
      // Try up to 5 times to avoid collision
      for (let i = 0; i < 5; i++) {
        const candidate = genCode(7);
        const exists = await pool.query("SELECT 1 FROM links WHERE code=$1", [candidate]);
        if (exists.rowCount === 0) {
          code = candidate;
          break;
        }
      }
      if (!code) {
        return res.status(500).json({ error: "Failed to generate code" });
      }
    }

    // Enforce global uniqueness for custom codes
    const existing = await pool.query("SELECT 1 FROM links WHERE code=$1", [code]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: "Code already exists" });
    }

    const result = await pool.query(
      `INSERT INTO links (code, url, clicks, last_clicked)
       VALUES ($1, $2, 0, NULL)
       RETURNING id, code, url, clicks, last_clicked, created_at`,
      [code, url]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// List all links
router.get("/api/links", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, code, url, clicks, last_clicked, created_at FROM links ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Stats for one code
router.get("/api/links/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, code, url, clicks, last_clicked, created_at FROM links WHERE code=$1",
      [code]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete link
router.delete("/api/links/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query("DELETE FROM links WHERE code=$1", [code]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Redirect
router.get("/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query("SELECT url FROM links WHERE code=$1", [code]);
    if (result.rowCount === 0) return res.status(404).send("Not found");
    const target = result.rows[0].url;

    await pool.query(
      "UPDATE links SET clicks=clicks+1, last_clicked=NOW() WHERE code=$1",
      [code]
    );

    res.redirect(302, target);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
