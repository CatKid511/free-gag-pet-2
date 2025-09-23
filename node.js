let claims = {}; // (should use persistent DB in production!)

export default async function handler(req, res) {
  if (req.method === "POST") {
    let { username, item } = req.body;
    if (!username || !item) return res.status(400).json({ success: false });
    username = username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return res.status(400).json({ success: false });
    if (claims[username]) return res.status(400).json({ success: false, message: "Already claimed" });
    claims[username] = { item, time: Date.now() };
    return res.status(200).json({ success: true });
  } else if (req.method === "GET") {
    // GET /api/claim?username=NAME
    let username = (req.query.username || "").trim();
    if (!username) return res.status(400).json({ success: false });
    if (claims[username]) {
      return res.status(200).json({
        success: true,
        item: claims[username].item
      });
    } else {
      return res.status(404).json({ success: false });
    }
  } else {
    res.status(405).json({ success: false });
  }
}
