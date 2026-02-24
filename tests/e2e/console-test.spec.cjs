const { test, expect } = require('@playwright/test');

test('Console log capture test', async ({ page }) => {
  const logs = [];
  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`);
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
  });
  
  await page.goto('https://tdsesolutions.github.io/KDashX3/#/setup', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('\n=== ALL CONSOLE LOGS ===');
  logs.forEach(log => console.log(log));
  
  // Click workspace button
  const btn = page.locator('a[href="#/setup/workspace"]').first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(2000);
    
    console.log('\n=== LOGS AFTER CLICK ===');
    logs.forEach(log => console.log(log));
  }
});
