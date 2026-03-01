/* eslint-disable no-magic-numbers */
/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} Rect
 * @property {number} minX
 * @property {number} minY
 * @property {number} maxX
 * @property {number} maxY
 */

const EPSILON = 1e-9;

/**
 * Le choix technique principal ici est une construction "par demi-plans" :
 * pour chaque site A, on part du rectangle englobant puis on coupe le polygone
 * par les médiatrices vis-à-vis des autres sites.
 *
 * Pourquoi ce choix :
 * - beaucoup plus robuste à implémenter proprement en JS vanilla qu'un Fortune complet ;
 * - précis géométriquement (pas une approximation en grille) ;
 * - plus facile à tester unitairement (fonction pure + clipping déterministe).
 *
 * Complexité O(n² * k), acceptable pour un contexte SAE avec quelques centaines de points.
 */
class VoronoiEngine {
  /**
   * @param {Point[]} points
   * @param {Rect} bounds
   * @returns {{cells: Array<{site: Point, polygon: Point[]}>}}
   */
  static compute(points, bounds) {
    const uniquePoints = VoronoiEngine.#dedupe(points);
    const cells = uniquePoints.map((site) => ({
      site,
      polygon: VoronoiEngine.#computeCellPolygon(site, uniquePoints, bounds)
    }));
    return { cells };
  }

  /**
   * On supprime les doublons pour éviter des médiatrices dégénérées.
   * @param {Point[]} points
   * @returns {Point[]}
   */
  static #dedupe(points) {
    const seen = new Set();
    /** @type {Point[]} */
    const deduped = [];
    for (const p of points) {
      const key = `${p.x.toFixed(12)}:${p.y.toFixed(12)}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push({ x: p.x, y: p.y });
      }
    }
    return deduped;
  }

  /**
   * @param {Point} site
   * @param {Point[]} points
   * @param {Rect} bounds
   * @returns {Point[]}
   */
  static #computeCellPolygon(site, points, bounds) {
    let polygon = [
      { x: bounds.minX, y: bounds.minY },
      { x: bounds.maxX, y: bounds.minY },
      { x: bounds.maxX, y: bounds.maxY },
      { x: bounds.minX, y: bounds.maxY }
    ];

    for (const other of points) {
      if (other === site) {
        continue;
      }
      polygon = VoronoiEngine.#clipByBisectorHalfPlane(polygon, site, other);
      if (polygon.length === 0) {
        break;
      }
    }
    return polygon;
  }

  /**
   * Garde le demi-plan des points plus proches de `siteA` que de `siteB`.
   * Inégalité développée :
   * 2(B-A).P <= |B|² - |A|²
   *
   * @param {Point[]} polygon
   * @param {Point} siteA
   * @param {Point} siteB
   * @returns {Point[]}
   */
  static #clipByBisectorHalfPlane(polygon, siteA, siteB) {
    const a = 2 * (siteB.x - siteA.x);
    const b = 2 * (siteB.y - siteA.y);
    const c = siteB.x * siteB.x + siteB.y * siteB.y - (siteA.x * siteA.x + siteA.y * siteA.y);

    /**
     * @param {Point} p
     * @returns {number}
     */
    const evalLine = (p) => a * p.x + b * p.y - c;

    /**
     * @param {Point} p
     * @returns {boolean}
     */
    const isInside = (p) => evalLine(p) <= EPSILON;

    /** @type {Point[]} */
    const output = [];
    for (let i = 0; i < polygon.length; i += 1) {
      const current = polygon[i];
      const next = polygon[(i + 1) % polygon.length];
      const currentInside = isInside(current);
      const nextInside = isInside(next);

      if (currentInside && nextInside) {
        output.push(next);
      } else if (currentInside && !nextInside) {
        const intersection = VoronoiEngine.#lineSegmentIntersectionWithHalfPlane(current, next, evalLine);
        if (intersection) {
          output.push(intersection);
        }
      } else if (!currentInside && nextInside) {
        const intersection = VoronoiEngine.#lineSegmentIntersectionWithHalfPlane(current, next, evalLine);
        if (intersection) {
          output.push(intersection);
        }
        output.push(next);
      }
    }
    return VoronoiEngine.#sanitizePolygon(output);
  }

  /**
   * @param {Point} p1
   * @param {Point} p2
   * @param {(p: Point) => number} evalLine
   * @returns {Point|null}
   */
  static #lineSegmentIntersectionWithHalfPlane(p1, p2, evalLine) {
    const v1 = evalLine(p1);
    const v2 = evalLine(p2);
    const denom = v1 - v2;
    if (Math.abs(denom) < EPSILON) {
      return null;
    }
    const t = v1 / denom;
    if (t < -EPSILON || t > 1 + EPSILON) {
      return null;
    }
    return {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y)
    };
  }

  /**
   * Nettoie les points presque identiques, utile après clipping successif.
   * @param {Point[]} polygon
   * @returns {Point[]}
   */
  static #sanitizePolygon(polygon) {
    if (polygon.length === 0) {
      return polygon;
    }
    /** @type {Point[]} */
    const cleaned = [polygon[0]];
    for (let i = 1; i < polygon.length; i += 1) {
      const prev = cleaned[cleaned.length - 1];
      const cur = polygon[i];
      if (Math.hypot(prev.x - cur.x, prev.y - cur.y) > 1e-7) {
        cleaned.push(cur);
      }
    }
    if (cleaned.length > 1) {
      const first = cleaned[0];
      const last = cleaned[cleaned.length - 1];
      if (Math.hypot(first.x - last.x, first.y - last.y) <= 1e-7) {
        cleaned.pop();
      }
    }
    return cleaned;
  }
}

/**
 * Parse un contenu texte au format "x,y" par ligne.
 * Retourne aussi des erreurs de validation pour feedback utilisateur précis.
 *
 * @param {string} text
 * @returns {{points: Point[], errors: string[]}}
 */
function parsePointsFromText(text) {
  const lines = text.split(/\r?\n/);
  /** @type {Point[]} */
  const points = [];
  /** @type {string[]} */
  const errors = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      return;
    }

    const chunks = trimmed.split(",");
    if (chunks.length !== 2) {
      errors.push(`Ligne ${lineNumber}: format invalide, attendu "x,y".`);
      return;
    }

    const x = Number(chunks[0].trim());
    const y = Number(chunks[1].trim());
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      errors.push(`Ligne ${lineNumber}: coordonnées non numériques.`);
      return;
    }
    points.push({ x, y });
  });

  if (points.length === 0) {
    errors.push("Aucun point valide trouvé dans le fichier.");
  }
  return { points, errors };
}

/**
 * Calcule un rectangle de viewport avec marge pour auto-scaling.
 * @param {Point[]} points
 * @returns {Rect}
 */
function computeBoundsFromPoints(points) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const dx = Math.max(maxX - minX, 1);
  const dy = Math.max(maxY - minY, 1);
  const marginX = dx * 0.2;
  const marginY = dy * 0.2;

  return {
    minX: minX - marginX,
    minY: minY - marginY,
    maxX: maxX + marginX,
    maxY: maxY + marginY
  };
}

if (typeof window !== "undefined") {
  window.VoronoiEngine = VoronoiEngine;
  window.parsePointsFromText = parsePointsFromText;
  window.computeBoundsFromPoints = computeBoundsFromPoints;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    VoronoiEngine,
    parsePointsFromText,
    computeBoundsFromPoints
  };
}
