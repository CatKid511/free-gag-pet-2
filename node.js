const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Now: claims is a list of { username, item, claimed: false }
const claims = [];

app.use(cors());
app.use(bodyParser.json());

// Allow unlimited claims per user
app.post("/claim", (req, res) => {
  const { username, item } = req.body;
  if (!username || !item) return res.status(400).json({ error: "Missing username or item" });

  claims.push({ username, item, claimed: false });
  res.json({ success: true });
});

// Roblox: get next unredeemed claim and mark as claimed
app.post("/redeem", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Missing username" });

  const claim = claims.find(c => c.username === username && !c.claimed);
  if (claim) {
    claim.claimed = true;
    return res.json({ item: claim.item });
  }
  res.json({ item: null });
});

// Admin/debug view
app.get("/claims", (req, res) => {
  res.json(claims);
});

app.listen(PORT, () => {
  console.log(`Claim API running on port ${PORT}`);
});
