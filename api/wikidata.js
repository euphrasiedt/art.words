export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  // Clean up the query string to keep it safe for the SPARQL database
  const safeQ = q.replace(/"/g, '').replace(/\\/g, '');

  // This is the highly targeted query that looks ONLY for artworks/paintings
  const sparql = `
    SELECT DISTINCT ?item ?title ?image ?creator ?date ?collection ?itemUrl WHERE {
      ?item wdt:P31/wdt:P279* ?type .
      VALUES ?type {
        wd:Q3305213  # painting
        wd:Q860861   # sculpture
        wd:Q219423   # drawing
        wd:Q184741   # print
        wd:Q570116   # tourist attraction / historical site art
        wd:Q429785   # artifact
        wd:Q245117   # tapestry
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

  try {
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`;
    
    // We fetch the data from our serverless code, injecting the required User-Agent header
    const response = await fetch(url, {
      headers: { 
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'WordToArtApp/1.0 (contact: your-email-or-placeholder@example.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Wikidata responded with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
