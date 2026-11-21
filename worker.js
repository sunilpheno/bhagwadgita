import { onRequestPost as login } from "./functions/api/login.js";
import { onRequestGet as content } from "./functions/api/content.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/login") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
      return login({ request, env });
    }
    if (url.pathname === "/api/content") {
      if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
      return content({ request, env });
    }
    // बाकी सब: public/ फ़ोल्डर की फ़ाइलें (वेबसाइट)
    return env.ASSETS.fetch(request);
  }
};
