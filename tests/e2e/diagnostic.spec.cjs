const { test, expect } = require('@playwright/test');

test('diagnostic: check setup page', async ({ page }) => {
  console.log('Starting test...');
  
  // Capture console logs
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  // Navigate to setup
  console.log('Navigating to setup page...');
  await page.goto('https://tdsesolutions.github.io/KDashX3/#/setup', { waitUntil: 'networkidle' });
  
  console.log('Page loaded, waiting for render...');
  await page.waitForTimeout(3000);
  
  // Get page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Get all h1 text
  const h1Texts = await page.locator('h1').allTextContents();
  console.log('H1 elements:', h1Texts);
  
  // Get all button text
  const buttonTexts = await page.locator('button, a.btn').allTextContents();
  console.log('Buttons found:', buttonTexts.slice(0, 20));
  
  // Screenshot
  await page.screenshot({ path: 'tests/e2e/screenshots/diagnostic.png' });
  console.log('Screenshot saved');
});
