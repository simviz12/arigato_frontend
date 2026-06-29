import { test, expect } from '@playwright/test';

test.describe('Recipe Builder and Batch Prep Flow', () => {

  test('Creates a recipe, prepares batch, and verifies confirmation modal', async ({ page }) => {
    // 1. Log in
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // 2. Navigate to Recipe Builder
    await page.goto('http://localhost:5173/admin/recipes/new');
    
    // Fill basic info
    await page.fill('input[name="name"]', 'Salsa Especial E2E');
    // Using WeightInput, type 1000
    await page.fill('input[name="totalYieldGrams"]', '1000');
    await page.click('input[value="BATCH"]');

    // Add ingredients
    await page.selectOption('select[name="ingredients.0.primaryProductId"]', { index: 1 });
    await page.fill('input[name="ingredients.0.quantityGrams"]', '500');

    // Wait for debounce live cost preview
    await page.waitForTimeout(600);
    const liveCostPanel = await page.locator('.glass-panel:has-text("Costo Estimado en Vivo")').innerText();
    expect(liveCostPanel).toContain('$');

    // Save recipe
    await page.click('button:has-text("Guardar Receta")');

    // 3. Should redirect to Batches Dashboard
    await expect(page).toHaveURL(/.*\/admin\/batches/);

    // 4. Batch Preparation
    const recipeCard = page.locator('div', { hasText: 'Salsa Especial E2E' }).first();
    await recipeCard.locator('button:has-text("Preparar Lote")').click();

    // Fill quantity (1500g)
    await page.fill('.modal-content input[type="number"]', '1500');

    // 5. Verify the Red Confirmation Warning appears
    const warningText = await page.locator('h4:has-text("Confirmar Descuento Físico")').isVisible();
    expect(warningText).toBeTruthy();

    // Verify it calculated the deduction correctly (500g * 1.5 ratio = 750g)
    const deductionText = await page.locator('.modal-content ul li').first().innerText();
    expect(deductionText).toContain('750g');

    // Click final confirm
    await page.locator('button:has-text("Confirmar y Descontar")').click();

    // Modal should close
    await expect(page.locator('.modal-content')).toBeHidden();
  });
});
