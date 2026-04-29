export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, name, text } = req.body || {};
  if (!slug || !text) {
    return res.status(400).json({ error: 'slug and text are required' });
  }

  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token || !chatId) {
    return res.status(500).json({ error: 'TG_BOT_TOKEN/TG_CHAT_ID are not configured' });
  }

  const msg = [
    '💬 Новый комментарий к статье',
    `Slug: ${slug}`,
    `Имя: ${name || 'Гость'}`,
    `Комментарий: ${text}`
  ].join('\n');

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg })
    });
    const data = await r.json();
    if (!data.ok) {
      return res.status(500).json({ error: 'Telegram API error' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
