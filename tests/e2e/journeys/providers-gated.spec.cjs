const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('JOURNEY B: Providers - Setup from setup page', () => {
  test('Clicking Setup shows providers instructions', async ({ page }) => {
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
    
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-b-before.png' });
    
    // Navigate to setup page
    await page.goto(`${BASE_URL}/#/setup`);
    await page.waitForTimeout(2000);
    
    // The setup page shows all modules including Providers
    const bodyText = await page.locator('body').textContent();
    const hasProvidersModule = bodyText.includes('Providers') && bodyText.includes('Configure LLM providers');
    console.log('Has providers module:', hasProvidersModule);
    expect(hasProvidersModule, 'Setup page should show Providers module').toBe(true);
    
    // Find and click Setup BUTTON (not link anymore)
    const setupBtn = page.locator('button:has-text("Setup")').first();
    const isVisible = await setupBtn.isVisible().catch(() => false);
    console.log('Setup button visible:', isVisible);
    expect(isVisible, 'Setup button should be visible').toBe(true);
    
    // Click Setup
    await setupBtn.click();
    await page.waitForTimeout(2000);
    
    const urlAfter = page.url();
    console.log('URL after click:', urlAfter);
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-b-after.png' });
    
    // Check for providers-related content (instructions panel should be visible)
    const bodyTextAfter = await page.locator('body').textContent();
    const showsProvidersInstructions = bodyTextAfter.includes('Provider') && (bodyTextAfter.includes('API Key') || bodyText.includes('How Providers Work'));
    const showsGating = bodyTextAfter.includes('No Nodes') || bodyTextAfter.includes('add at least one node');
    
    console.log('Shows providers instructions:', showsProvidersInstructions);
    console.log('Shows gating:', showsGating);
    console.log('Console errors:', consoleErrors);
    
    // Must show providers-related UI
    const validOutcome = showsProvidersInstructions || showsGating;
    expect(validOutcome, 'Clicking Setup must show providers instructions').toBe(true);
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ JOURNEY B PASSED');
  });
});
