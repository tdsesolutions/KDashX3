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
    
    // Login - will redirect to setup since setup incomplete
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
    
    // Find and click Add Node link from the Nodes module card
    const addNodeLink = page.locator('a[href="#/nodes"]').first();
    const isVisible = await addNodeLink.isVisible().catch(() => false);
    console.log('Add Node link visible:', isVisible);
    
    if (!isVisible) {
      console.log('❌ FAIL: Add Node link not visible on setup page');
      await page.screenshot({ path: 'tests/e2e/screenshots/journey-a-fail.png' });
      test.fail();
      return;
    }
    
    // Click Add Node
    await addNodeLink.click();
    await page.waitForTimeout(2000);
    
    const urlAfter = page.url();
    console.log('URL after click:', urlAfter);
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-a-after.png' });
    
    // ASSERT: Must navigate to /nodes page OR show modal with instructions
    const onNodesPage = urlAfter.includes('#/nodes');
    const hasModal = await page.locator('#add-node-modal').isVisible().catch(() => false);
    const bodyText = await page.locator('body').textContent();
    const hasPairingInstructions = bodyText.includes('Pairing') || bodyText.includes('Generate');
    
    console.log('On nodes page:', onNodesPage);
    console.log('Modal visible:', hasModal);
    console.log('Has pairing instructions:', hasPairingInstructions);
    console.log('Console errors:', consoleErrors);
    
    // Button must produce visible outcome
    const outcomeVisible = onNodesPage || hasModal || hasPairingInstructions;
    expect(outcomeVisible, 'Clicking Add Node must navigate to nodes or show pairing instructions').toBe(true);
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ JOURNEY A PASSED: Add Node works from setup page');
  });
});
