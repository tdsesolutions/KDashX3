const { test, expect } = require('@playwright/test');
const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('JOURNEY 2: Add Node', () => {
  test('Generate pairing token for new node', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => msg.type() === 'error' && consoleErrors.push(msg.text()));
    
    // Login
    await page.goto(`${BASE_URL}/#/login`);
    await page.fill('#login-email', 'user@example.com');
    await page.fill('#login-password', 'securepass123');
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
    
    // Navigate to nodes
    await page.goto(`${BASE_URL}/#/nodes`);
    await page.waitForTimeout(2000);
    
    // Click Add Node
    await page.click('a:has-text("Add Node")');
    await page.waitForTimeout(1000);
    
    // Fill node details
    await page.fill('#node-name', 'Test Node');
    
    // Generate token
    await page.click('button:has-text("Generate")');
    await page.waitForTimeout(2000);
    
    // Verify token/command appears
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain('mc-node');
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Add Node Journey COMPLETE');
  });
});
