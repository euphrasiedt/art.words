const crypto = require('crypto');

export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const safeQ = q.replace(/"/g, '').replace(/\\/g, '');

  const sparql = `
    SELECT DISTINCT ?title ?image ?creator ?date ?collection ?itemUrl WHERE {
      ?item wdt:P31/wdt:P279* ?type .
      VALUES ?type {
        wd:Q3305213  # painting
        wd:Q860861   # sculpture
        wd:Q219423   # drawing
        wd:Q184741   # print
        wd:Q429785   # artifact
        wd:Q245117   # tapestry
      }
      ?item rdfs:label ?titleRaw .
      FILTER(LANG(?titleRaw) = "en")
      FILTER(CONTAINS(LCASE(?titleRaw), LCASE("${safeQ}")))
      BIND(STR(?titleRaw) AS ?title)

      ?item wdt:P18 ?imageRaw .
      BIND(STR(?imageRaw) AS ?image)

      OPTIONAL {
        ?item wdt:P170 ?creatorItem .
        ?creatorItem rdfs:label ?creatorRaw .
        FILTER(LANG(?creatorRaw) = "en")
        BIND(STR(?creatorRaw) AS ?creator)
      }
      OPTIONAL {
        ?item wdt:P571|wdt:P577 ?dateRaw .
        BIND(SUBSTR(STR(?dateRaw),1,4) AS ?date)
      }
      OPTIONAL {
        ?item wdt:P195 ?collectionItem .
        ?collectionItem rdfs:label ?collectionRaw .
        FILTER(LANG(?collectionRaw) = "en")
        BIND(STR(?collectionRaw) AS ?collection)
      }
      BIND(STR(?item) AS ?itemUrl)
    }
    LIMIT 15
  `;

  try {
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second strict speed cutoff

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'WordToArtApp/1.0 (contact: placeholder@example.com)'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Wikidata error status ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.bindings) {
      data.results.bindings = data.results.bindings.map(o => {
        if (o.image && o.image.value) {
          const rawUrl = o.image.value;
          const prefix = "http://commons.wikimedia.org/wiki/Special:FilePath/";
          let fileName = rawUrl.replace(prefix, "");
          
          if (fileName.includes("Special:FilePath/")) {
            fileName = fileName.split("Special:FilePath/")[1];
          }
          
          fileName = decodeURIComponent(fileName).replace(/ /g, '_');

          if (fileName) {
            const hash = crypto.createHash('md5').update(fileName).digest('hex');
            const a = hash.charAt(0);
            const ab = hash.substring(0, 2);
            
            o.image.value = `https://upload.wikimedia.org/wikipedia/commons/thumb/${a}/${ab}/${encodeURIComponent(fileName)}/400px-${encodeURIComponent(fileName)}`;
          }
        }
        return o;
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({ results: { bindings: [] } });
  }
}
