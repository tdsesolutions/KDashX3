const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test('Test Add Nodes button', async ({ page }) => {
  const consoleErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('❌ CONSOLE ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(`Page error: ${error.message}`);
    console.log('❌ PAGE ERROR:', error.message);
  });
  
  // Login
  await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.fill('#login-email', 'user@example.com');
  await page.fill('#login-password', 'securepass123');
  await page.click('#login-btn');
  await page.waitForTimeout(3000);
  
  // Go to setup
  await page.goto(`${BASE_URL}/#/setup`);
  await page.waitForTimeout(2000);
  
  // Click Add Node button
  console.log('Clicking Add Node button...');
  const addNodeBtn = page.locator('a[href="#/nodes"], button:has-text("Add Node")').first();
  await expect(addNodeBtn).toBeVisible();
  await addNodeBtn.click();
  await page.waitForTimeout(2000);
  
  const url = page.url();
  console.log('URL after click:', url);
  await page.screenshot({ path: 'tests/e2e/screenshots/nodes-page.png' });
  
  // Check no errors
  console.log('Console Errors:', consoleErrors);
  expect(consoleErrors).toHaveLength(0);
  
  // Verify we're on nodes page
  expect(url).toContain('#/nodes');
  
  console.log('✅ ADD NODES TEST PASSED');
});
