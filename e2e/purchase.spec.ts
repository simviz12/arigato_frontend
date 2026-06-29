import { test, expect } from '@playwright/test';

test.describe('Purchase Registration Flow', () => {

  test('ADMIN registers a purchase and stock updates reactively', async ({ page }) => {
    // 1. Log in
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for redirect to inventory
    await expect(page).toHaveURL(/.*\/admin\/inventory/);

    // 2. Locate the first product row
    const firstRow = page.locator('table tbody tr').first();
    const productName = await firstRow.locator('td').nth(0).innerText();
    
    // Extract initial stock from the cell text (e.g. "1000g (1.00 kg)")
    const initialStockText = await firstRow.locator('td').nth(2).innerText();
    const initialStockMatch = initialStockText.match(/^(\d+)g/);
    const initialStock = initialStockMatch ? parseInt(initialStockMatch[1], 10) : 0;

    // 3. Open purchase modal
    await firstRow.locator('button:has-text("Registrar Compra")').click();
    await expect(page.locator('.modal-content')).toBeVisible();

    // 4. Fill form
    await page.selectOption('select', { index: 1 }); // Select first distributor
    await page.fill('input[type="number"]', '500'); // 500 grams
    // Use the formatted money input (typing 15000)
    await page.fill('input[type="text"]', '15000'); 

    // 5. Submit form
    const saveButton = page.locator('button:has-text("Guardar Compra")');
    await saveButton.click();

    // Assert double-click protection: button disables immediately
    await expect(saveButton).toBeDisabled();

    // 6. Verify Modal closes and table updates reactively
    await expect(page.locator('.modal-content')).toBeHidden();

    // Re-evaluate the row's stock value without refreshing
    const newStockExpected = initialStock + 500;
    
    await expect(firstRow.locator('td').nth(2)).toContainText(`${newStockExpected}g`);
  });
});
