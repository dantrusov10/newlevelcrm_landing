export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const secret = process.env.TG_RELAY_SECRET || "newlevel_tg_relay_2026";
    if (!secret || body.secret !== secret) {
      return res.status(403).json({ ok: false, error: "forbidden" });
    }

    const token = body.botToken || process.env.BOT_TOKEN || "";
    if (!token) return res.status(400).json({ ok: false, error: "missing_token" });

    const method = body.method || "sendMessage";
    const payload = body.payload || {};

    if (method === "sendPhotoByUrl" || method === "sendPhotoBase64") {
      const imageUrl = payload.image_url;
      const imageBase64 = payload.image_base64;
      if (!imageUrl && !imageBase64) {
        return res.status(400).json({ ok: false, error: "missing_image_payload" });
      }
      let imgBlob;
      if (method === "sendPhotoByUrl") {
        const imgResp = await fetch(imageUrl);
        if (!imgResp.ok) {
          return res.status(400).json({ ok: false, error: "image_fetch_failed", status: imgResp.status });
        }
        imgBlob = await imgResp.blob();
      } else {
        const clean = String(imageBase64).replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
        const bytes = Uint8Array.from(Buffer.from(clean, "base64"));
        imgBlob = new Blob([bytes], { type: "image/png" });
      }

      const form = new FormData();
      form.append("chat_id", String(payload.chat_id || ""));
      form.append("photo", imgBlob, "image.png");
      if (payload.caption) form.append("caption", String(payload.caption));
      if (payload.parse_mode) form.append("parse_mode", String(payload.parse_mode));
      if (payload.reply_markup) form.append("reply_markup", JSON.stringify(payload.reply_markup));

      const tgUrl = `https://api.telegram.org/bot${token}/sendPhoto`;
      const tgResp = await fetch(tgUrl, { method: "POST", body: form });
      const data = await tgResp.json();
      return res.status(tgResp.ok ? 200 : tgResp.status).json(data);
    }

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

