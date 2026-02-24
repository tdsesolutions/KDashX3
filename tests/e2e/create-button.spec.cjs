const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test('Test Create button on Workspace form', async ({ page }) => {
  const consoleErrors = [];
  const consoleWarnings = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push(text);
      console.log('❌ CONSOLE ERROR:', text);
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(text);
      console.log('⚠️ CONSOLE WARNING:', text);
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(`Page error: ${error.message}`);
    console.log('❌ PAGE ERROR:', error.message);
  });
  
  // Step 1: Login
  console.log('Step 1: Login');
  await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.fill('#login-email', 'user@example.com');
  await page.fill('#login-password', 'securepass123');
  await page.click('#login-btn');
  await page.waitForTimeout(3000);
  
  // Step 2: Go directly to workspace form
  console.log('Step 2: Navigate to workspace form');
  await page.goto(`${BASE_URL}/#/setup/workspace`);
  await page.waitForTimeout(3000);
  
  // Verify page loaded
  const url = page.url();
  console.log('URL:', url);
  expect(url).toContain('#/setup/workspace');
  
  const pageText = await page.locator('body').textContent();
  console.log('Page contains "Create Workspace":', pageText.includes('Create Workspace'));
  expect(pageText).toContain('Create Workspace');
  
  await page.screenshot({ path: 'tests/e2e/screenshots/workspace-form-before.png' });
  
  // Step 3: Fill in organization name
  console.log('Step 3: Fill form');
  await page.fill('#org-name', 'Test Organization');
  
  // Step 4: Click Create button (Save & Continue)
  console.log('Step 4: Click Save & Continue button');
  const saveButton = page.locator('button:has-text("Save & Continue"), button:has-text("Create")').first();
  await expect(saveButton).toBeVisible();
  await saveButton.click();
  
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'tests/e2e/screenshots/workspace-form-after.png' });
  
  // Step 5: Check no errors
  console.log('Step 5: Check for errors');
  console.log('Console Errors:', consoleErrors);
  console.log('Console Warnings:', consoleWarnings);
  
  expect(consoleErrors).toHaveLength(0);
  
  // Verify navigation back to setup
  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);
  expect(finalUrl).toContain('#/setup');
  
  console.log('✅ TEST PASSED');
});
