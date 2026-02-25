const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';
const API_URL = 'https://instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net';

test.describe('JOURNEY A: Nodes - Add Node with Token Generation', () => {
  test('Complete Add Node flow shows correct commands with stable URL', async ({ page }) => {
    const consoleErrors = [];
    const consoleLogs = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ CONSOLE ERROR:', msg.text());
      } else {
        consoleLogs.push(msg.text());
      }
    });
    
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
      console.log('❌ PAGE ERROR:', err.message);
    });
    
    // Step 1: Login as fresh user
    console.log('Step 1: Login as fresh user');
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    
    const timestamp = Date.now();
    const testEmail = `journey_a_${timestamp}@example.com`;
    const testPass = 'testpass123';
    
    await page.fill('#login-email', testEmail);
    await page.fill('#login-password', testPass);
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
    
    // Should be on dashboard
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    expect(currentUrl).toContain('#/dashboard');
    
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-a-01-dashboard.png' });
    
    // Step 2: Navigate to Nodes
    console.log('Step 2: Navigate to Nodes');
    await page.goto(`${BASE_URL}/#/nodes`);
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-a-02-nodes-empty.png' });
    
    // Step 3: Click Add Node
    console.log('Step 3: Click Add Node button');
    const addNodeBtn = page.locator('button:has-text("Add Node")').first();
    const isVisible = await addNodeBtn.isVisible().catch(() => false);
    expect(isVisible, 'Add Node button must be visible').toBe(true);
    
    await addNodeBtn.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-a-03-modal-open.png' });
    
    // Step 4: Generate pairing token
    console.log('Step 4: Generate pairing token');
    const generateBtn = page.locator('button:has-text("Generate Pairing Token")');
    await expect(generateBtn).toBeVisible();
    
    await generateBtn.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-a-04-token-generated.png' });
    
    // Step 5: Assert modal shows two commands with correct URL
    console.log('Step 5: Verify commands use stable backend URL');
    
    const modalContent = await page.locator('.modal-content').textContent();
    console.log('Modal content:', modalContent.substring(0, 500));
    
    // Check for Step 1 (download command)
    const downloadCommand = await page.locator('#download-command').textContent().catch(() => '');
    console.log('Download command:', downloadCommand);
    
    // Check for Step 2 (run command)
    const pairingCommand = await page.locator('#pairing-command').textContent().catch(() => '');
    console.log('Pairing command:', pairingCommand);
    
    // ASSERT: Commands use the stable Tailscale URL, NOT kdashx3.io or trycloudflare
    expect(downloadCommand).toContain('instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net');
    expect(downloadCommand).not.toContain('kdashx3.io');
    expect(downloadCommand).not.toContain('trycloudflare.com');
    
    expect(pairingCommand).toContain('instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net');
    expect(pairingCommand).not.toContain('kdashx3.io');
    expect(pairingCommand).not.toContain('trycloudflare.com');
    
    // ASSERT: connector.js URL matches ${API_BASE_URL}/connector.js
    expect(downloadCommand).toContain('/connector.js');
    
    // ASSERT: No console errors
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ JOURNEY A PASSED: Add Node flow shows correct commands');
  });
});
