export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });
  try {
    const url = `https://collection-publicapi.aucklandmuseum.com/api/v3/opacobjects?query=${encodeURIComponent(q)}&view=label&size=20`;
    const r = await fetch(url);
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
