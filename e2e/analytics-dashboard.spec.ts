import { test, expect } from '@playwright/test';

test.describe('Week 7 - Admin Analytics Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to Dashboard
    await page.goto('http://localhost:5173/admin/dashboard');
  });

  test('Validates semantic color logic on deltas', async ({ page }) => {
    // Ingresos going UP should be GREEN (success)
    const ingresosCard = page.locator('.glass-panel').filter({ hasText: 'Ingresos Totales' });
    await expect(ingresosCard.locator('svg.lucide-trending-up')).toBeVisible();
    
    // Check if the color applied to the text wrapper is the success variable or hardcoded green
    // We expect the arrow and text to be colored positively
    await expect(ingresosCard.locator('text=vs periodo anterior')).toHaveCSS('color', 'rgb(74, 222, 128)'); // var(--success) equivalent approximation depending on computed style

    // Costo going UP should be RED (danger)
    const costoCard = page.locator('.glass-panel').filter({ hasText: 'Costo (Ingredientes)' });
    await expect(costoCard.locator('svg.lucide-trending-up')).toBeVisible();
    await expect(costoCard.locator('text=vs periodo anterior')).toHaveCSS('color', 'rgb(248, 113, 113)'); // var(--danger)

    // Gasto going DOWN should be GREEN (success)
    const gastoCard = page.locator('.glass-panel').filter({ hasText: 'Gasto (Compras)' });
    await expect(gastoCard.locator('svg.lucide-trending-down')).toBeVisible();
    await expect(gastoCard.locator('text=vs periodo anterior')).toHaveCSS('color', 'rgb(74, 222, 128)');
  });

  test('Validates period filter interaction and chart re-rendering', async ({ page }) => {
    // Default is Mes
    await expect(page.locator('h2:has-text("Tendencia de Este Mes")')).toBeVisible();
    
    // Click Dia
    await page.locator('button', { hasText: 'dia' }).click();
    await expect(page.locator('h2:has-text("Tendencia de Hoy")')).toBeVisible();

    // Click Semana
    await page.locator('button', { hasText: 'semana' }).click();
    await expect(page.locator('h2:has-text("Tendencia de Esta Semana")')).toBeVisible();

    // Click Año
    await page.locator('button', { hasText: 'ano' }).click();
    await expect(page.locator('h2:has-text("Tendencia de Este Año")')).toBeVisible();

    // Ensure the chart container exists and is rendering recharts SVGs
    await expect(page.locator('.recharts-responsive-container')).toBeVisible();
    await expect(page.locator('.recharts-line')).toBeVisible(); // The revenue line
    await expect(page.locator('.recharts-bar')).toHaveCount(2); // The Cost and Expense bars
  });

});
