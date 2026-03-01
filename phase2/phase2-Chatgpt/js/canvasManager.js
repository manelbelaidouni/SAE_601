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

class CanvasVoronoiRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Impossible d'initialiser le contexte 2D.");
    }
    this.ctx = context;
    this.lastRenderData = null;
  }

  /**
   * @param {{cells: Array<{site: Point, polygon: Point[]}>}} diagram
   * @param {Rect} worldBounds
   */
  render(diagram, worldBounds) {
    this.lastRenderData = { diagram, worldBounds };
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, width, height);

    diagram.cells.forEach((cell, index) => {
      if (cell.polygon.length < 3) {
        return;
      }
      const colorHue = (index * 57) % 360;
      this.#drawPolygon(cell.polygon, worldBounds, `hsla(${colorHue}, 68%, 60%, 0.35)`, "#204060");
    });

    this.ctx.fillStyle = "#0e2740";
    diagram.cells.forEach((cell) => {
      const p = this.#toCanvas(cell.site, worldBounds);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3.8, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  /**
   * @param {Point[]} polygon
   * @param {Rect} worldBounds
   * @param {string} fill
   * @param {string} stroke
   */
  #drawPolygon(polygon, worldBounds, fill, stroke) {
    const first = this.#toCanvas(polygon[0], worldBounds);
    this.ctx.beginPath();
    this.ctx.moveTo(first.x, first.y);
    for (let i = 1; i < polygon.length; i += 1) {
      const point = this.#toCanvas(polygon[i], worldBounds);
      this.ctx.lineTo(point.x, point.y);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = fill;
    this.ctx.strokeStyle = stroke;
    this.ctx.lineWidth = 1;
    this.ctx.fill();
    this.ctx.stroke();
  }

  /**
   * @param {Point} point
   * @param {Rect} worldBounds
   * @returns {Point}
   */
  #toCanvas(point, worldBounds) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const sx = (point.x - worldBounds.minX) / (worldBounds.maxX - worldBounds.minX);
    const sy = (point.y - worldBounds.minY) / (worldBounds.maxY - worldBounds.minY);
    return { x: sx * w, y: sy * h };
  }

  downloadPNG(filename = "voronoi.png") {
    const link = document.createElement("a");
    link.href = this.canvas.toDataURL("image/png");
    link.download = filename;
    link.click();
  }

  downloadSVG(filename = "voronoi.svg") {
    if (!this.lastRenderData) {
      return;
    }
    const { diagram, worldBounds } = this.lastRenderData;
    const svg = this.#buildSVG(diagram, worldBounds);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Le SVG est reconstruit depuis les données métiers et non depuis un raster
   * pour conserver la netteté à tout zoom.
   *
   * @param {{cells: Array<{site: Point, polygon: Point[]}>}} diagram
   * @param {Rect} worldBounds
   * @returns {string}
   */
  #buildSVG(diagram, worldBounds) {
    const width = this.canvas.width;
    const height = this.canvas.height;

    const polygonTags = diagram.cells
      .filter((cell) => cell.polygon.length >= 3)
      .map((cell, index) => {
        const hue = (index * 57) % 360;
        const pointsAttr = cell.polygon
          .map((p) => this.#toCanvas(p, worldBounds))
          .map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
          .join(" ");
        return `<polygon points="${pointsAttr}" fill="hsla(${hue},68%,60%,0.35)" stroke="#204060" stroke-width="1" />`;
      })
      .join("");

    const sitesTags = diagram.cells
      .map((cell) => this.#toCanvas(cell.site, worldBounds))
      .map((p) => `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="3.8" fill="#0e2740" />`)
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />
  ${polygonTags}
  ${sitesTags}
</svg>`;
  }
}

window.CanvasVoronoiRenderer = CanvasVoronoiRenderer;
