const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('JOURNEY C: Routing - Configure from setup page', () => {
  test('Clicking Configure shows routing instructions', async ({ page }) => {
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
    
    // Login - now redirects to dashboard
    console.log('Logging in...');
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    await page.fill('#login-email', 'user@example.com');
    await page.fill('#login-password', 'securepass123');
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
    
    // Should be on dashboard
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    expect(currentUrl).toContain('#/dashboard');
    
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-c-before.png' });
    
    // Navigate to setup page
    await page.goto(`${BASE_URL}/#/setup`);
    await page.waitForTimeout(2000);
    
    // The setup page shows all modules including Routing
    const bodyText = await page.locator('body').textContent();
    const hasRoutingModule = bodyText.includes('Routing') && bodyText.includes('Set routing rules');
    console.log('Has routing module:', hasRoutingModule);
    expect(hasRoutingModule, 'Setup page should show Routing module').toBe(true);
    
    // Find and click Configure BUTTON (not link anymore)
    const configureBtn = page.locator('button:has-text("Configure")').filter({ hasText: 'Configure' }).first();
    const isVisible = await configureBtn.isVisible().catch(() => false);
    console.log('Configure button visible:', isVisible);
    expect(isVisible, 'Configure button should be visible').toBe(true);
    
    // Click Configure
    await configureBtn.click();
    await page.waitForTimeout(2000);
    
    const urlAfter = page.url();
    console.log('URL after click:', urlAfter);
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-c-after.png' });
    
    // Check for routing-related content (instructions panel should be visible)
    const bodyTextAfter = await page.locator('body').textContent();
    const showsRoutingInstructions = bodyTextAfter.includes('Routing') && (bodyTextAfter.includes('Rules') || bodyTextAfter.includes('How Routing Works'));
    const showsGating = bodyTextAfter.includes('Connect a node') || bodyTextAfter.includes('requires at least one node');
    
    console.log('Shows routing instructions:', showsRoutingInstructions);
    console.log('Shows gating:', showsGating);
    console.log('Console errors:', consoleErrors);
    
    // Must show routing-related UI
    const validOutcome = showsRoutingInstructions || showsGating;
    expect(validOutcome, 'Clicking Configure must show routing instructions').toBe(true);
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ JOURNEY C PASSED');
  });
});
