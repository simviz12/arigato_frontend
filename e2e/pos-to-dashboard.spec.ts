import { test, expect } from '@playwright/test';

test.describe('POS to Live Dashboard E2E', () => {

  test('Cashier sale instantly reflects on Admin Live Inventory Dashboard', async ({ page, browser }) => {
    // 1. Open Admin Dashboard in Context 1
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    
    await adminPage.goto('http://localhost:5173/login');
    await adminPage.fill('input[type="text"]', 'admin');
    await adminPage.fill('input[type="password"]', 'password');
    await adminPage.click('button[type="submit"]');
    
    await adminPage.goto('http://localhost:5173/admin/live-inventory');
    
    // Check initial stock for Coca-Cola
    const cokeRow = adminPage.locator('tr:has-text("Coca-Cola 400ml")');
    const initialCokeStockText = await cokeRow.locator('td').nth(3).innerText();
    const initialCokeStock = parseInt(initialCokeStockText.replace(/\D/g, ''), 10);
    
    // 2. Open Cashier POS in Context 2
    const cashierContext = await browser.newContext();
    const cashierPage = await cashierContext.newPage();
    
    await cashierPage.goto('http://localhost:5173/login');
    await cashierPage.fill('input[type="text"]', 'cashier1');
    await cashierPage.fill('input[type="password"]', 'password');
    await cashierPage.click('button[type="submit"]');
    
    await cashierPage.goto('http://localhost:5173/pos'); // Assuming POS route exists for Week 6
    
    // Cashier builds a mixed cart: 2 Costillas BBQ + 3 Coca-Colas
    // Mocking the interaction based on typical POS flow
    await cashierPage.click('button:has-text("Costillas BBQ")');
    await cashierPage.click('button:has-text("Costillas BBQ")');
    await cashierPage.click('button:has-text("Coca-Cola 400ml")');
    await cashierPage.click('button:has-text("Coca-Cola 400ml")');
    await cashierPage.click('button:has-text("Coca-Cola 400ml")');
    
    // Cashier clicks Pay
    await cashierPage.click('button:has-text("Cobrar Efectivo")');
    await cashierPage.waitForSelector('text=Venta Exitosa', { state: 'visible' });

    // 3. Verify Admin Dashboard immediately updates (React Query 30s refetch or SSE)
    // We'll wait up to 35 seconds for the automated refetch to happen
    await expect(async () => {
      const newCokeStockText = await adminPage.locator('tr:has-text("Coca-Cola 400ml") td').nth(3).innerText();
      const newCokeStock = parseInt(newCokeStockText.replace(/\D/g, ''), 10);
      
      // Stock should have decreased by exactly 3
      expect(newCokeStock).toBe(initialCokeStock - 3);
    }).toPass({ timeout: 35000 });
  });
});
