export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });
  try {
    const query = `{
      object(general: ${JSON.stringify(q)}, hasImages: true, per_page: 20) {
        id
        summary { title }
        date
        culture
        maker { summary { title } }
        multimedia { preview { url } }
      }
    }`;
    const r = await fetch('https://api.cooperhewitt.org/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
