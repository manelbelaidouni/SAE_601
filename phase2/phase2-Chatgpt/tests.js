const { VoronoiEngine, parsePointsFromText, computeBoundsFromPoints } = require("./js/voronoi.js");

describe("parsePointsFromText", () => {
  it("garde les lignes valides et signale les lignes invalides", () => {
    const text = "1,2\n\nx,3\n4,5,6\n7,8";
    const { points, errors } = parsePointsFromText(text);
    expect(points).toHaveLength(2);
    expect(errors).toHaveLength(2);
  });
});

describe("computeBoundsFromPoints", () => {
  it("ajoute une marge autour du nuage de points", () => {
    const bounds = computeBoundsFromPoints([
      { x: 0, y: 0 },
      { x: 10, y: 20 }
    ]);
    expect(bounds.minX).toBeLessThan(0);
    expect(bounds.maxY).toBeGreaterThan(20);
  });
});

describe("VoronoiEngine.compute", () => {
  it("coupe correctement deux points par la médiatrice", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 }
    ];
    const bounds = { minX: -10, minY: -10, maxX: 20, maxY: 10 };
    const diagram = VoronoiEngine.compute(points, bounds);
    expect(diagram.cells).toHaveLength(2);
    const first = diagram.cells[0];
    const maxXFirstCell = Math.max(...first.polygon.map((p) => p.x));
    expect(maxXFirstCell).toBeCloseTo(5, 6);
  });

  it("retire les points dupliqués", () => {
    const points = [
      { x: 2, y: 2 },
      { x: 2, y: 2 },
      { x: 8, y: 8 }
    ];
    const bounds = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
    const diagram = VoronoiEngine.compute(points, bounds);
    expect(diagram.cells).toHaveLength(2);
  });
});
