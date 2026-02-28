const CORS_PROXY = 'https://api.allorigins.win/get?url=';

const CATEGORY_QUERIES = {
  Sleep: 'sleep+health+science+tips',
  Fitness: 'fitness+workout+exercise+training',
  Finance: 'personal+finance+investing+markets',
  Music: 'music+industry+new+album+releases',
  Vocals: 'singing+vocal+training+voice',
  Recruitment: 'job+market+hiring+career+recruitment',
  Tech: 'technology+AI+software+programming',
};

function stripHtml(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').trim();
}

function parseRSS(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  const items = doc.querySelectorAll('item');

  return Array.from(items).map(item => ({
    title: item.querySelector('title')?.textContent?.trim() || '',
    link: item.querySelector('link')?.textContent?.trim() || '',
    description: stripHtml(item.querySelector('description')?.textContent || ''),
    pubDate: item.querySelector('pubDate')?.textContent || '',
    source: item.querySelector('source')?.textContent?.trim() || 'News',
  }));
}

async function fetchCategory(category) {
  const query = CATEGORY_QUERIES[category];
  if (!query) return [];

  const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(rssUrl)}`;

  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

  const data = await res.json();
  if (!data.contents) throw new Error('Empty response');

  return parseRSS(data.contents);
}

export async function fetchAllNews() {
  const categories = Object.keys(CATEGORY_QUERIES);
  const results = await Promise.allSettled(
    categories.map(cat => fetchCategory(cat))
  );

  const articles = [];

  results.forEach((result, i) => {
    if (result.status !== 'fulfilled') return;

    result.value.slice(0, 4).forEach((item, j) => {
      if (!item.title) return;

      const readingTime = Math.max(2, Math.ceil(item.description.length / 800));

      articles.push({
        id: `${categories[i]}-${j}-${Date.now()}`,
        title: item.title,
        summary: item.description || `Latest ${categories[i].toLowerCase()} news from ${item.source}.`,
        content: null,
        category: categories[i],
        tags: [categories[i].toLowerCase(), item.source.toLowerCase().split(' ')[0]],
        source: item.source,
        readingTime,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        url: item.link,
        featured: j === 0,
      });
    });
  });

  // Shuffle so categories are interleaved
  for (let k = articles.length - 1; k > 0; k--) {
    const r = Math.floor(Math.random() * (k + 1));
    [articles[k], articles[r]] = [articles[r], articles[k]];
  }

  // Keep first featured articles from each category at top
  const featured = articles.filter(a => a.featured);
  const rest = articles.filter(a => !a.featured);

  return [...featured, ...rest];
}
