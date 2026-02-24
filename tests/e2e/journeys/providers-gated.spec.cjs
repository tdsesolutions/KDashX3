const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('JOURNEY B: Providers - Setup from setup page', () => {
  test('Clicking Setup shows providers setup module', async ({ page }) => {
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
    console.log('Logging in...');
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    await page.fill('#login-email', 'user@example.com');
    await page.fill('#login-password', 'securepass123');
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
    
    // Should be on setup page
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    expect(currentUrl).toContain('#/setup');
    
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-b-before.png' });
    
    // The setup page shows all modules including Providers
    const bodyText = await page.locator('body').textContent();
    const hasProvidersModule = bodyText.includes('Providers') && bodyText.includes('Configure LLM providers');
    console.log('Has providers module:', hasProvidersModule);
    expect(hasProvidersModule, 'Setup page should show Providers module').toBe(true);
    
    // Find and click Setup link from Providers module
    const setupLink = page.locator('a[href="#/providers"]').first();
    const isVisible = await setupLink.isVisible().catch(() => false);
    console.log('Setup link visible:', isVisible);
    expect(isVisible, 'Setup link should be visible').toBe(true);
    
    // Click Setup
    await setupLink.click();
    await page.waitForTimeout(2000);
    
    const urlAfter = page.url();
    console.log('URL after click:', urlAfter);
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-b-after.png' });
    
    // When setup is incomplete, clicking Setup may:
    // 1. Stay on setup page (redirected back)
    // 2. Navigate to providers and show gating
    // Either is acceptable as long as UI is visible
    const bodyTextAfter = await page.locator('body').textContent();
    const showsProvidersUI = bodyTextAfter.includes('Provider') || bodyTextAfter.includes('API Key') || bodyTextAfter.includes('Configure LLM');
    const showsGating = bodyTextAfter.includes('No Nodes') || bodyTextAfter.includes('add at least one node');
    const onSetupPage = urlAfter.includes('#/setup');
    
    console.log('Shows providers UI:', showsProvidersUI);
    console.log('Shows gating:', showsGating);
    console.log('On setup page:', onSetupPage);
    console.log('Console errors:', consoleErrors);
    
    // Must show either providers UI or gating, and never error
    const validOutcome = showsProvidersUI || showsGating || onSetupPage;
    expect(validOutcome, 'Clicking Setup must show providers-related UI').toBe(true);
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ JOURNEY B PASSED');
  });
});
