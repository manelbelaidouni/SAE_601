/**
 * voronoi-app / tests.js
 * ─────────────────────────────────────────────────────────────────
 * Suite de tests indépendante — exécutable via Node.js :
 *   node tests.js
 * ─────────────────────────────────────────────────────────────────
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════
   MODULES APPLICATIFS (re-déclarés pour Node.js)
   ═══════════════════════════════════════════════════════════════════ */

const Parser = (() => {
  function parseLine(line) {
    const trimmed = line.trim();
    if (trimmed === '') return null;

    const parts = trimmed.split(',');
    if (parts.length !== 2) return undefined;

    const x = parseFloat(parts[0].trim());
    const y = parseFloat(parts[1].trim());

    if (isNaN(x) || isNaN(y)) return undefined;

    return { x, y };
  }

  function parseContent(content) {
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

  return { parseLine, parseContent };
})();


const ColorMapper = (() => {
  function generate(count) {
    return Array.from({ length: count }, (_, i) => {
      const hue = (i * 360 / count + 47) % 360;
      return hslToRgb(hue, 72, 52);
    });
  }

  function hslToRgb(h, s, l) {
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

  return { generate };
})();


const Voronoi = (() => {
  function compute(points, width, height) {
    const assignment = new Int32Array(width * height);

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        let minDist = Infinity;
        let closest = 0;

        for (let i = 0; i < points.length; i++) {
          const dx = px - points[i].x;
          const dy = py - points[i].y;
          const dist = dx * dx + dy * dy;
          if (dist < minDist) { minDist = dist; closest = i; }
        }

        assignment[py * width + px] = closest;
      }
    }

    return assignment;
  }

  return { compute };
})();


/* ═══════════════════════════════════════════════════════════════════
   MICRO-FRAMEWORK DE TEST
   ═══════════════════════════════════════════════════════════════════ */

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message = 'Assertion échouée') {
  if (!condition) throw new Error(message);
}


/* ═══════════════════════════════════════════════════════════════════
   DÉFINITION DES TESTS
   ═══════════════════════════════════════════════════════════════════ */

/* ── Parser : cas valides ── */
test('Parser: ligne valide entiers "3,4"', () => {
  const r = Parser.parseLine('3,4');
  assert(r !== null && r !== undefined, 'Doit retourner un objet');
  assert(r.x === 3 && r.y === 4, `Attendu {x:3,y:4}, obtenu {x:${r?.x},y:${r?.y}}`);
});

test('Parser: ligne valide floats "1.5 , 2.7"', () => {
  const r = Parser.parseLine('1.5 , 2.7');
  assert(r !== null && r !== undefined);
  assert(Math.abs(r.x - 1.5) < 1e-9 && Math.abs(r.y - 2.7) < 1e-9);
});

test('Parser: ligne valide avec espaces "  10 , 20  "', () => {
  const r = Parser.parseLine('  10 , 20  ');
  assert(r && r.x === 10 && r.y === 20);
});

test('Parser: ligne valide négatifs "-3,-4.5"', () => {
  const r = Parser.parseLine('-3,-4.5');
  assert(r && r.x === -3 && Math.abs(r.y + 4.5) < 1e-9);
});

test('Parser: ligne valide zéros "0,0"', () => {
  const r = Parser.parseLine('0,0');
  assert(r && r.x === 0 && r.y === 0);
});

/* ── Parser : cas invalides ── */
test('Parser: ligne vide → null', () => {
  assert(Parser.parseLine('') === null, 'Ligne vide doit retourner null');
});

test('Parser: ligne espaces seuls → null', () => {
  assert(Parser.parseLine('   ') === null);
});

test('Parser: une seule valeur "5" → undefined', () => {
  assert(Parser.parseLine('5') === undefined);
});

test('Parser: trois valeurs "1,2,3" → undefined', () => {
  assert(Parser.parseLine('1,2,3') === undefined);
});

test('Parser: lettres "a,b" → undefined', () => {
  assert(Parser.parseLine('a,b') === undefined);
});

test('Parser: mixte "1,b" → undefined', () => {
  assert(Parser.parseLine('1,b') === undefined);
});

test('Parser: texte libre "hello world" → undefined', () => {
  assert(Parser.parseLine('hello world') === undefined);
});

