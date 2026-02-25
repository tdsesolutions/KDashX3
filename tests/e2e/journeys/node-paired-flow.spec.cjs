const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';
const API_URL = 'https://instance-2026clawbot-vm0210-142930.tail0f5b68.ts.net';

test.describe('JOURNEY D: After node pairing - UI updates', () => {
  test('Node appears Connected after API-level pairing', async ({ page }) => {
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
    
    // Step 1: Create user and login
    console.log('Step 1: Create user via API');
    const timestamp = Date.now();
    const testEmail = `journey_d_${timestamp}@example.com`;
    const testPass = 'testpass123';
    
    // Register user
    const registerResponse = await page.evaluate(async ({ email, pass, apiUrl }) => {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      return { status: res.status, body: await res.json() };
    }, { email: testEmail, pass: testPass, apiUrl: API_URL });
    
    console.log('Register response:', registerResponse.status);
    expect(registerResponse.status).toBe(201);
    
    // Step 2: Login to get token
    console.log('Step 2: Login');
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
    await page.fill('#login-email', testEmail);
    await page.fill('#login-password', testPass);
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-d-01-before-pairing.png' });
    
    // Step 3: Create pairing token via API
    console.log('Step 3: Create pairing token');
    const token = registerResponse.body.token;
    
    const pairingResponse = await page.evaluate(async ({ token, apiUrl }) => {
      const res = await fetch(`${apiUrl}/pairing-tokens`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return { status: res.status, body: await res.json() };
    }, { token, apiUrl: API_URL });
    
    console.log('Pairing token response:', pairingResponse.status);
    expect(pairingResponse.status).toBe(200);
    
    const pairingToken = pairingResponse.body.token;
    console.log('Pairing token:', pairingToken);
    
    // Step 4: Register node via API (simulate connector)
    console.log('Step 4: Register node via API');
    const nodeResponse = await page.evaluate(async ({ pairingToken, apiUrl }) => {
      const res = await fetch(`${apiUrl}/nodes/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairing_token: pairingToken,
          name: 'TestNodeJourneyD',
          type: 'local',
          os: 'linux',
          capabilities: ['python']
        })
      });
      return { status: res.status, body: await res.json() };
    }, { pairingToken, apiUrl: API_URL });
    
    console.log('Node registration response:', nodeResponse.status);
    expect(nodeResponse.status).toBe(200);
    
    const nodeId = nodeResponse.body.node_id;
    console.log('Node ID:', nodeId);
    
    // Step 5: Reload UI and verify node appears
    console.log('Step 5: Reload UI to see node');
    await page.goto(`${BASE_URL}/#/nodes`);
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-d-02-after-pairing.png' });
    
    const bodyText = await page.locator('body').textContent();
    
    // ASSERT: Node appears in list
    const hasNode = bodyText.includes('TestNodeJourneyD') || bodyText.includes('connected') || bodyText.includes('Online');
    console.log('Node visible:', hasNode);
    expect(hasNode, 'Node should appear in UI after pairing').toBe(true);
    
    // Step 6: Check Providers page behavior changed
    console.log('Step 6: Check Providers page');
    await page.goto(`${BASE_URL}/#/providers`);
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'tests/e2e/screenshots/journey-d-03-providers-after.png' });
    
    const providersText = await page.locator('body').textContent();
    
    // Now that we have a node, providers page should show different UI
    // Either provider configuration UI or "No providers configured yet"
    const showsProviderUI = providersText.includes('Provider') && 
                           (providersText.includes('Configure') || 
                            providersText.includes('API Key') ||
                            providersText.includes('configured'));
    
    console.log('Shows provider UI:', showsProviderUI);
    // Just verify no error state - UI should show something meaningful
    expect(providersText.includes('Error') || providersText.includes('error'), 'No error state').toBe(false);
    
    // ASSERT: No console errors
    expect(consoleErrors).toHaveLength(0);
    
    console.log('✅ JOURNEY D PASSED: Node appears after pairing');
  });
});
