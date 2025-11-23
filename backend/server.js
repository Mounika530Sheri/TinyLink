const express = require("express");
const cors = require("cors");
const pool = require("./db");
const linksRouter = require("./routes/links");

const app = express();
app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/healthz", (req, res) => {
  res.json({ ok: true, version: "1.0" });
});

// Redirect + update clicks
app.get("/:code", async (req, res) => {
  const { code } = req.params;
  try {
    // Update clicks and get the updated row in one query
    const result = await pool.query(
      "UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code = $1 RETURNING *",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Not found");
    }

    const link = result.rows[0];
    // Redirect to the long URL
    res.redirect(302, link.url);
  } catch (err) {
    console.error("Error updating clicks:", err.message);
    res.status(500).send("Server error");
  }
});

// API routes
app.use("/api/links", linksRouter);

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
