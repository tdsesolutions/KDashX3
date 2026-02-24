const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test('Click workspace button and capture logs', async ({ page }) => {
  const logs = [];
  page.on('console', msg => {
    const text = `${msg.type()}: ${msg.text()}`;
    logs.push(text);
    console.log(`[BROWSER] ${text}`);
  });
  
  // Login first
  await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await page.fill('#login-email', 'user@example.com');
  await page.fill('#login-password', 'securepass123');
  await page.click('#login-btn');
  
  await page.waitForTimeout(3000);
  
  console.log('\n=== LOGS AFTER LOGIN ===');
  logs.filter(l => l.includes('[Router]')).forEach(l => console.log(l));
  
  // Navigate to setup
  await page.goto(`${BASE_URL}/#/setup`);
  await page.waitForTimeout(2000);
  
  console.log('\n=== SETUP PAGE URL ===');
  console.log(page.url());
  
  // Find and click workspace button
  const workspaceBtn = page.locator('a[href*="setup/workspace"]').first();
  const isVisible = await workspaceBtn.isVisible().catch(() => false);
  console.log('\nWorkspace button visible:', isVisible);
  
  if (isVisible) {
    console.log('Clicking workspace button...');
    await workspaceBtn.click();
    await page.waitForTimeout(2000);
    
    console.log('\n=== URL AFTER CLICK ===');
    console.log(page.url());
    
    console.log('\n=== ALL ROUTER LOGS ===');
    logs.filter(l => l.includes('[Router]')).forEach(l => console.log(l));
    
    const heading = await page.locator('h1').first().textContent();
    console.log('\nHeading after click:', heading);
  }
});
