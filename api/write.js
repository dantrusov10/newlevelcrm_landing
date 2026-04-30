export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, category, secret } = req.body;

  if (secret !== process.env.WRITER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const system = `Ты — практикующий эксперт NewLevel CRM: российская CRM для B2B IT-продаж (вендоры, системные интеграторы, дистрибьюторы).
Пишешь от лица команды продукта: опыт внедрений, наблюдения по рынку, честные оговорки где нужна осторожность.
Никаких выдуманных «исследований» и фейковых процентов — если цифры, только как ориентиры/диапазоны с формулировкой «часто», «на практике», либо обобщение без конкретного N%.`;

  const user = `Тема статьи: ${topic}
Категория (для контекста): ${category}

Задача: экспертный материал для корпоративного блога nwlvl.ru — показать глубину экспертизы команды NewLevel CRM в продажах, маркетинге и ИИ для IT-бизнеса, плюс усилить SEO за счёт естественного семантического ядра (без спама и перечисления ключей списком).

Стиль и содержание:
- Рассуждай: постановка проблемы → аргументы → контрпозиции/ограничения → практические выводы для РОПа/коммерческого директора IT-компании.
- Конкретика: сценарии воронки, квалификация лидов, длинный цикл B2B, работа с ЛПР, тендеры 44-ФЗ/223-ФЗ, парсинг закупок, account-based подход, контент для лида, внедрение ИИ в процесс (ассистент, суммаризация, КП), риски и комплаенс данных в РФ.
- Упоминай CRM/автоматизацию/данные в РФ органично (1–2 раза в тексте), без рекламного крика: как класс инструментов решает класс задач; в финале — коротко: чем подход NewLevel CRM созвучен описанной логике (без перечисления фич).

SEO (естественно, внутри предложений):
- Вплети синонимы и смежные формулировки: B2B-продажи, IT-продажи, воронка продаж, pipeline, управление сделками, CRM для интеграторов, CRM для вендоров, маркетинг IT-решений, лидогенерация, ABM, тендеры, госзакупки, zakupki, ИИ в продажах, ассистент продавца, автоматизация КП, аналитика воронки.
- Один раз используй точную формулировку «NewLevel CRM» (не в заголовке H-тегов).

Формат HTML (только разметка, без markdown, без преамбулы «вот статья»):
- Один блок <section> в корне.
- <h2> для названия статьи (должен совпадать по смыслу с темой, можно слегка уточнить для SEO).
- Вводный <p> (3–5 предложений).
- 4–6 разделов: каждый с <h3> и 2–4 абзацами <p>; где уместно — <ul><li>…</li></ul> с короткими пунктами.
- Один раздел «Выводы» с <h3> и чёткими тезисами.
- Заверши <p> с мягким CTA: попробовать демо / обсудить процесс — без жёсткого продажа.

Объём по смыслу: примерно 900–1300 слов русского текста (развёрнуто, не сжимай до заметки).`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: 4096,
        temperature: 0.62,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const err = data?.error?.message || data?.message || response.statusText;
      return res.status(502).json({ error: err || 'Groq API error', details: data });
    }
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      return res.status(502).json({ error: 'Empty model response', details: data });
    }

    return res.status(200).json({ content, topic, category });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
