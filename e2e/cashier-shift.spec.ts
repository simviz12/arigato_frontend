import { test, expect } from '@playwright/test';

test.describe('Week 6 - POS Cashier Shift Validation', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to POS
    await page.goto('http://localhost:5173/admin/pos');
  });

  test('Validates double-click cart addition and standard cash checkout', async ({ page }) => {
    // We assume the first product is 'Costillas BBQ Premium' ($35000)
    const firstProduct = page.locator('.glass-panel').nth(0);
    
    // Simulate touch-friendly double tap / double click
    await firstProduct.dblclick();
    
    // Verify it appeared in cart
    await expect(page.locator('text=Costillas BBQ Premium').first()).toBeVisible();
    await expect(page.locator('text=TOTAL').locator('..').locator('span').nth(1)).toContainText('$35,000');

    // Add another item
    const secondProduct = page.locator('.glass-panel').nth(1); // Hamburguesa
    await secondProduct.dblclick();
    await expect(page.locator('text=TOTAL').locator('..').locator('span').nth(1)).toContainText('$60,000');

    // Select CASH
    await page.locator('button:has-text("Efectivo")').click();

    // Verify checkout is disabled since we haven't inputted cash
    const completeBtn = page.locator('button:has-text("Completar Venta")');
    await expect(completeBtn).toBeDisabled();

    // Click quick cash $100k
    await page.locator('button:has-text("$100k")').click();

    // Verify change is calculated instantly ($100k - $60k = $40k)
    await expect(page.locator('text=$40,000').first()).toBeVisible();

    // Complete sale
    await completeBtn.click();

    // Verify Receipt Modal appears
    await expect(page.locator('text=RESTAURANTE ARIGATO')).toBeVisible();
    await expect(page.locator('text=Imprimir Ticket')).toBeVisible();
  });

  test('Validates mathematical constraints of MIXTO split payment', async ({ page }) => {
    // Add product ($35k)
    const firstProduct = page.locator('.glass-panel').nth(0);
    await firstProduct.dblclick();

    // Select Mixto
    await page.locator('button:has-text("Mixto")').click();
    
    const completeBtn = page.locator('button:has-text("Completar Venta Mixta")');
    await expect(completeBtn).toBeDisabled();

    // Enter bad split: 10k cash + 10k nequi = 20k (Short 15k)
    await page.getByPlaceholder('$0').nth(0).fill('10000'); // Efectivo input
    await page.getByPlaceholder('$0').nth(1).fill('10000'); // Nequi input
    
    await expect(page.locator('text=La suma debe coincidir')).toBeVisible();
    await expect(completeBtn).toBeDisabled();

    // Enter perfect split: 20k cash + 15k nequi = 35k
    await page.getByPlaceholder('$0').nth(0).fill('20000');
    await page.getByPlaceholder('$0').nth(1).fill('15000');

    await expect(page.locator('text=La suma debe coincidir')).not.toBeVisible();
    await expect(completeBtn).toBeEnabled();
  });

  test('Validates discount logic down to $0', async ({ page }) => {
    // Add product ($8000)
    const thirdProduct = page.locator('.glass-panel').nth(2);
    await thirdProduct.dblclick();

    // Apply FIXED discount of $8000
    await page.locator('select').selectOption('FIXED');
    await page.locator('input[type="number"]').fill('8000');

    // Total should be $0
    await expect(page.locator('text=TOTAL').locator('..').locator('span').nth(1)).toContainText('$0');

    // Pay with EXACT cash
    await page.locator('button:has-text("Efectivo")').click();
    await page.locator('button:has-text("Exacto")').click();

    // Complete
    const completeBtn = page.locator('button:has-text("Completar Venta")');
    await expect(completeBtn).toBeEnabled();
    await completeBtn.click();

    // Verify receipt prints 100% discount
    await expect(page.locator('text=-$8,000')).toBeVisible();
  });

  test('Validates Cash Session Summary aggregation', async ({ page }) => {
    await page.goto('http://localhost:5173/admin/cashier-summary');
    
    await expect(page.locator('text=Efectivo Físico Esperado')).toBeVisible();
    // Verify the mock data from the backend is rendered
    await expect(page.locator('text=$1,250,000')).toBeVisible(); // Total Revenue
    await expect(page.locator('text=$800,000').first()).toBeVisible(); // Efectivo split
  });

});
