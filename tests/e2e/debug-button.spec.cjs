const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test('Debug button finding', async ({ page }) => {
  // Login
  await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.fill('#login-email', 'user@example.com');
  await page.fill('#login-password', 'securepass123');
  await page.click('#login-btn');
  await page.waitForTimeout(3000);
  
  // Go to setup (where Add Node button should be)
  await page.goto(`${BASE_URL}/#/setup`);
  await page.waitForTimeout(3000);
  
  console.log('URL:', page.url());
  
  // Get all buttons
  const allButtons = await page.locator('button, a').all();
  console.log('Total buttons/links:', allButtons.length);
  
  for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
    const text = await allButtons[i].textContent();
    const tag = await allButtons[i].evaluate(el => el.tagName);
    console.log(`${i}: <${tag}> ${text?.trim().slice(0, 30)}`);
  }
  
  // Try finding Add Node
  const addNodeBtn1 = page.locator('button:has-text("Add Node")');
  const addNodeBtn2 = page.locator('a:has-text("Add Node")');
  const addNodeBtn3 = page.locator('text=Add Node');
  
  console.log('Button count (button):', await addNodeBtn1.count());
  console.log('Button count (a):', await addNodeBtn2.count());
  console.log('Button count (text):', await addNodeBtn3.count());
  
  await page.screenshot({ path: 'tests/e2e/screenshots/debug-buttons.png' });
});
