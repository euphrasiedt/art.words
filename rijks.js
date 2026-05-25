export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });
  try {
    const url = `https://www.rijksmuseum.nl/api/en/collection?q=${encodeURIComponent(q)}&imgonly=True&ps=15&key=${process.env.RIJKS_KEY}`;
    const data = await fetch(url).then(r => r.json());
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
