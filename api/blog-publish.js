function slugify(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'article';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const {
    secret,
    title,
    excerpt,
    content,
    seo_title,
    seo_description
  } = req.body || {};

  if (secret !== process.env.BLOG_EDITOR_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const slug = slugify(title);
  const payload = {
    title,
    slug,
    status: 'published',
    excerpt: excerpt || '',
    content,
    is_featured: true,
    robots: 'index,follow',
    seo_title: (seo_title || title).slice(0, 70),
    seo_description: (seo_description || excerpt || '').slice(0, 180),
    published_at: new Date().toISOString()
  };

  try {
    const pbUrl = (process.env.PB_URL || 'https://cms-api.nwlvl.ru').replace(/\/$/, '');
    const collection = process.env.PB_COLLECTION || 'site_articles';
    const adminToken = process.env.PB_STATIC_TOKEN || '';
    const r = await fetch(`${pbUrl}/api/collections/${collection}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
      },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      const text = await r.text();
      return res.status(500).json({ error: `CMS error: ${r.status} ${text}` });
    }
    return res.status(200).json({ ok: true, slug });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
