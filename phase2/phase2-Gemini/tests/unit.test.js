import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as d3 from 'd3';

// Setup global environment BEFORE loading script.js
global.d3 = d3;
window.d3 = d3;
window.__VITEST__ = true;

// Load script.js
await import('../script.js');
const { VoronoiApp } = window;

describe('VoronoiApp Unit Tests', () => {
    let app;

    beforeEach(() => {
        // Mock DOM structure
        document.body.innerHTML = `
            <input type="file" id="fileInput">
            <span id="fileNameDisplay"></span>
            <button id="exportSvgBtn" disabled></button>
            <button id="exportPngBtn" disabled></button>
            <button id="clearBtn" disabled></button>
            <div id="voronoi-container"></div>
        `;
        app = new VoronoiApp();
    });

    it('should correctly parse points from string', () => {
        const input = "2,4\n5.3,4.5\ninvalid\n18,29";
        const points = app.parsePoints(input);
        expect(points).toEqual([
            [2, 4],
            [5.3, 4.5],
            [18, 29]
        ]);
    });

    it('should handle different line endings', () => {
        const input = "1,1\r\n2,2";
        const points = app.parsePoints(input);
        expect(points).toEqual([[1, 1], [2, 2]]);
    });

    it('should reset state on clear', () => {
        app.points = [[1, 2]];
        app.clear();
        expect(app.points).toEqual([]);
        expect(document.getElementById('voronoi-container').innerHTML).toContain('Importez');
    });

    it('should toggle buttons correctly', () => {
        app.toggleButtons(true);
        expect(document.getElementById('exportSvgBtn').disabled).toBe(false);
        expect(document.getElementById('clearBtn').disabled).toBe(false);

        app.toggleButtons(false);
        expect(document.getElementById('exportSvgBtn').disabled).toBe(true);
    });
});
