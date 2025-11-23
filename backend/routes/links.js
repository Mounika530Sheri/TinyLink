const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST /api/links
router.post("/", async (req, res) => {
  const { url, code } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    const existing = await pool.query("SELECT * FROM links WHERE code=$1", [code]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "Code exists" });

    // include created_at if your table has it
    const result = await pool.query(
      "INSERT INTO links (url, code, clicks, last_clicked, created_at) VALUES ($1,$2,0,null,NOW()) RETURNING *",
      [url, code]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting link:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/links
router.get("/", async (req, res) => {
  try {
    // if created_at exists, order by it; otherwise order by code
    const result = await pool.query("SELECT * FROM links ORDER BY created_at DESC NULLS LAST, code ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching links:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/links/:code
router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const result = await pool.query("SELECT * FROM links WHERE code=$1", [code]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching link:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/links/:code
router.delete("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    await pool.query("DELETE FROM links WHERE code=$1", [code]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting link:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
