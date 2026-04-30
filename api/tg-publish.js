export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const secret = process.env.TG_RELAY_SECRET || "";
    if (!secret || body.secret !== secret) {
      return res.status(403).json({ ok: false, error: "forbidden" });
    }

    const token = body.botToken || process.env.BOT_TOKEN || "";
    if (!token) return res.status(400).json({ ok: false, error: "missing_token" });

    const method = body.method || "sendMessage";
    const payload = body.payload || {};
    const tgUrl = `https://api.telegram.org/bot${token}/${method}`;

    const tgResp = await fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await tgResp.json();
    return res.status(tgResp.ok ? 200 : tgResp.status).json(data);
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}

