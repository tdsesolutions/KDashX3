const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('Setup Page Interactive Audit', () => {
  
  test('Setup Center loads without console errors', async ({ page }) => {
    const consoleErrors = [];
    const consoleWarnings = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
      if (msg.type() === 'warning') consoleWarnings.push(msg.text());
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(`Page error: ${error.message}`);
    });
    
    await page.goto(`${BASE_URL}/#/setup`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for SPA to render
    
    // Take screenshot
    await page.screenshot({ path: 'tests/e2e/screenshots/01-setup-center.png', fullPage: true });
    
    console.log('Console Errors:', consoleErrors);
    console.log('Console Warnings:', consoleWarnings);
    
    expect(consoleErrors).toHaveLength(0);
    
    // Verify page loaded
    const heading = await page.locator('h1').textContent();
    expect(heading).toContain('Setup');
  });
  
  test('Workspace button navigates to workspace form', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', error => consoleErrors.push(error.message));
    
    await page.goto(`${BASE_URL}/#/setup`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Find and click Workspace button (looking for "Create" button in Workspace module)
    const workspaceCard = await page.locator('.module-row:has-text("Workspace")');
    const workspaceButton = workspaceCard.locator('a:has-text("Create"), button:has-text("Create")');
    
    if (await workspaceButton.isVisible().catch(() => false)) {
      await workspaceButton.click();
      await page.waitForTimeout(1500);
      
      // Verify navigation
      const url = page.url();
      console.log('URL after Workspace click:', url);
      
      expect(url).toContain('#/setup/workspace');
      
      // Verify workspace form appears
      const workspaceHeading = await page.locator('h1').textContent();
      expect(workspaceHeading).toContain('Workspace');
      
      await page.screenshot({ path: 'tests/e2e/screenshots/02-workspace-form.png', fullPage: true });
    } else {
      console.log('Workspace button not found or not visible');
      await page.screenshot({ path: 'tests/e2e/screenshots/02-workspace-missing.png', fullPage: true });
      test.fail();
    }
    
    expect(consoleErrors).toHaveLength(0);
  });
  
  test('Storage button navigates to storage form', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', error => consoleErrors.push(error.message));
    
    await page.goto(`${BASE_URL}/#/setup`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Find and click Storage button
    const storageCard = await page.locator('.module-row:has-text("Storage")');
    const storageButton = storageCard.locator('a:has-text("Configure"), button:has-text("Configure")');
    
    if (await storageButton.isVisible().catch(() => false)) {
      await storageButton.click();
      await page.waitForTimeout(1500);
      
      const url = page.url();
      console.log('URL after Storage click:', url);
      
      expect(url).toContain('#/setup/storage');
      
      const storageHeading = await page.locator('h1').textContent();
      expect(storageHeading).toContain('Storage');
      
      await page.screenshot({ path: 'tests/e2e/screenshots/03-storage-form.png', fullPage: true });
    } else {
      console.log('Storage button not found or not visible');
      await page.screenshot({ path: 'tests/e2e/screenshots/03-storage-missing.png', fullPage: true });
      test.fail();
    }
    
    expect(consoleErrors).toHaveLength(0);
  });
  
  test('Health Checks button navigates to health page', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', error => consoleErrors.push(error.message));
    
    await page.goto(`${BASE_URL}/#/setup`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Find and click Health Checks button
    const healthCard = await page.locator('.module-row:has-text("Health")');
    const healthButton = healthCard.locator('a:has-text("Run Checks"), button:has-text("Run Checks")');
    
    if (await healthButton.isVisible().catch(() => false)) {
      await healthButton.click();
      await page.waitForTimeout(1500);
      
      const url = page.url();
      console.log('URL after Health Checks click:', url);
      
      expect(url).toContain('#/setup/health');
      
      const healthHeading = await page.locator('h1').textContent();
      expect(healthHeading).toContain('Health');
      
      await page.screenshot({ path: 'tests/e2e/screenshots/04-health-checks.png', fullPage: true });
    } else {
      console.log('Health button not found or not visible');
      await page.screenshot({ path: 'tests/e2e/screenshots/04-health-missing.png', fullPage: true });
      test.fail();
    }
    
    expect(consoleErrors).toHaveLength(0);
  });
  
  test('Direct workspace URL loads form', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', error => consoleErrors.push(error.message));
    
    await page.goto(`${BASE_URL}/#/setup/workspace`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const heading = await page.locator('h1').textContent();
    expect(heading).toContain('Workspace');
    
    // Check for form elements
    const orgNameInput = await page.locator('input#org-name').isVisible().catch(() => false);
    expect(orgNameInput).toBe(true);
    
    await page.screenshot({ path: 'tests/e2e/screenshots/05-direct-workspace.png', fullPage: true });
    
    expect(consoleErrors).toHaveLength(0);
  });
});
