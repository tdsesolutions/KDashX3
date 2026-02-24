const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('COMPLETE AUDIT', () => {
  
  test('All setup buttons navigate correctly', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ ERROR:', msg.text());
      }
    });
    
    // Login
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.fill('#login-email', 'user@example.com');
    await page.fill('#login-password', 'securepass123');
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
    
    // Test Workspace button
    console.log('Testing Workspace button...');
    await page.goto(`${BASE_URL}/#/setup`);
    await page.waitForTimeout(2000);
    await page.locator('a[href="#/setup/workspace"]').click();
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('#/setup/workspace');
    expect(await page.locator('body').textContent()).toContain('Organization Name');
    await page.screenshot({ path: 'tests/e2e/screenshots/audit-workspace.png' });
    
    // Test Storage button
    console.log('Testing Storage button...');
    await page.goto(`${BASE_URL}/#/setup`);
    await page.waitForTimeout(2000);
    await page.locator('a[href="#/setup/storage"]').click();
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('#/setup/storage');
    expect(await page.locator('body').textContent()).toContain('Storage');
    await page.screenshot({ path: 'tests/e2e/screenshots/audit-storage.png' });
    
    // Test Health Checks button
    console.log('Testing Health Checks button...');
    await page.goto(`${BASE_URL}/#/setup`);
    await page.waitForTimeout(2000);
    await page.locator('a[href="#/setup/health"]').click();
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('#/setup/health');
    expect(await page.locator('body').textContent()).toContain('Health');
    await page.screenshot({ path: 'tests/e2e/screenshots/audit-health.png' });
    
    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ COMPLETE AUDIT PASSED');
  });
  
});
