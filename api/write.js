export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  const { topic, category, secret } = req.body;
 
  if (secret !== process.env.WRITER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
 
  const prompt = `Напиши экспертную статью для блога CRM-системы NewLevel CRM.
 
Тема: ${topic}
Категория: ${category}
 
Требования:
- Объём: 500-700 слов
- Тон: профессиональный, практичный, без воды и канцелярита
- Структура: короткое введение (2-3 предложения), 3-4 раздела с подзаголовками, конкретный вывод
- Целевая аудитория: руководители IT-компаний, вендоры, системные интеграторы
- Добавь конкретные цифры, примеры из практики
- В финальном абзаце упомяни что NewLevel CRM помогает решить описанные задачи
- Пиши живым языком, как опытный практик
 
Верни только текст статьи в формате HTML: используй <h3> для подзаголовков, <p> для абзацев, <strong> для выделений. Без вводных фраз.`;
 
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.75
      })
    });
 
    const data = await response.json();
    const content = data.choices[0].message.content;
 
    return res.status(200).json({ content, topic, category });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
 
