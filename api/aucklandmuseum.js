export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  try {
    // Search for objects with images only
    const searchUrl = `https://collection-publicapi.aucklandmuseum.com/api/v3/opacobjects?query=${encodeURIComponent(q)}&view=label&facet=has_images%3AYes&limit=20`;
    const searchData = await fetch(searchUrl).then(r => r.json());

    const records = searchData?.hits?.hits ?? [];
    if (!records.length) return res.json({ results: [] });

    // Fetch image derivatives for each record in parallel (cap at 12 to keep latency low)
    const top = records.slice(0, 12);
    const detailed = await Promise.all(
      top.map(hit => {
        const id = hit._id ?? hit._source?.id;
        if (!id) return null;
        return fetch(
          `https://collection-publicapi.aucklandmuseum.com/api/v3/opacobjects/${id}?view=label&facet=imageID`
        )
          .then(r => r.json())
          .catch(() => null);
      })
    );

    res.json({ results: detailed.filter(Boolean) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
