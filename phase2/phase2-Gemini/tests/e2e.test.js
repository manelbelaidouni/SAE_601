import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Voronoi App E2E', () => {
    test.beforeEach(async ({ page }) => {
        // In a real scenario, we'd start a dev server. 
        // For simplicity in this test, we load the local file.
        const filePath = path.resolve(__dirname, '../index.html');
        await page.goto(`file://${filePath}`);
    });

    test('should load the page correctly', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Voronoï');
        await expect(page.locator('.placeholder-msg')).toBeVisible();
    });

    test('should enable buttons after file upload', async ({ page }) => {
        const mockFilePath = path.resolve(__dirname, '../../test_points.txt');
        await page.setInputFiles('#fileInput', mockFilePath);

        await expect(page.locator('#exportSvgBtn')).toBeEnabled();
        await expect(page.locator('#exportPngBtn')).toBeEnabled();
        await expect(page.locator('#clearBtn')).toBeEnabled();
        await expect(page.locator('svg')).toBeVisible();
    });

    test('should clear the state when clear button is clicked', async ({ page }) => {
        // Upload first
        const mockFilePath = path.resolve(__dirname, '../../test_points.txt');
        await page.setInputFiles('#fileInput', mockFilePath);

        // Clear
        await page.click('#clearBtn');

        await expect(page.locator('#exportSvgBtn')).toBeDisabled();
        await expect(page.locator('.placeholder-msg')).toBeVisible();
    });
});
