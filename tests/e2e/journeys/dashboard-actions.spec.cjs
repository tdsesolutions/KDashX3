const { test, expect } = require('@playwright/test');
const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('JOURNEY 5: Dashboard Core Actions', () => {
  test('Navigate dashboard and view status', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => msg.type() === 'error' && consoleErrors.push(msg.text()));
    
    // Login
    await page.goto(`${BASE_URL}/#/login`);
    await page.fill('#login-email', 'user@example.com');
    await page.fill('#login-password', 'securepass123');
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
    
    // Dashboard
    await page.goto(`${BASE_URL}/#/dashboard`);
    await page.waitForTimeout(2000);
    const dashboardText = await page.locator('body').textContent();
    expect(dashboardText).toContain('Dashboard');
    
    // Settings
    await page.goto(`${BASE_URL}/#/settings`);
    await page.waitForTimeout(2000);
    const settingsText = await page.locator('body').textContent();
    expect(settingsText).toContain('Settings');
    
    // Routing
    await page.goto(`${BASE_URL}/#/routing`);
    await page.waitForTimeout(2000);
    const routingText = await page.locator('body').textContent();
    expect(routingText).toContain('Routing');
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Dashboard Actions Journey COMPLETE');
  });
});
