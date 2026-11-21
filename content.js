import { verifyToken, json } from "../../data/auth.js";
import { QUOTES, CATEGORIES } from "../../data/content.js";

// GET /api/content  (Header: Authorization: Bearer <token>)
export async function onRequestGet({ request, env }) {
  if (!env.USERS || !env.SESSION_SECRET) {
    return json({ error: "सेटअप अधूरा है।" }, 500);
  }
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = await verifyToken(token, env.SESSION_SECRET);
  if (!payload) return json({ error: "सत्र समाप्त। कृपया दोबारा लॉगिन करें।" }, 401);

  // उपयोगकर्ता अब भी मौजूद है? (KV से हटाने पर पहुँच तुरंत बंद)
  const raw = await env.USERS.get(payload.m);
  if (!raw) return json({ error: "पहुँच उपलब्ध नहीं है।" }, 401);
  const user = JSON.parse(raw);

  // भारतीय समय (IST) के हिसाब से साल का दिन
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const start = Date.UTC(ist.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - start) / 86400000);
  const quote = QUOTES[(dayOfYear - 1) % QUOTES.length];

  return json({ name: user.name || "", quote, categories: CATEGORIES });
}
