import { test, expect } from '@playwright/test';

test.describe('Menu Builder and Live Margin Flow', () => {

  test('Creates a final product and verifies live margin calculation', async ({ page }) => {
    // 1. Log in
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // 2. Navigate to Menu Builder
    await page.goto('http://localhost:5173/admin/menu/new');
    
    // Fill basic info
    await page.fill('input[name="name"]', 'Costillas BBQ Premium');
    await page.selectOption('select[name="category"]', 'MAIN_COURSE');
    
    // Set selling price
    await page.fill('input[name="sellingPricePesos"]', '35000');

    // 3. Add components (Primary + Subproduct)
    
    // Component 1: Primary Product (Ribs)
    await page.selectOption('select[name="components.0.type"]', 'PRIMARY');
    await page.selectOption('select[name="components.0.primaryProductId"]', { index: 1 });
    await page.fill('input[name="components.0.quantityGrams"]', '200');

    // Click 'Add Component'
    await page.click('button:has-text("Agregar Componente")');
    
    // Component 2: Subproduct (BBQ Sauce)
    await page.selectOption('select[name="components.1.type"]', 'SUBPRODUCT');
    await page.selectOption('select[name="components.1.subproductId"]', { index: 1 });
    await page.fill('input[name="components.1.quantityGrams"]', '50');

    // 4. Verify Live Margin Recalculation
    // The panel debounce is 400ms, wait for it
    await page.waitForTimeout(600);
    
    const marginPanel = page.locator('.glass-panel:has-text("Rentabilidad del Plato")');
    const marginPercentText = await marginPanel.locator('div:has-text("%")').last().innerText();
    
    // Expect the panel to have calculated the margin and show it
    expect(marginPercentText).toContain('%');
    
    // Check color coding (Health check)
    // If the mock selling price is 35k and costs are low, it should be Healthy
    const isHealthy = await marginPanel.locator('span:has-text("Saludable")').isVisible();
    expect(isHealthy).toBeTruthy();

    // 5. Submit form
    await page.click('button:has-text("Publicar Plato")');

    // Should navigate to Menu Dashboard
    await expect(page).toHaveURL(/.*\/admin\/menu/);
    
    // Check the new item is rendered
    const card = page.locator('h3:has-text("Costillas BBQ Premium")');
    await expect(card).toBeVisible();
  });
});
