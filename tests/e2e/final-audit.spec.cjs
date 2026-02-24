const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test('FINAL AUDIT: Setup buttons work correctly', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('❌ CONSOLE ERROR:', msg.text());
    }
  });
  
  // Step 1: Login
  console.log('Step 1: Login');
  await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await page.fill('#login-email', 'user@example.com');
  await page.fill('#login-password', 'securepass123');
  await page.click('#login-btn');
  await page.waitForTimeout(3000);
  
  // Step 2: Go to setup
  console.log('Step 2: Navigate to setup');
  await page.goto(`${BASE_URL}/#/setup`);
  await page.waitForTimeout(3000);
  
  // Check URL
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  expect(currentUrl).toContain('#/setup');
  
  // Verify we're on setup page
  const pageText = await page.locator('body').textContent();
  expect(pageText).toContain('Setup Progress');
  await page.screenshot({ path: 'tests/e2e/screenshots/01-setup-page.png' });
  
  // Step 3: Click Workspace button using direct href
  console.log('Step 3: Click Workspace button');
  
  // Find the workspace button by looking for the "Create" link in the Workspace row
  const workspaceLink = page.locator('a[href="#/setup/workspace"]');
  const count = await workspaceLink.count();
  console.log('Found', count, 'links to workspace');
  
  if (count > 0) {
    await workspaceLink.first().click();
  } else {
    // Try clicking by text
    const workspaceBtn = page.getByRole('link', { name: /create/i }).first();
    await workspaceBtn.click();
  }
  
  await page.waitForTimeout(3000);
  
  // Check URL changed
  const workspaceUrl = page.url();
  console.log('URL after click:', workspaceUrl);
  
  // Screenshot for debugging
  await page.screenshot({ path: 'tests/e2e/screenshots/02-after-click.png' });
  
  expect(workspaceUrl).toContain('#/setup/workspace');
  
  // Check page has workspace form content
  const workspaceText = await page.locator('body').textContent();
  console.log('Page contains "Organization Name":', workspaceText.includes('Organization Name'));
  
  expect(workspaceText).toContain('Organization Name');
  
  // Verify no console errors
  expect(consoleErrors).toHaveLength(0);
  
  console.log('✅ FINAL AUDIT PASSED');
});
