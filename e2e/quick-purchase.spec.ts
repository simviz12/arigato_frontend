import { test, expect } from '@playwright/test';

test.describe('Week 8 - Quick Purchase Flow & Custom Export', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to Shopping List Page
    await page.goto('http://localhost:5173/admin/shopping-list');
  });

  test('Validates the quick purchase shortcut pre-fills data', async ({ page }) => {
    // Wait for the table to load
    await expect(page.locator('h1:has-text("Lista de Compras")')).toBeVisible();

    // Find the first row that has a valid distributor
    const firstRow = page.locator('tbody tr').first();
    const productName = await firstRow.locator('td').nth(1).innerText();
    const distributorName = await firstRow.locator('td').nth(3).innerText();

    // Click the Quick Purchase button
    const buyButton = firstRow.locator('button:has-text("Comprar")');
    await expect(buyButton).toBeVisible();
    await buyButton.click();

    // The modal should appear
    const modal = page.locator('.glass-panel:has-text("Registrar Factura")');
    await expect(modal).toBeVisible();

    // Verify it pre-filled the Distributor and Product exactly as they appeared in the list
    await expect(modal.locator(`text=${distributorName}`)).toBeVisible();
    await expect(modal.locator(`text=${productName}`)).toBeVisible();

    // Fill in the quantity and submit
    await page.locator('input[type="number"]').fill('5000');
    await modal.locator('button:has-text("Guardar Factura")').click();

    // The modal should close after processing
    await expect(modal).not.toBeVisible({ timeout: 2000 });

    // The item should disappear from the urgent list
    await expect(page.locator('tbody').locator(`text=${productName}`)).not.toBeVisible();
  });

  test('Validates custom PDF export enables/disables based on selection', async ({ page }) => {
    // Select all is checked by default
    const exportButton = page.locator('button', { hasText: 'Exportar Seleccionados' });
    await expect(exportButton).not.toBeDisabled();

    // Click the "Select All" toggle in the header
    const selectAllToggle = page.locator('thead th').first();
    await selectAllToggle.click();

    // Now nothing is selected, button should be disabled
    await expect(exportButton).toBeDisabled();

    // Click it again to select all
    await selectAllToggle.click();
    await expect(exportButton).not.toBeDisabled();
  });
});
