const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';
const TEST_EMAIL = 'user@example.com';
const TEST_PASSWORD = 'securepass123';

test.describe('Setup Page Interactive Audit', () => {
  
  test('Full audit: Login -> Setup -> Click buttons', async ({ page }) => {
    const consoleErrors = [];
    const consoleWarnings = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
        console.log('❌ CONSOLE ERROR:', text);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
        console.log('⚠️ CONSOLE WARNING:', text);
      }
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(`Page error: ${error.message}`);
      console.log('❌ PAGE ERROR:', error.message);
    });
    
    // Step 1: Navigate to login
    console.log('\n=== STEP 1: Navigate to login ===');
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const loginTitle = await page.locator('h1').textContent();
    console.log('Login page H1:', loginTitle);
    await page.screenshot({ path: 'tests/e2e/screenshots/01-login.png' });
    
    // Step 2: Log in
    console.log('\n=== STEP 2: Log in ===');
    await page.fill('#login-email', TEST_EMAIL);
    await page.fill('#login-password', TEST_PASSWORD);
    await page.click('#login-btn');
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    const urlAfterLogin = page.url();
    console.log('URL after login:', urlAfterLogin);
    await page.screenshot({ path: 'tests/e2e/screenshots/02-after-login.png' });
    
    // Step 3: Check if we're on setup page
    console.log('\n=== STEP 3: Verify setup page ===');
    const currentH1 = await page.locator('h1').first().textContent().catch(() => 'No H1');
    console.log('Current H1:', currentH1);
    
    if (!currentH1.includes('Setup')) {
      console.log('Not on setup page, navigating there...');
      await page.goto(`${BASE_URL}/#/setup`);
      await page.waitForTimeout(2000);
    }
    
    const setupH1 = await page.locator('h1').first().textContent();
    console.log('Setup page H1:', setupH1);
    expect(setupH1).toContain('Setup');
    await page.screenshot({ path: 'tests/e2e/screenshots/03-setup-center.png' });
    
    // Step 4: Find and click Workspace button
    console.log('\n=== STEP 4: Click Workspace button ===');
    const workspaceRow = page.locator('.module-row', { hasText: 'Workspace' });
    const workspaceButton = workspaceRow.locator('a:has-text("Create"), button:has-text("Create")');
    
    const isWorkspaceVisible = await workspaceButton.isVisible().catch(() => false);
    console.log('Workspace button visible:', isWorkspaceVisible);
    expect(isWorkspaceVisible).toBe(true);
    
    await workspaceButton.click();
    await page.waitForTimeout(2000);
    
    const workspaceUrl = page.url();
    console.log('URL after Workspace click:', workspaceUrl);
    console.log('Expected URL to contain: #/setup/workspace');
    
    const workspaceHeading = await page.locator('h1').first().textContent();
    console.log('Heading after click:', workspaceHeading);
    
    await page.screenshot({ path: 'tests/e2e/screenshots/04-workspace-form.png' });
    
    // Verify navigation worked
    expect(workspaceUrl).toContain('#/setup/workspace');
    expect(workspaceHeading).toContain('Create');
    
    // Step 5: Go back and test Storage
    console.log('\n=== STEP 5: Click Storage button ===');
    await page.goto(`${BASE_URL}/#/setup`);
    await page.waitForTimeout(1500);
    
    const storageRow = page.locator('.module-row', { hasText: 'Storage' });
    const storageButton = storageRow.locator('a:has-text("Configure"), button:has-text("Configure")');
    
    const isStorageVisible = await storageButton.isVisible().catch(() => false);
    console.log('Storage button visible:', isStorageVisible);
    expect(isStorageVisible).toBe(true);
    
    await storageButton.click();
    await page.waitForTimeout(2000);
    
    const storageUrl = page.url();
    console.log('URL after Storage click:', storageUrl);
    
    const storageHeading = await page.locator('h1').first().textContent();
    console.log('Heading after click:', storageHeading);
    
    await page.screenshot({ path: 'tests/e2e/screenshots/05-storage-form.png' });
    
    expect(storageUrl).toContain('#/setup/storage');
    expect(storageHeading).toContain('Storage');
    
    // Step 6: Go back and test Health Checks
    console.log('\n=== STEP 6: Click Health Checks button ===');
    await page.goto(`${BASE_URL}/#/setup`);
    await page.waitForTimeout(1500);
    
    const healthRow = page.locator('.module-row', { hasText: 'Health' });
    const healthButton = healthRow.locator('a:has-text("Run Checks"), button:has-text("Run Checks")');
    
    const isHealthVisible = await healthButton.isVisible().catch(() => false);
    console.log('Health button visible:', isHealthVisible);
    expect(isHealthVisible).toBe(true);
    
    await healthButton.click();
    await page.waitForTimeout(2000);
    
    const healthUrl = page.url();
    console.log('URL after Health click:', healthUrl);
    
    const healthHeading = await page.locator('h1').first().textContent();
    console.log('Heading after click:', healthHeading);
    
    await page.screenshot({ path: 'tests/e2e/screenshots/06-health-form.png' });
    
    expect(healthUrl).toContain('#/setup/health');
    expect(healthHeading).toContain('Health');
    
    // Final summary
    console.log('\n=== AUDIT SUMMARY ===');
    console.log('Console Errors:', consoleErrors.length, consoleErrors);
    console.log('Console Warnings:', consoleWarnings.length, consoleWarnings);
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ ALL TESTS PASSED');
  });
});
