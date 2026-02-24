const { test, expect } = require('@playwright/test');
const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('JOURNEY 3: Configure Provider', () => {
  test('Setup OpenAI provider', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => msg.type() === 'error' && consoleErrors.push(msg.text()));
    
    // Login
    await page.goto(`${BASE_URL}/#/login`);
    await page.fill('#login-email', 'user@example.com');
    await page.fill('#login-password', 'securepass123');
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
    
    // Go to providers
    await page.goto(`${BASE_URL}/#/providers`);
    await page.waitForTimeout(2000);
    
    // Click Setup
    await page.click('a:has-text("Setup")');
    await page.waitForTimeout(1000);
    
    // Select provider
    await page.selectOption('#provider-select', 'openai');
    await page.fill('#api-key', 'sk-test123');
    
    // Save
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Configure Provider Journey COMPLETE');
  });
});
