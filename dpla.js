export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });
  try {
    const url = `https://api.dp.la/v2/items?q=${encodeURIComponent(q)}&sourceResource.type=image&page_size=15&api_key=${process.env.DPLA_KEY}`;
    const data = await fetch(url).then(r => r.json());
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
