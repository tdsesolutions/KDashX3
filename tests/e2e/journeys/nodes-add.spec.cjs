const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('JOURNEY A: Nodes - Add Node Button from Setup', () => {
  test('Click Add Node from setup page and assert pairing instructions appear', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ CONSOLE ERROR:', msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.log('❌ PAGE ERROR:', err.message);
    });
    
    // Login - will redirect to setup
    console.log('Logging in (will redirect to setup)...');
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    await page.fill('#login-email', 'user@example.com');
    await page.fill('#login-password', 'securepass123');
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
    
    // Should be on setup page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    expect(currentUrl).toContain('#/setup');
    
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-a-before.png' });
    
    // Find and click Add Node BUTTON (not link anymore)
    const addNodeBtn = page.locator('button:has-text("Add Node")').first();
    const isVisible = await addNodeBtn.isVisible().catch(() => false);
    console.log('Add Node button visible:', isVisible);
    
    if (!isVisible) {
      console.log('❌ FAIL: Add Node button not visible on setup page');
      await page.screenshot({ path: 'tests/e2e/screenshots/journey-a-fail.png' });
      test.fail();
      return;
    }
    
    // Click Add Node
    await addNodeBtn.click();
    await page.waitForTimeout(2000);
    
    const urlAfter = page.url();
    console.log('URL after click:', urlAfter);
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-a-after.png' });
    
    // ASSERT: Instructions panel must appear (contains pairing info)
    const bodyText = await page.locator('body').textContent();
    const hasPairingInstructions = bodyText.includes('Pairing') || bodyText.includes('How to Add a Node') || bodyText.includes('install.sh');
    
    console.log('Has pairing instructions:', hasPairingInstructions);
    console.log('Console errors:', consoleErrors);
    
    // Button must produce visible outcome (instructions shown)
    expect(hasPairingInstructions, 'Clicking Add Node must show pairing instructions').toBe(true);
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ JOURNEY A PASSED: Pairing instructions panel opened');
  });
});
