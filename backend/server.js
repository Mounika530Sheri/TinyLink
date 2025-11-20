// backend/server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const compression = require("compression");
const routes = require("./routes");

const app = express();

// Basic security headers + CSP (tight but permissive enough for this app)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"]
    }
  }
}));

app.use(compression());
app.use(express.json());

// Serve the frontend/public directory (relative to project root)
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Use routes for API and dynamic pages
app.use("/", routes);

// Fallback: if no route matched, send index (SPA-style)
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "../frontend/views/index.html");
  // inject BASE_URL into the served HTML (simple string replace)
  let html = fs.readFileSync(indexPath, "utf8");
  const BASE_URL = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  html = html.replace(/{{BASE_URL_PLACEHOLDER}}/g, BASE_URL);
  res.send(html);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TinyLink running on port ${PORT}`);
});
