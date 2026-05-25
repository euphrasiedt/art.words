export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });
  try {
    const safeQ = q.replace(/"/g, '').replace(/\\/g, '');
    const sparql = `
      SELECT DISTINCT ?item ?title ?image ?creator ?date ?collection ?itemUrl WHERE {
        ?item wdt:P31/wdt:P279* ?type .
        VALUES ?type {
          wd:Q3305213
          wd:Q860861
          wd:Q219423
          wd:Q184741
          wd:Q20010573
          wd:Q11835431
          wd:Q570116
          wd:Q429785
          wd:Q46686
          wd:Q210272
          wd:Q245117
          wd:Q2066186
        }
        ?item rdfs:label ?title .
        FILTER(LANG(?title) = "en")
        FILTER(CONTAINS(LCASE(?title), LCASE("${safeQ}")))
        ?item wdt:P18 ?image .
        FILTER(STRSTARTS(STR(?image), "http://commons.wikimedia.org/"))
        OPTIONAL {
          ?item wdt:P170 ?creatorItem .
          ?creatorItem rdfs:label ?creator .
          FILTER(LANG(?creator) = "en")
        }
        OPTIONAL {
          ?item wdt:P571|wdt:P577 ?dateRaw .
          BIND(SUBSTR(STR(?dateRaw),1,4) AS ?date)
        }
        OPTIONAL {
          ?item wdt:P195 ?collectionItem .
          ?collectionItem rdfs:label ?collection .
          FILTER(LANG(?collection) = "en")
        }
        BIND(URI(CONCAT("https://www.wikidata.org/wiki/", SUBSTR(STR(?item),32))) AS ?itemUrl)
      }
      LIMIT 15
    `;
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`;
    const data = await fetch(url, {
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'WordToArt/1.0 (https://github.com)'
      }
    }).then(r => r.json());
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