/* ── parseContent ── */
test('parseContent: ignore lignes vides, extrait points valides', () => {
  const content = '1,2\n\n3,4\n  \n5,6';
  const { points, errors } = Parser.parseContent(content);
  assert(points.length === 3, `Attendu 3 points, obtenu ${points.length}`);
  assert(errors.length === 0, `Attendu 0 erreurs, obtenu ${errors.length}`);
});

test('parseContent: détecte les erreurs', () => {
  const content = '1,2\nabc\n3,4\n5';
  const { points, errors } = Parser.parseContent(content);
  assert(points.length === 2, `Attendu 2 points, obtenu ${points.length}`);
  assert(errors.length === 2, `Attendu 2 erreurs, obtenu ${errors.length}`);
});

test('parseContent: fichier entièrement vide → 0 points, 0 erreurs', () => {
  const { points, errors } = Parser.parseContent('');
  assert(points.length === 0);
  assert(errors.length === 0);
});

test('parseContent: numéros de ligne corrects dans erreurs', () => {
  const content = 'bad\n1,2';
  const { errors } = Parser.parseContent(content);
  assert(errors[0].line === 1, `Attendu ligne 1, obtenu ${errors[0]?.line}`);
});

/* ── ColorMapper ── */
test('ColorMapper: génère le bon nombre de couleurs', () => {
  const cols = ColorMapper.generate(7);
  assert(cols.length === 7);
});

test('ColorMapper: valeurs RGB dans [0, 255]', () => {
  const cols = ColorMapper.generate(10);
  const valid = cols.every(c =>
    c.r >= 0 && c.r <= 255 &&
    c.g >= 0 && c.g <= 255 &&
    c.b >= 0 && c.b <= 255
  );
  assert(valid, 'Toutes les valeurs doivent être dans [0,255]');
});

test('ColorMapper: couleurs distinctes pour n≥2', () => {
  const cols = ColorMapper.generate(4);
  const strs = cols.map(c => `${c.r},${c.g},${c.b}`);
  const unique = new Set(strs);
  assert(unique.size === 4, 'Couleurs doivent être distinctes');
});

/* ── Voronoi ── */
test('Voronoi: 1 point → tous pixels assignés à 0', () => {
  const a = Voronoi.compute([{ x: 50, y: 50 }], 10, 10);
  assert(a.every(v => v === 0), 'Tous les pixels doivent pointer vers le seul point');
});

test('Voronoi: 2 points séparés → pixels proches correctement assignés', () => {
  const pts = [{ x: 0, y: 5 }, { x: 9, y: 5 }];
  const a = Voronoi.compute(pts, 10, 10);
  assert(a[5 * 10 + 0] === 0, 'Pixel (0,5) doit appartenir au point 0');
  assert(a[5 * 10 + 9] === 1, 'Pixel (9,5) doit appartenir au point 1');
});

test('Voronoi: taille du tableau de sortie = width*height', () => {
  const a = Voronoi.compute([{ x: 5, y: 5 }], 20, 30);
  assert(a.length === 600, `Attendu 600, obtenu ${a.length}`);
});


/* ═══════════════════════════════════════════════════════════════════
   RUNNER
   ═══════════════════════════════════════════════════════════════════ */

const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';

let passed = 0;
let failed = 0;

console.log(`\n${BOLD}▶ Voronoï — Suite de tests${RESET}\n`);

tests.forEach(({ name, fn }) => {
  try {
    fn();
    console.log(`  ${GREEN}✓${RESET} ${DIM}${name}${RESET}`);
    passed++;
  } catch (err) {
    console.log(`  ${RED}✗ ${name}${RESET}`);
    console.log(`    ${RED}→ ${err.message}${RESET}`);
    failed++;
  }
});

console.log(`\n${BOLD}─────────────────────────────────────────${RESET}`);
const total = passed + failed;
if (failed === 0) {
  console.log(`${GREEN}${BOLD}  ✓ ${passed}/${total} tests passés${RESET}\n`);
} else {
  console.log(`${RED}${BOLD}  ✗ ${failed} échec(s) — ${passed}/${total} tests passés${RESET}\n`);
  process.exit(1);
}
