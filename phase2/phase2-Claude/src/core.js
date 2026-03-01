/**
 * voronoi-app / src/core.js
 * ─────────────────────────────────────────────────────────────────
 * Modules métier purs — sans dépendance DOM.
 * Exportés en ES modules pour être utilisés par :
 *   - script.js   (browser, via import)
 *   - core.test.js (Vitest / Node)
 * ─────────────────────────────────────────────────────────────────
 */

/* ═══════════════════════════════════════════════════════════════════
   PARSER
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Vérifie si une ligne représente un couple (x, y) valide.
 * Accepte entiers et flottants, espaces libres, séparateur virgule.
 * @param {string} line
 * @returns {{ x: number, y: number } | null | undefined}
 *   null      → ligne vide (ignorée)
 *   undefined → ligne malformée (erreur)
 *   object    → point valide
 */
export function parseLine(line) {
  const trimmed = line.trim();
  if (trimmed === '') return null;

  const parts = trimmed.split(',');
  if (parts.length !== 2) return undefined;

  const x = parseFloat(parts[0].trim());
  const y = parseFloat(parts[1].trim());

  if (isNaN(x) || isNaN(y)) return undefined;

  return { x, y };
}

/**
 * Parse le contenu complet d'un fichier .txt.
 * @param {string} content
 * @returns {{ points: Array<{x:number,y:number}>, errors: Array<{line:number,raw:string}> }}
 */
export function parseContent(content) {
  const lines  = content.split('\n');
  const points = [];
  const errors = [];

  lines.forEach((raw, index) => {
    const result = parseLine(raw);
    if (result === null)      return;
    if (result === undefined) errors.push({ line: index + 1, raw: raw.trim() });
    else                      points.push(result);
  });

  return { points, errors };
}

/** Namespace groupé (compatibilité browser) */
export const Parser = { parseLine, parseContent };


/* ═══════════════════════════════════════════════════════════════════
   COLOR MAPPER
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Génère n couleurs distinctes en HSL réparties sur le cercle chromatique.
 * @param {number} count
 * @returns {Array<{r:number, g:number, b:number}>}
 */
export function generateColors(count) {
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * 360 / count + 47) % 360;
    return hslToRgb(hue, 72, 52);
  });
}

/** Conversion HSL → RGB (valeurs 0–255). */
export function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

/** Namespace groupé (compatibilité browser) */
export const ColorMapper = { generate: generateColors };


/* ═══════════════════════════════════════════════════════════════════
   VORONOI ALGORITHM
   ═══════════════════════════════════════════════════════════════════ */

/**
 * Pour chaque pixel du canvas, trouve le point source le plus proche
 * (distance euclidienne au carré) et retourne son index.
 *
 * @param {Array<{x:number, y:number}>} points  — coordonnées dans [0,W]×[0,H]
 * @param {number} width
 * @param {number} height
 * @returns {Int32Array}  — tableau [width*height] d'indices de points
 */
export function computeVoronoi(points, width, height) {
  const assignment = new Int32Array(width * height);

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      let minDist = Infinity;
      let closest = 0;

      for (let i = 0; i < points.length; i++) {
        const dx   = px - points[i].x;
        const dy   = py - points[i].y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) { minDist = dist; closest = i; }
      }

      assignment[py * width + px] = closest;
    }
  }

  return assignment;
}

/** Namespace groupé (compatibilité browser) */
export const Voronoi = { compute: computeVoronoi };
