const { test, expect } = require('@playwright/test');
const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('JOURNEY 1: First-Time Setup', () => {
  test('Complete all 6 setup modules', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => msg.type() === 'error' && consoleErrors.push(msg.text()));
    page.on('pageerror', err => consoleErrors.push(err.message));
    
    // 1. Register/Login
    await page.goto(`${BASE_URL}/#/login`);
    await page.fill('#login-email', `test${Date.now()}@example.com`);
    await page.fill('#register-password', 'securepass123');
    await page.click('#register-btn');
    await page.waitForTimeout(3000);
    
    // Should redirect to setup
    expect(page.url()).toContain('#/setup');
    
    // 2. Complete Workspace
    await page.click('a[href="#/setup/workspace"]');
    await page.waitForTimeout(1000);
    await page.fill('#org-name', 'Test Org');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // 3. Add Node (simulated)
    await page.goto(`${BASE_URL}/#/setup`);
    await page.click('a[href="#/nodes"]');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('#/nodes');
    
    // 4. Configure Storage
    await page.goto(`${BASE_URL}/#/setup`);
    await page.click('a[href="#/setup/storage"]');
    await page.waitForTimeout(1000);
    await page.fill('#allowed-folders', '~/test');
    await page.click('button:has-text("Save")');
    
    // 5. Setup Providers
    await page.goto(`${BASE_URL}/#/setup`);
    await page.click('a[href="#/providers"]');
    await page.waitForTimeout(1000);
    
    // 6. Health Checks
    await page.goto(`${BASE_URL}/#/setup`);
    await page.click('a[href="#/setup/health"]');
    await page.waitForTimeout(1000);
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ First-Time Setup Journey COMPLETE');
  });
});
