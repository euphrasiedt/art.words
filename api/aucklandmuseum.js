export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  const BASE = 'https://collection-publicapi.aucklandmuseum.com/api/v3';

  try {
    // Step 1: search — returns opacObjects[].opacObjectId only
    const searchUrl = `${BASE}/opacobjects?query=${encodeURIComponent(q)}&view=label&facet=has_images%3AYes&limit=6`;
    const searchData = await fetch(searchUrl).then(r => r.json());

    const ids = (searchData?.opacObjects ?? []).map(o => o.opacObjectId).filter(Boolean);
    if (!ids.length) return res.json({ results: [] });

    // Step 2: fetch all detail records in parallel with a 5s hard timeout
    const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

    const detailed = await Promise.all(
      ids.map(id =>
        Promise.race([
          fetch(`${BASE}/opacobjects/${id}?view=label&facet=imageID`).then(r => r.json()),
          timeout(5000)
        ]).catch(() => null)
      )
    );

    res.json({ results: detailed.filter(Boolean) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
