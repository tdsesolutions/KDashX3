const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test('Debug Flow 1: Check what happens when navigating to /nodes', async ({ page }) => {
  // Login
  await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.fill('#login-email', 'user@example.com');
  await page.fill('#login-password', 'securepass123');
  await page.click('#login-btn');
  await page.waitForTimeout(3000);
  
  // Try to go to nodes
  console.log('Navigating to /nodes...');
  await page.goto(`${BASE_URL}/#/nodes`);
  await page.waitForTimeout(3000);
  
  const url = page.url();
  const bodyText = await page.locator('body').textContent();
  
  console.log('Final URL:', url);
  console.log('Page contains "Setup":', bodyText.includes('Setup'));
  console.log('Page contains "Nodes":', bodyText.includes('Nodes'));
  console.log('Page contains "Add Node":', bodyText.includes('Add Node'));
  
  await page.screenshot({ path: 'tests/e2e/screenshots/debug-flow1.png' });
});
