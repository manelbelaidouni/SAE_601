import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Mistral Voronoi App E2E', () => {
    test.beforeEach(async ({ page }) => {
        const filePath = path.resolve(__dirname, '../index.html');
        await page.goto(`file://${filePath}`);
    });

    test('devrait charger la page correctement', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Voronoï');
        await expect(page.locator('#canvas')).toBeVisible();
        await expect(page.locator('#status')).toHaveText('Prêt');
    });

    test('devrait importer un fichier et afficher le nombre de points', async ({ page }) => {
        const mockFilePath = path.resolve(__dirname, '../../test_points.txt');
        await page.setInputFiles('#importFile', mockFilePath);

        // Attendre que le status indique les points importés
        await expect(page.locator('#status')).toContainText('points importés', { timeout: 5000 });
    });

    test('devrait générer le diagramme après import et clic sur Générer', async ({ page }) => {
        const mockFilePath = path.resolve(__dirname, '../../test_points.txt');
        await page.setInputFiles('#importFile', mockFilePath);

        await expect(page.locator('#status')).toContainText('points importés', { timeout: 5000 });

        await page.click('#generateBtn');

        // Le canvas devrait être visible après génération
        await expect(page.locator('#canvas')).toBeVisible();
    });

    test('devrait effacer le canvas quand on clique sur Effacer', async ({ page }) => {
        const mockFilePath = path.resolve(__dirname, '../../test_points.txt');
        await page.setInputFiles('#importFile', mockFilePath);

        await expect(page.locator('#status')).toContainText('points importés', { timeout: 5000 });
        await page.click('#generateBtn');

        // Effacer
        await page.click('#clearBtn');

        await expect(page.locator('#status')).toHaveText('Canvas effacé.');
    });
});
