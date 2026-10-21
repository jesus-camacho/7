/**
 * Genera `src/data/mapa.ts`: los contornos de los países del mundo como
 * polilíneas de lon/lat, para dibujar una delimitación geográfica mínima
 * sobre el globo.
 *
 * Usa `mesh`, que devuelve cada frontera una sola vez (las compartidas no
 * se duplican), y recorta la precisión: a esta escala el trazo es casi
 * imperceptible, así que décimas de grado sobran.
 *
 *   npm install --no-save world-atlas topojson-client
 *   node scripts/generar_mapa.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { mesh } from "topojson-client";

const require = createRequire(import.meta.url);
const topologia = require("world-atlas/countries-110m.json");

const DECIMALES = 1;
const red = (n) => Math.round(n * 10 ** DECIMALES) / 10 ** DECIMALES;

const geo = mesh(topologia, topologia.objects.countries);

const contornos = [];
for (const linea of geo.coordinates) {
  const plano = [];
  let ultLon = null;
  let ultLat = null;
  for (const [lon, lat] of linea) {
    const a = red(lon);
    const b = red(lat);
    if (a === ultLon && b === ultLat) continue; // punto repetido tras redondear
    plano.push(a, b);
    ultLon = a;
    ultLat = b;
  }
  if (plano.length >= 8) contornos.push(plano); // al menos 4 puntos
}

const puntos = contornos.reduce((n, c) => n + c.length / 2, 0);
const salida = `// Generado por scripts/generar_mapa.mjs a partir de world-atlas
// (Natural Earth, dominio público). No editar a mano.
//
// Cada entrada es una polilínea de fronteras: [lon, lat, lon, lat, ...].

export const contornos: number[][] = ${JSON.stringify(contornos)};
`;
writeFileSync("src/data/mapa.ts", salida);
console.log(`${contornos.length} polilíneas, ${puntos} puntos, ${(salida.length / 1024).toFixed(0)} KB`);
