const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('JOURNEY B: Providers - Gated when no node paired', () => {
  test('Providers page shows gating when no nodes exist', async ({ page }) => {
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
    
    // Step 1: Login as fresh user (no nodes)
    console.log('Step 1: Login as fresh user');
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    
    const timestamp = Date.now();
    const testEmail = `journey_b_${timestamp}@example.com`;
    const testPass = 'testpass123';
    
    await page.fill('#login-email', testEmail);
    await page.fill('#login-password', testPass);
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-b-01-dashboard.png' });
    
    // Step 2: Navigate to Providers
    console.log('Step 2: Navigate to Providers');
    await page.goto(`${BASE_URL}/#/providers`);
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-b-02-providers.png' });
    
    // Step 3: Check for gating behavior
    console.log('Step 3: Check gating behavior');
    
    const bodyText = await page.locator('body').textContent();
    
    // Either we see a "Setup" button that opens instructions when clicked
    // OR we see inline gating message
    const hasSetupButton = await page.locator('button:has-text("Setup"), a:has-text("Setup")').first().isVisible().catch(() => false);
    const hasGatingMessage = bodyText.includes('No Nodes') || bodyText.includes('add a node') || bodyText.includes('pair a node');
    const hasInstructions = bodyText.includes('How to Add a Node') || bodyText.includes('connector.js');
    
    console.log('Has Setup button:', hasSetupButton);
    console.log('Has gating message:', hasGatingMessage);
    console.log('Has instructions:', hasInstructions);
    
    // If there's a Setup button, click it and verify it produces visible outcome
    if (hasSetupButton) {
      console.log('Clicking Setup button');
      await page.locator('button:has-text("Setup"), a:has-text("Setup")').first().click();
      await page.waitForTimeout(1500);
      
      await page.screenshot({ path: 'tests/e2e/screenshots/journey-b-03-after-setup-click.png' });
      
      const afterClickText = await page.locator('body').textContent();
      
      // Button must produce visible outcome
      const outcomeVisible = afterClickText.includes('Providers') && 
                            (afterClickText.includes('API Key') || 
                             afterClickText.includes('How Providers Work') ||
                             afterClickText.includes('add at least one node'));
      
      expect(outcomeVisible, 'Clicking Setup must show visible outcome').toBe(true);
    } else {
      // Should see gating inline
      expect(hasGatingMessage || hasInstructions, 'Should show gating when no nodes').toBe(true);
    }
    
    // ASSERT: No console errors
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ JOURNEY B PASSED: Providers gated correctly');
  });
});
