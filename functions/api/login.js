import { signToken, safeEqual, json } from "../../data/auth.js";

// POST /api/login  { mobile, code }
export async function onRequestPost({ request, env }) {
  if (!env.USERS || !env.SESSION_SECRET) {
    return json({ error: "सेटअप अधूरा है: KV (USERS) और SESSION_SECRET जोड़ें।" }, 500);
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: "गलत अनुरोध।" }, 400); }

  const mobile = String(body.mobile || "").replace(/\D/g, "").slice(-10);
  const code = String(body.code || "").trim().toUpperCase();
  if (mobile.length !== 10 || !code) {
    return json({ error: "10 अंकों का मोबाइल नंबर और एक्सेस कोड डालें।" }, 400);
  }

  const raw = await env.USERS.get(mobile);
  const user = raw ? JSON.parse(raw) : null;
  // नंबर और कोड, दोनों में से कोई गलत हो तो एक ही संदेश (जानकारी लीक न हो)
  if (!user || !safeEqual(String(user.code).toUpperCase(), code)) {
    return json({ error: "नंबर या एक्सेस कोड सही नहीं है।" }, 401);
  }

  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 दिन
  const token = await signToken({ m: mobile, exp }, env.SESSION_SECRET);
  return json({ token, name: user.name || "" });
}
