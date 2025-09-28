// PRODUCTION-QUALITY VERCEL SERVERLESS FUNCTION — /api/claim.js
// Requires: npm install @vercel/kv
import { kv } from "@vercel/kv";

// Validate Roblox username (3-20 chars, alphanumeric and _)
function validUsername(username) {
  return typeof username === "string" && /^[a-zA-Z0-9_]{3,20}$/.test(username.trim());
}

// Validate item name (2-50 chars)
function validItem(item) {
  return typeof item === "string" && item.length >= 2 && item.length <= 50;
}

/*
  POST /api/claim
    Body: { username, item }
    Adds claim for user (multiple claims allowed)
    Returns: { success, message, count }

  GET /api/claim?username=NAME
    Returns next unredeemed claim: { success, item, count } or { success: false }
    Also removes claim (one-time)
*/

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { username, item } = req.body || {};
      if (!validUsername(username)) {
        return res.status(400).json({ success: false, message: "Invalid Roblox username." });
      }
      if (!validItem(item)) {
        return res.status(400).json({ success: false, message: "Invalid item." });
      }
      const uname = username.trim().toLowerCase();
      await kv.rpush(`claims:${uname}`, item);
      const count = await kv.llen(`claims:${uname}`);
      return res.status(200).json({ success: true, message: "Claim added!", count });
    } else if (req.method === "GET") {
      const username = (req.query.username || "").trim();
      if (!validUsername(username)) {
        return res.status(400).json({ success: false, message: "Invalid Roblox username." });
      }
      const uname = username.toLowerCase();
      const item = await kv.lpop(`claims:${uname}`);
      const count = await kv.llen(`claims:${uname}`);
      if (item) {
        return res.status(200).json({ success: true, item, count });
      } else {
        return res.status(404).json({ success: false, message: "No claim found." });
      }
    } else {
      res.setHeader("Allow", "POST, GET");
      return res.status(405).json({ success: false, message: "Method not allowed." });
    }
  } catch (e) {
    console.error("Claim API error:", e);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}
