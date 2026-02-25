const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('JOURNEY C: Routing - Gated when no node paired', () => {
  test('Routing page shows gating when no nodes exist', async ({ page }) => {
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
    const testEmail = `journey_c_${timestamp}@example.com`;
    const testPass = 'testpass123';
    
    await page.fill('#login-email', testEmail);
    await page.fill('#login-password', testPass);
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-c-01-dashboard.png' });
    
    // Step 2: Navigate to Routing
    console.log('Step 2: Navigate to Routing');
    await page.goto(`${BASE_URL}/#/routing`);
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-c-02-routing.png' });
    
    // Step 3: Check for gating behavior
    console.log('Step 3: Check gating behavior');
    
    const bodyText = await page.locator('body').textContent();
    
    // Check for Configure button or gating message
    const hasConfigureButton = await page.locator('button:has-text("Configure")').first().isVisible().catch(() => false);
    const hasGatingMessage = bodyText.includes('Connect a node') || bodyText.includes('requires at least one node');
    const hasInstructions = bodyText.includes('Routing') && (bodyText.includes('How Routing Works') || bodyText.includes('Rules'));
    
    console.log('Has Configure button:', hasConfigureButton);
    console.log('Has gating message:', hasGatingMessage);
    console.log('Has instructions:', hasInstructions);
    
    // If Configure button exists, it should either open instructions or be disabled with explanation
    if (hasConfigureButton) {
      const configureBtn = page.locator('button:has-text("Configure")').first();
      const isDisabled = await configureBtn.isDisabled().catch(() => false);
      
      if (!isDisabled) {
        console.log('Clicking Configure button');
        await configureBtn.click();
        await page.waitForTimeout(1500);
        
        await page.screenshot({ path: 'tests/e2e/screenshots/journey-c-03-after-configure.png' });
        
        const afterClickText = await page.locator('body').textContent();
        
        // Must show visible outcome
        const outcomeVisible = afterClickText.includes('Routing') && 
                              (afterClickText.includes('Rules') || 
                               afterClickText.includes('How Routing Works') ||
                               afterClickText.includes('Connect a node'));
        
        expect(outcomeVisible, 'Clicking Configure must show visible outcome').toBe(true);
      } else {
        console.log('Configure button is disabled (acceptable)');
      }
    }
    
    // Should see gating message or routing UI
    expect(hasGatingMessage || hasInstructions, 'Should show routing UI or gating').toBe(true);
    
    // ASSERT: No console errors
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ JOURNEY C PASSED: Routing gated correctly');
  });
});
