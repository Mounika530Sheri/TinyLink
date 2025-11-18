const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const routes = require("./routes");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", routes);

// Serve views folder statically if needed
app.use("/views", express.static(path.join(__dirname, "views")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TinyLink running on port ${PORT}`);
});
