/**
 * voronoi-app / src/core.test.js
 * ─────────────────────────────────────────────────────────────────
 * Suite de tests Vitest pour les modules métier (Parser, ColorMapper, Voronoi).
 * Exécution : npx vitest   ou   npm test
 * ─────────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from 'vitest';
import {
  parseLine,
  parseContent,
  generateColors,
  hslToRgb,
  computeVoronoi,
} from './core.js';


/* ═══════════════════════════════════════════════════════════════════
   PARSER — parseLine
   ═══════════════════════════════════════════════════════════════════ */

describe('parseLine — cas valides', () => {
  it('parse des entiers "3,4"', () => {
    const r = parseLine('3,4');
    expect(r).toEqual({ x: 3, y: 4 });
  });

  it('parse des floats "1.5 , 2.7"', () => {
    const r = parseLine('1.5 , 2.7');
    expect(r).not.toBeNull();
    expect(r.x).toBeCloseTo(1.5);
    expect(r.y).toBeCloseTo(2.7);
  });

  it('tolère les espaces "  10 , 20  "', () => {
    expect(parseLine('  10 , 20  ')).toEqual({ x: 10, y: 20 });
  });

  it('accepte les négatifs "-3,-4.5"', () => {
    const r = parseLine('-3,-4.5');
    expect(r).not.toBeNull();
    expect(r.x).toBe(-3);
    expect(r.y).toBeCloseTo(-4.5);
  });

  it('accepte les zéros "0,0"', () => {
    expect(parseLine('0,0')).toEqual({ x: 0, y: 0 });
  });
});

describe('parseLine — cas invalides', () => {
  it('ligne vide → null', () => {
    expect(parseLine('')).toBeNull();
  });

  it('espaces seuls → null', () => {
    expect(parseLine('   ')).toBeNull();
  });

  it('une seule valeur "5" → undefined', () => {
    expect(parseLine('5')).toBeUndefined();
  });

  it('trois valeurs "1,2,3" → undefined', () => {
    expect(parseLine('1,2,3')).toBeUndefined();
  });

  it('lettres "a,b" → undefined', () => {
    expect(parseLine('a,b')).toBeUndefined();
  });

  it('mixte "1,b" → undefined', () => {
    expect(parseLine('1,b')).toBeUndefined();
  });

  it('texte libre "hello world" → undefined', () => {
    expect(parseLine('hello world')).toBeUndefined();
  });
});


/* ═══════════════════════════════════════════════════════════════════
   PARSER — parseContent
   ═══════════════════════════════════════════════════════════════════ */

describe('parseContent', () => {
  it('ignore les lignes vides et extrait les points valides', () => {
    const { points, errors } = parseContent('1,2\n\n3,4\n  \n5,6');
    expect(points).toHaveLength(3);
    expect(errors).toHaveLength(0);
  });

  it('détecte les lignes invalides comme erreurs', () => {
    const { points, errors } = parseContent('1,2\nabc\n3,4\n5');
    expect(points).toHaveLength(2);
    expect(errors).toHaveLength(2);
  });

  it('fichier entièrement vide → 0 points, 0 erreurs', () => {
    const { points, errors } = parseContent('');
    expect(points).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('rapporte le bon numéro de ligne dans les erreurs', () => {
    const { errors } = parseContent('bad\n1,2');
    expect(errors[0].line).toBe(1);
  });

  it('rapporte le contenu brut de la ligne en erreur', () => {
    const { errors } = parseContent('1,2\nfoo bar');
    expect(errors[0].raw).toBe('foo bar');
  });

  it('extrait les coordonnées correctes du premier point', () => {
    const { points } = parseContent('10,20\n30,40');
    expect(points[0]).toEqual({ x: 10, y: 20 });
    expect(points[1]).toEqual({ x: 30, y: 40 });
  });
});


/* ═══════════════════════════════════════════════════════════════════
   COLOR MAPPER
   ═══════════════════════════════════════════════════════════════════ */

describe('generateColors', () => {
  it('génère exactement n couleurs', () => {
    expect(generateColors(7)).toHaveLength(7);
  });

  it('toutes les valeurs RGB sont dans [0, 255]', () => {
    const cols = generateColors(10);
    for (const c of cols) {
      expect(c.r).toBeGreaterThanOrEqual(0);
      expect(c.r).toBeLessThanOrEqual(255);
      expect(c.g).toBeGreaterThanOrEqual(0);
      expect(c.g).toBeLessThanOrEqual(255);
      expect(c.b).toBeGreaterThanOrEqual(0);
      expect(c.b).toBeLessThanOrEqual(255);
    }
  });

  it('produit des couleurs distinctes pour n ≥ 2', () => {
    const cols = generateColors(4);
    const strs = cols.map(c => `${c.r},${c.g},${c.b}`);
    expect(new Set(strs).size).toBe(4);
  });

  it('génère 1 couleur sans erreur', () => {
    expect(() => generateColors(1)).not.toThrow();
    expect(generateColors(1)).toHaveLength(1);
  });
});

describe('hslToRgb', () => {
  it('rouge pur H=0 → r élevé, g et b faibles', () => {
    const { r, g, b } = hslToRgb(0, 100, 50);
    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  it('vert pur H=120', () => {
    const { r, g, b } = hslToRgb(120, 100, 50);
    expect(g).toBe(255);
    expect(r).toBe(0);
    expect(b).toBe(0);
  });

  it('blanc s=0, l=100 → (255,255,255)', () => {
    const { r, g, b } = hslToRgb(0, 0, 100);
    expect(r).toBe(255);
    expect(g).toBe(255);
    expect(b).toBe(255);
  });

  it('noir s=0, l=0 → (0,0,0)', () => {
    const { r, g, b } = hslToRgb(0, 0, 0);
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });
});


/* ═══════════════════════════════════════════════════════════════════
   VORONOI
   ═══════════════════════════════════════════════════════════════════ */

describe('computeVoronoi', () => {
  it('avec 1 point, tous les pixels sont assignés à l\'index 0', () => {
    const a = computeVoronoi([{ x: 50, y: 50 }], 10, 10);
    expect(Array.from(a).every(v => v === 0)).toBe(true);
  });

  it('la taille du tableau de sortie est width × height', () => {
    const a = computeVoronoi([{ x: 5, y: 5 }], 20, 30);
    expect(a.length).toBe(600);
  });

  it('2 points séparés → pixels correctement assignés à chaque point', () => {
    const pts = [{ x: 0, y: 5 }, { x: 9, y: 5 }];
    const a   = computeVoronoi(pts, 10, 10);
    expect(a[5 * 10 + 0]).toBe(0); // pixel (0,5) → point 0
    expect(a[5 * 10 + 9]).toBe(1); // pixel (9,5) → point 1
  });

  it('le pixel exactement sur un point est assigné à ce point', () => {
    const pts = [{ x: 2, y: 2 }, { x: 8, y: 8 }];
    const a   = computeVoronoi(pts, 10, 10);
    expect(a[2 * 10 + 2]).toBe(0);
    expect(a[8 * 10 + 8]).toBe(1);
  });

  it('retourne un Int32Array', () => {
    const a = computeVoronoi([{ x: 5, y: 5 }], 5, 5);
    expect(a).toBeInstanceOf(Int32Array);
  });
});
