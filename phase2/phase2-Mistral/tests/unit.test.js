import { describe, it, expect, beforeEach, vi } from 'vitest';

// ---- Pure logic functions extracted from script.js for testing ----

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getColor(index) {
    const colors = [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 },
        { r: 255, g: 255, b: 0 },
        { r: 255, g: 0, b: 255 },
        { r: 0, g: 255, b: 255 },
        { r: 128, g: 0, b: 0 },
        { r: 0, g: 128, b: 0 },
        { r: 0, g: 0, b: 128 },
        { r: 128, g: 128, b: 0 },
        { r: 128, g: 0, b: 128 },
        { r: 0, g: 128, b: 128 },
    ];
    return colors[index % colors.length];
}

function parsePoints(content) {
    const lines = content.split('\n');
    const parsedPoints = [];
    for (const line of lines) {
        if (line.trim() === '') continue;
        const parts = line.split(',');
        if (parts.length !== 2) continue;
        const x = parseFloat(parts[0].trim());
        const y = parseFloat(parts[1].trim());
        if (isNaN(x) || isNaN(y)) continue;
        parsedPoints.push({ x, y });
    }
    return parsedPoints;
}

// ---- Tests ----

describe('Mistral Voronoi - Tests Unitaires', () => {

    describe('distance()', () => {
        it('devrait calculer la distance entre deux points (3-4-5)', () => {
            expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
        });

        it('devrait retourner 0 pour deux points identiques', () => {
            expect(distance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
        });

        it('devrait calculer correctement avec des coordonnées négatives', () => {
            const d = distance({ x: -1, y: -1 }, { x: 2, y: 3 });
            expect(d).toBe(5);
        });
    });

    describe('getColor()', () => {
        it('devrait retourner rouge pour l\'index 0', () => {
            expect(getColor(0)).toEqual({ r: 255, g: 0, b: 0 });
        });

        it('devrait retourner vert pour l\'index 1', () => {
            expect(getColor(1)).toEqual({ r: 0, g: 255, b: 0 });
        });

        it('devrait être cyclique (index 12 = index 0)', () => {
            expect(getColor(12)).toEqual(getColor(0));
        });

        it('devrait être cyclique (index 13 = index 1)', () => {
            expect(getColor(13)).toEqual(getColor(1));
        });
    });

    describe('parsePoints()', () => {
        it('devrait parser des coordonnées valides', () => {
            const input = "1,2\n3,4\n5,6";
            const points = parsePoints(input);
            expect(points).toEqual([
                { x: 1, y: 2 },
                { x: 3, y: 4 },
                { x: 5, y: 6 }
            ]);
        });

        it('devrait ignorer les lignes vides', () => {
            const input = "1,2\n\n3,4\n";
            const points = parsePoints(input);
            expect(points).toEqual([
                { x: 1, y: 2 },
                { x: 3, y: 4 }
            ]);
        });

        it('devrait ignorer les lignes avec un format invalide', () => {
            const input = "1,2\ninvalid\n3,4";
            const points = parsePoints(input);
            expect(points).toEqual([
                { x: 1, y: 2 },
                { x: 3, y: 4 }
            ]);
        });

        it('devrait ignorer les coordonnées NaN', () => {
            const input = ",5\n6,\n1,2";
            const points = parsePoints(input);
            expect(points).toEqual([
                { x: 1, y: 2 }
            ]);
        });

        it('devrait parser des décimaux', () => {
            const input = "5.3,4.5\n12.5,23.7";
            const points = parsePoints(input);
            expect(points).toEqual([
                { x: 5.3, y: 4.5 },
                { x: 12.5, y: 23.7 }
            ]);
        });
    });
});
