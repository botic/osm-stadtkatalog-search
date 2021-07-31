import got from "got";
import {
	searchAround,
	searchFulltext,
} from "@stadtkatalog/stadtkatalog";

const OVPA_ENDPOINT = "https://overpass-api.de/api/interpreter?data=";
const query = `[out:json]
[bbox:48.2185, 16.4917, 48.2354, 16.5160];
node
  ["name"]
  [!"highway"]
  [!"railway"]
  [!"public_transport"];
out;`;

const {elements} = await got(`${OVPA_ENDPOINT}${encodeURIComponent(query)}`).json();

for (const element of elements.filter(e => e.tags?.name?.length > 0)) {
	// look for existing entries in the 📖StadtKatalog
	const {lat, lon, tags, id} = element;
	const areaResults = await searchAround(lon, lat, 50, "m", tags.name);
	if (areaResults.totalHits === 0) {
		console.log(`## ${tags.name}`);
		console.log(`[Node #${id}](https://www.openstreetmap.org/node/${id})\n`);
		const fulltextResults = await searchFulltext(tags.name, "relevance", "desc", 10, 0, "seestadt");
		if (fulltextResults.totalHits === 0) {
			console.log(Object.keys(tags).map(k => ` * ${k} – ${tags[k]}`).join("\n"));
		} else {
			console.log(
				fulltextResults.hits.map(hit => ` * ${hit.data.name} - [StadtKatalog #${hit.id}](https://www.stadtkatalog.org/entry/${hit.id})`).join("\n")
			);
		}
		console.log("\n\n---\n\n");
	}
}