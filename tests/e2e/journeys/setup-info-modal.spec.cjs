const { test, expect } = require('@playwright/test');

test('Setup page - Click ℹ️ icon opens node info modal', async ({ page }) => {
  // Login
  await page.goto('https://tdsesolutions.github.io/KDashX3/#/login');
  await page.fill('#login-email', 'test_setup_info@example.com');
  await page.fill('#login-password', 'testpass123');
  await page.click('#login-btn');
  await page.waitForTimeout(3000);
  
  // Go to setup
  await page.goto('https://tdsesolutions.github.io/KDashX3/#/setup');
  await page.waitForTimeout(2000);
  
  console.log('Setup page URL:', page.url());
  
  // Find and click the ℹ️ icon on the Nodes module
  const infoBtn = page.locator('button[title="What is a Node?"]').first();
  await expect(infoBtn).toBeVisible({ timeout: 5000 });
  console.log('ℹ️ button is visible');
  
  await infoBtn.click();
  await page.waitForTimeout(1000);
  
  // Check if modal is visible
  const modal = page.locator('#setup-node-info-modal');
  const isVisible = await modal.isVisible();
  console.log('Modal visible after click:', isVisible);
  
  // Take screenshot
  await page.screenshot({ path: 'tests/e2e/screenshots/setup-info-modal-test.png' });
  
  expect(isVisible).toBe(true);
});
