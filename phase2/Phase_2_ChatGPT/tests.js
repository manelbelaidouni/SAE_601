/* eslint-disable no-console */
/**
 * Suite de tests unitaires minimale sans dépendance externe.
 * Pourquoi ce format :
 * - exécutable directement dans le navigateur ;
 * - adapté à une SAE quand on veut démontrer une validation claire
 *   sans imposer une toolchain Node.
 */
(function runTests() {
  /**
   * @param {boolean} condition
   * @param {string} message
   */
  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * @param {number} actual
   * @param {number} expected
   * @param {number} epsilon
   * @param {string} message
   */
  function assertAlmostEqual(actual, expected, epsilon, message) {
    assert(Math.abs(actual - expected) <= epsilon, `${message} | got=${actual} expected=${expected}`);
  }

  function testParserValidAndInvalidLines() {
    const text = "1,2\n\nx,3\n4,5,6\n7,8";
    const { points, errors } = window.parsePointsFromText(text);
    assert(points.length === 2, "Le parser doit garder 2 points valides.");
    assert(errors.length === 2, "Le parser doit signaler 2 erreurs de format.");
  }

  function testBoundsComputation() {
    const bounds = window.computeBoundsFromPoints([
      { x: 0, y: 0 },
      { x: 10, y: 20 }
    ]);
    assert(bounds.minX < 0, "minX doit inclure une marge.");
    assert(bounds.maxY > 20, "maxY doit inclure une marge.");
  }

  function testVoronoiTwoPointsSplit() {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 }
    ];
    const bounds = { minX: -10, minY: -10, maxX: 20, maxY: 10 };
    const diagram = window.VoronoiEngine.compute(points, bounds);
    assert(diagram.cells.length === 2, "2 cellules attendues.");
    const first = diagram.cells[0];
    const maxXFirstCell = Math.max(...first.polygon.map((p) => p.x));
    assertAlmostEqual(maxXFirstCell, 5, 1e-6, "La médiatrice doit être à x=5.");
  }

  function testVoronoiDuplicatePoints() {
    const points = [
      { x: 2, y: 2 },
      { x: 2, y: 2 },
      { x: 8, y: 8 }
    ];
    const bounds = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
    const diagram = window.VoronoiEngine.compute(points, bounds);
    assert(diagram.cells.length === 2, "Les doublons doivent être retirés.");
  }

  const tests = [
    testParserValidAndInvalidLines,
    testBoundsComputation,
    testVoronoiTwoPointsSplit,
    testVoronoiDuplicatePoints
  ];

  let passed = 0;
  for (const testFn of tests) {
    try {
      testFn();
      passed += 1;
      console.log(`OK: ${testFn.name}`);
    } catch (error) {
      console.error(`KO: ${testFn.name} -> ${error.message}`);
    }
  }
  console.log(`Résultat: ${passed}/${tests.length} tests passés.`);
}());
