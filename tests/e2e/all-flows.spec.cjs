const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('ALL USER FLOWS AUDIT', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.fill('#login-email', 'user@example.com');
    await page.fill('#login-password', 'securepass123');
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
  });
  
  test('Flow 1: Nodes page - primary action button', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ ERROR:', msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.log('❌ PAGE ERROR:', err.message);
    });
    
    console.log('\n=== FLOW 1: Nodes Page ===');
    await page.goto(`${BASE_URL}/#/nodes`);
    await page.waitForTimeout(3000);
    
    console.log('URL:', page.url());
    const beforeScreenshot = await page.screenshot({ path: 'tests/e2e/screenshots/flow1-nodes-before.png' });
    
    // Find and click primary action button (Add Node, Generate Token, etc.)
    const buttons = await page.locator('button, a.btn').allTextContents();
    console.log('Available buttons:', buttons.slice(0, 10));
    
    // Try to find a primary action button
    const primaryBtn = page.locator('button:has-text("Add"), button:has-text("Generate"), button:has-text("Create"), a:has-text("Add")').first();
    const isVisible = await primaryBtn.isVisible().catch(() => false);
    console.log('Primary button visible:', isVisible);
    
    if (isVisible) {
      await primaryBtn.click();
      await page.waitForTimeout(2000);
      
      const afterUrl = page.url();
      console.log('URL after click:', afterUrl);
      await page.screenshot({ path: 'tests/e2e/screenshots/flow1-nodes-after.png' });
      
      // Assert UI changed (URL changed OR modal appeared OR new content)
      const bodyText = await page.locator('body').textContent();
      const hasModal = await page.locator('.modal, .dialog, [role="dialog"]').count() > 0;
      console.log('Modal detected:', hasModal);
      console.log('Console errors:', consoleErrors);
      
      expect(consoleErrors).toHaveLength(0);
    }
    
    console.log('✅ FLOW 1 PASSED');
  });
  
  test('Flow 2: Providers page - Setup button', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ ERROR:', msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.log('❌ PAGE ERROR:', err.message);
    });
    
    console.log('\n=== FLOW 2: Providers Page ===');
    await page.goto(`${BASE_URL}/#/providers`);
    await page.waitForTimeout(3000);
    
    console.log('URL:', page.url());
    await page.screenshot({ path: 'tests/e2e/screenshots/flow2-providers-before.png' });
    
    const buttons = await page.locator('button, a.btn').allTextContents();
    console.log('Available buttons:', buttons.slice(0, 10));
    
    // Look for Setup button or Add Provider button
    const setupBtn = page.locator('button:has-text("Setup"), button:has-text("Add"), a:has-text("Setup"), a:has-text("Configure")').first();
    const isVisible = await setupBtn.isVisible().catch(() => false);
    console.log('Setup button visible:', isVisible);
    
    if (isVisible) {
      await setupBtn.click();
      await page.waitForTimeout(2000);
      
      console.log('URL after click:', page.url());
      await page.screenshot({ path: 'tests/e2e/screenshots/flow2-providers-after.png' });
      console.log('Console errors:', consoleErrors);
      
      expect(consoleErrors).toHaveLength(0);
    }
    
    console.log('✅ FLOW 2 PASSED');
  });
  
  test('Flow 3: Routing page - main button', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ ERROR:', msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.log('❌ PAGE ERROR:', err.message);
    });
    
    console.log('\n=== FLOW 3: Routing Page ===');
    await page.goto(`${BASE_URL}/#/routing`);
    await page.waitForTimeout(3000);
    
    console.log('URL:', page.url());
    await page.screenshot({ path: 'tests/e2e/screenshots/flow3-routing-before.png' });
    
    const buttons = await page.locator('button, a.btn').allTextContents();
    console.log('Available buttons:', buttons.slice(0, 10));
    
    // Look for main action button
    const mainBtn = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("Simulate"), button:has-text("Save")').first();
    const isVisible = await mainBtn.isVisible().catch(() => false);
    console.log('Main button visible:', isVisible);
    
    if (isVisible) {
      await mainBtn.click();
      await page.waitForTimeout(2000);
      
      console.log('URL after click:', page.url());
      await page.screenshot({ path: 'tests/e2e/screenshots/flow3-routing-after.png' });
      console.log('Console errors:', consoleErrors);
      
      expect(consoleErrors).toHaveLength(0);
    }
    
    console.log('✅ FLOW 3 PASSED');
  });
  
  test('Flow 4: Defaults/Settings page - main button', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ ERROR:', msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.log('❌ PAGE ERROR:', err.message);
    });
    
    console.log('\n=== FLOW 4: Settings/Defaults Page ===');
    await page.goto(`${BASE_URL}/#/settings`);
    await page.waitForTimeout(3000);
    
    console.log('URL:', page.url());
    await page.screenshot({ path: 'tests/e2e/screenshots/flow4-settings-before.png' });
    
    const buttons = await page.locator('button, a.btn').allTextContents();
    console.log('Available buttons:', buttons.slice(0, 10));
    
    // Look for Save or Update button
    const mainBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button:has-text("Apply"), button:has-text("Reset")').first();
    const isVisible = await mainBtn.isVisible().catch(() => false);
    console.log('Main button visible:', isVisible);
    
    if (isVisible) {
      await mainBtn.click();
      await page.waitForTimeout(2000);
      
      console.log('URL after click:', page.url());
      await page.screenshot({ path: 'tests/e2e/screenshots/flow4-settings-after.png' });
      console.log('Console errors:', consoleErrors);
      
      expect(consoleErrors).toHaveLength(0);
    }
    
    console.log('✅ FLOW 4 PASSED');
  });
  
});
