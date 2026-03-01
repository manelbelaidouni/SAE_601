/**
 * voronoi-app / script.js
 * ─────────────────────────────────────────────────────────────────
 * Les fonctions métier (Parser, ColorMapper, Voronoi) sont dupliquées
 * ici afin que le fichier HTML fonctionne en ouvrant directement via
 * file:// (double-clic) SANS serveur HTTP.
 *
 * Pour les tests Vitest, utiliser src/core.js qui exporte ces mêmes
 * fonctions en ES modules.
 * ─────────────────────────────────────────────────────────────────
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════
   PARSER
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


/* ═══════════════════════════════════════════════════════════════════
   COLOR MAPPER
   ═══════════════════════════════════════════════════════════════════ */
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


/* ═══════════════════════════════════════════════════════════════════
   VORONOI ALGORITHM
   ═══════════════════════════════════════════════════════════════════ */
const Voronoi = (() => {
  function compute(points, width, height) {
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

  return { compute };
})();


/* ═══════════════════════════════════════════════════════════════════
   RENDERER
   ═══════════════════════════════════════════════════════════════════ */
const Renderer = (() => {
  const CANVAS_W = 600;
  const CANVAS_H = 600;
  const POINT_RADIUS = 5;

  function projectPoints(points) {
    const MARGIN = 40;
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const yMin = Math.min(...ys), yMax = Math.max(...ys);
    const rangeX = xMax - xMin || 1;
    const rangeY = yMax - yMin || 1;

    return points.map(p => ({
      x: MARGIN + ((p.x - xMin) / rangeX) * (CANVAS_W - 2 * MARGIN),
      y: MARGIN + ((p.y - yMin) / rangeY) * (CANVAS_H - 2 * MARGIN),
    }));
  }

  function draw(canvas, rawPoints) {
    const ctx       = canvas.getContext('2d');
    const projected = projectPoints(rawPoints);
    const colors    = ColorMapper.generate(projected.length);
    const assignment = Voronoi.compute(projected, CANVAS_W, CANVAS_H);
    const imageData = ctx.createImageData(CANVAS_W, CANVAS_H);
    const data = imageData.data;

    for (let i = 0; i < assignment.length; i++) {
      const color = colors[assignment[i]];
      const idx   = i * 4;
      data[idx]     = color.r;
      data[idx + 1] = color.g;
      data[idx + 2] = color.b;
      data[idx + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    projected.forEach((pt, i) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, POINT_RADIUS + 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, POINT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${colors[i].r},${colors[i].g},${colors[i].b})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, POINT_RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    return { projected, colors };
  }

  return { draw, CANVAS_W, CANVAS_H };
})();


/* ═══════════════════════════════════════════════════════════════════
   EXPORTER
   ═══════════════════════════════════════════════════════════════════ */
const Exporter = (() => {
  function toPng(canvas) {
    const link = document.createElement('a');
    link.download = 'voronoi.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function toSvg(canvas, projectedPoints, colors) {
    const W = canvas.width;
    const H = canvas.height;
    const pngDataUrl = canvas.toDataURL('image/png');

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">\n`;
    svgContent += `  <image href="${pngDataUrl}" x="0" y="0" width="${W}" height="${H}"/>\n`;

    projectedPoints.forEach((pt, i) => {
      const c    = colors[i];
      const fill = `rgb(${c.r},${c.g},${c.b})`;
      svgContent += `  <circle cx="${pt.x.toFixed(2)}" cy="${pt.y.toFixed(2)}" r="7" fill="white" opacity="0.9"/>\n`;
      svgContent += `  <circle cx="${pt.x.toFixed(2)}" cy="${pt.y.toFixed(2)}" r="5" fill="${fill}" stroke="black" stroke-width="1.5"/>\n`;
    });

    svgContent += '</svg>';

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const link  = document.createElement('a');
    link.download = 'voronoi.svg';
    link.href     = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return { toPng, toSvg };
})();


/* ═══════════════════════════════════════════════════════════════════
   UI CONTROLLER
   ═══════════════════════════════════════════════════════════════════ */
const UI = (() => {
  let state = {
    points:          [],
    projectedPoints: [],
    colors:          [],
    fileLoaded:      false,
    diagramDrawn:    false,
  };

  const els = {};

  function init() {
    els.fileInput    = document.getElementById('fileInput');
    els.fileDrop     = document.getElementById('fileDrop');
    els.fileInfo     = document.getElementById('fileInfo');
    els.btnGenerate  = document.getElementById('btnGenerate');
    els.btnExportSvg = document.getElementById('btnExportSvg');
    els.btnExportPng = document.getElementById('btnExportPng');
    els.canvas       = document.getElementById('voronoiCanvas');
    els.placeholder  = document.getElementById('canvasPlaceholder');
    els.errorBanner  = document.getElementById('errorBanner');
    els.statPoints   = document.getElementById('statPoints');
    els.statErrors   = document.getElementById('statErrors');

    bindEvents();
  }

  function bindEvents() {
    els.fileInput.addEventListener('change', onFileSelected);
    els.fileDrop.addEventListener('dragover',  e => { e.preventDefault(); els.fileDrop.classList.add('drag-over'); });
    els.fileDrop.addEventListener('dragleave', () => els.fileDrop.classList.remove('drag-over'));
    els.fileDrop.addEventListener('drop',      onFileDrop);
    els.btnGenerate.addEventListener('click',  onGenerate);
    els.btnExportSvg.addEventListener('click', onExportSvg);
    els.btnExportPng.addEventListener('click', onExportPng);
  }

  function onFileSelected(e) {
    const file = e.target.files[0];
    if (file) loadFile(file);
  }

  function onFileDrop(e) {
    e.preventDefault();
    els.fileDrop.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.txt')) loadFile(file);
    else showError('Veuillez déposer un fichier .txt');
  }

  function loadFile(file) {
    const reader = new FileReader();
    reader.onload  = e => processContent(e.target.result, file.name);
    reader.onerror = () => showError('Impossible de lire le fichier.');
    reader.readAsText(file, 'UTF-8');
  }

  function processContent(content, filename) {
    hideError();
    const { points, errors } = Parser.parseContent(content);
    setStats(points.length, errors.length);

    if (errors.length > 0) {
      const msgs = errors.map(err => `• Ligne ${err.line}: <code>${escHtml(err.raw)}</code> — coordonnée invalide`);
      showError(msgs.join('<br>'));
    }

    if (points.length === 0) {
      showError((errors.length > 0 ? els.errorBanner.innerHTML + '<br>' : '') +
        '⚠ Aucun point valide trouvé dans le fichier.');
      els.btnGenerate.disabled = true;
      state.fileLoaded = false;
      return;
    }

    state.points     = points;
    state.fileLoaded = true;

    els.fileInfo.textContent = `✓ ${filename} — ${points.length} point(s) chargé(s)`;
    els.fileInfo.classList.remove('hidden');
    els.btnGenerate.disabled = false;
    els.btnExportSvg.disabled = true;
    els.btnExportPng.disabled = true;
    state.diagramDrawn = false;
  }

  function onGenerate() {
    if (!state.fileLoaded || state.points.length === 0) return;
    els.placeholder.classList.add('hidden');
    const { projected, colors } = Renderer.draw(els.canvas, state.points);
    state.projectedPoints = projected;
    state.colors          = colors;
    state.diagramDrawn    = true;
    els.btnExportSvg.disabled = false;
    els.btnExportPng.disabled = false;
  }

  function onExportSvg() {
    if (!state.diagramDrawn) return;
    Exporter.toSvg(els.canvas, state.projectedPoints, state.colors);
  }

  function onExportPng() {
    if (!state.diagramDrawn) return;
    Exporter.toPng(els.canvas);
  }

  function setStats(points, errors) {
    els.statPoints.textContent = points;
    els.statErrors.textContent = errors;
  }

  function showError(html) {
    els.errorBanner.innerHTML = html;
    els.errorBanner.classList.remove('hidden');
  }

  function hideError() {
    els.errorBanner.innerHTML = '';
    els.errorBanner.classList.add('hidden');
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return { init };
})();


/* ── Démarrage ── */
document.addEventListener('DOMContentLoaded', () => UI.init());