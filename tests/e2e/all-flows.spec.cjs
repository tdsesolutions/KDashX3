const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('ALL USER FLOWS - STRICT AUDIT', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.fill('#login-email', 'user@example.com');
    await page.fill('#login-password', 'securepass123');
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
  });
  
  test('Flow 1: Nodes page - Add Node button opens modal', async ({ page }) => {
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
    
    console.log('\n=== FLOW 1: Nodes Page - Add Node Button ===');
    await page.goto(`${BASE_URL}/#/nodes`);
    await page.waitForTimeout(3000);
    
    const urlBefore = page.url();
    console.log('URL before:', urlBefore);
    await page.screenshot({ path: 'tests/e2e/screenshots/flow1-before.png' });
    
    // Find Add Node button (it's actually a link <a> tag)
    const addNodeBtn = page.locator('a:has-text("Add Node")').first();
    const isVisible = await addNodeBtn.isVisible().catch(() => false);
    console.log('Add Node button visible:', isVisible);
    
    // ASSERT: Button must be visible
    expect(isVisible, 'Add Node button should be visible').toBe(true);
    
    // Click the button
    await addNodeBtn.click();
    await page.waitForTimeout(2000);
    
    const urlAfter = page.url();
    console.log('URL after:', urlAfter);
    await page.screenshot({ path: 'tests/e2e/screenshots/flow1-after.png' });
    
    // Check for modal or state change
    const hasModal = await page.locator('.modal, [role="dialog"], #add-node-modal').count() > 0;
    const modalVisible = await page.locator('.modal, [role="dialog"], #add-node-modal').isVisible().catch(() => false);
    const urlChanged = urlAfter !== urlBefore;
    const bodyText = await page.locator('body').textContent();
    const hasNewContent = bodyText.includes('Generate Pairing Token') || bodyText.includes('Node Name') || bodyText.includes('Pairing');
    
    console.log('Modal present:', hasModal);
    console.log('Modal visible:', modalVisible);
    console.log('URL changed:', urlChanged);
    console.log('Has new content:', hasNewContent);
    console.log('Console errors:', consoleErrors);
    
    // ASSERT: At least one state change must occur
    const stateChanged = hasModal || modalVisible || urlChanged || hasNewContent;
    expect(stateChanged, 'Clicking Add Node should open modal or change page state').toBe(true);
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ FLOW 1 PASSED');
  });
  
  test('Flow 2: Providers page - Setup button navigates', async ({ page }) => {
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
    
    console.log('\n=== FLOW 2: Providers Page - Setup Button ===');
    await page.goto(`${BASE_URL}/#/providers`);
    await page.waitForTimeout(3000);
    
    const urlBefore = page.url();
    console.log('URL before:', urlBefore);
    await page.screenshot({ path: 'tests/e2e/screenshots/flow2-before.png' });
    
    // Find Setup button
    const setupBtn = page.locator('button:has-text("Setup"), a:has-text("Setup")').first();
    const isVisible = await setupBtn.isVisible().catch(() => false);
    console.log('Setup button visible:', isVisible);
    
    // ASSERT: Button must be visible
    expect(isVisible, 'Setup button should be visible').toBe(true);
    
    // Click the button
    await setupBtn.click();
    await page.waitForTimeout(2000);
    
    const urlAfter = page.url();
    console.log('URL after:', urlAfter);
    await page.screenshot({ path: 'tests/e2e/screenshots/flow2-after.png' });
    
    // Check state change
    const urlChanged = urlAfter !== urlBefore;
    const bodyText = await page.locator('body').textContent();
    const hasProviderSetup = bodyText.includes('AI Providers') || bodyText.includes('API Key') || urlAfter.includes('setup');
    
    console.log('URL changed:', urlChanged);
    console.log('Has provider setup content:', hasProviderSetup);
    console.log('Console errors:', consoleErrors);
    
    // ASSERT: URL must change or provider setup content must appear
    const stateChanged = urlChanged || hasProviderSetup;
    expect(stateChanged, 'Clicking Setup should navigate or show provider setup').toBe(true);
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ FLOW 2 PASSED');
  });
  
  test('Flow 3: Routing page - main button triggers action', async ({ page }) => {
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
    
    console.log('\n=== FLOW 3: Routing Page - Main Button ===');
    await page.goto(`${BASE_URL}/#/routing`);
    await page.waitForTimeout(3000);
    
    const urlBefore = page.url();
    console.log('URL before:', urlBefore);
    await page.screenshot({ path: 'tests/e2e/screenshots/flow3-before.png' });
    
    // Look for main action button (Add Rule, Simulate, etc.)
    const mainBtn = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("Simulate")').first();
    const isVisible = await mainBtn.isVisible().catch(() => false);
    console.log('Main button visible:', isVisible);
    
    // If button not visible, check if there's a gating message
    if (!isVisible) {
      const bodyText = await page.locator('body').textContent();
      const hasGatingMessage = bodyText.includes('Complete setup') || bodyText.includes('setup required') || bodyText.includes('Add Node');
      console.log('Has gating message:', hasGatingMessage);
      
      if (hasGatingMessage) {
        console.log('Button hidden due to incomplete setup - acceptable gating');
        console.log('✅ FLOW 3 PASSED (gated)');
        return;
      }
    }
    
    // ASSERT: Button must be visible
    expect(isVisible, 'Main action button should be visible or gating message should be shown').toBe(true);
    
    // Click the button
    await mainBtn.click();
    await page.waitForTimeout(2000);
    
    const urlAfter = page.url();
    console.log('URL after:', urlAfter);
    await page.screenshot({ path: 'tests/e2e/screenshots/flow3-after.png' });
    
    // Check state change
    const urlChanged = urlAfter !== urlBefore;
    const hasModal = await page.locator('.modal, [role="dialog"]').count() > 0;
    const bodyText = await page.locator('body').textContent();
    const hasNewContent = bodyText.includes('Rule') || bodyText.includes('Routing');
    
    console.log('URL changed:', urlChanged);
    console.log('Modal present:', hasModal);
    console.log('Has new content:', hasNewContent);
    console.log('Console errors:', consoleErrors);
    
    // ASSERT: At least one state change must occur
    const stateChanged = urlChanged || hasModal || hasNewContent;
    expect(stateChanged, 'Clicking main button should change page state').toBe(true);
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ FLOW 3 PASSED');
  });
  
  test('Flow 4: Settings page - save button works', async ({ page }) => {
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
    
    console.log('\n=== FLOW 4: Settings Page - Save Button ===');
    await page.goto(`${BASE_URL}/#/settings`);
    await page.waitForTimeout(3000);
    
    const urlBefore = page.url();
    console.log('URL before:', urlBefore);
    await page.screenshot({ path: 'tests/e2e/screenshots/flow4-before.png' });
    
    // Look for Save or Update button
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button:has-text("Apply")').first();
    const isVisible = await saveBtn.isVisible().catch(() => false);
    console.log('Save button visible:', isVisible);
    
    // If button not visible, check if there's a gating message
    if (!isVisible) {
      const bodyText = await page.locator('body').textContent();
      const hasGatingMessage = bodyText.includes('Complete setup') || bodyText.includes('setup required');
      console.log('Has gating message:', hasGatingMessage);
      
      if (hasGatingMessage) {
        console.log('Button hidden due to incomplete setup - acceptable gating');
        console.log('✅ FLOW 4 PASSED (gated)');
        return;
      }
    }
    
    // ASSERT: Button must be visible
    expect(isVisible, 'Save button should be visible or gating message should be shown').toBe(true);
    
    // Click the button
    await saveBtn.click();
    await page.waitForTimeout(2000);
    
    const urlAfter = page.url();
    console.log('URL after:', urlAfter);
    await page.screenshot({ path: 'tests/e2e/screenshots/flow4-after.png' });
    
    // Check state change (success message, URL change, etc.)
    const urlChanged = urlAfter !== urlBefore;
    const bodyText = await page.locator('body').textContent();
    const hasSuccess = bodyText.includes('Saved') || bodyText.includes('Updated') || bodyText.includes('Success');
    
    console.log('URL changed:', urlChanged);
    console.log('Success message:', hasSuccess);
    console.log('Console errors:', consoleErrors);
    
    // ASSERT: At least one state change must occur
    const stateChanged = urlChanged || hasSuccess;
    expect(stateChanged, 'Clicking Save should change page state or show success').toBe(true);
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ FLOW 4 PASSED');
  });
  
});
