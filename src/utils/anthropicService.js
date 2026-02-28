const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function generateNews(apiKey, interests = []) {
  const categoriesStr = interests.length > 0
    ? interests.join(', ')
    : 'Sleep, Fitness, Finance, Music, Vocals, Recruitment, Tech';

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: 'You are a personalized news curator. Generate 10 realistic news articles as a JSON array. Each article must have: id (unique string), title, summary (2-3 sentences), category (one of: Sleep, Fitness, Finance, Music, Vocals, Recruitment, Tech), tags (array of 2-3 relevant tags), source (realistic publication name), and publishedAt (ISO 8601 date string within the last 24 hours). Return ONLY valid JSON with no markdown formatting, no code fences, and no extra text.',
      messages: [{
        role: 'user',
        content: `Generate 10 news articles matching these interest categories: ${categoriesStr}.

Return ONLY a valid JSON array with this structure:
[
  {
    "id": "unique-id",
    "title": "Article title",
    "summary": "2-3 sentence summary with practical, useful information",
    "category": "One of: Sleep, Fitness, Finance, Music, Vocals, Recruitment, Tech",
    "tags": ["tag1", "tag2", "tag3"],
    "source": "Realistic source name",
    "publishedAt": "ISO 8601 date string within the last 24 hours",
    "featured": false
  }
]

Make exactly 2-3 articles "featured": true. Make the content factually accurate and practically useful.`
      }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;

  // Parse the JSON from Claude's response
  const articles = JSON.parse(text);

  // Ensure each article has required fields with fallbacks
  return articles.map((article, i) => ({
    ...article,
    id: article.id || `art-${Date.now()}-${i}`,
    publishedAt: article.publishedAt || new Date(Date.now() - i * 3600000).toISOString(),
    url: '#',
  }));
}

export async function getAIInsight(apiKey, prompt) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
