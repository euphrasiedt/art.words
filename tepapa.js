export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });
  try {
    const url = `https://data.tepapa.govt.nz/collection/search?q=${encodeURIComponent(q)}&type=object&size=15`;
    const data = await fetch(url, {
      headers: {
        'x-api-key': process.env.TEPAPA_KEY,
        'Accept': 'application/json',
      }
    }).then(r => r.json());
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
