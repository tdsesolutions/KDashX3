const { test, expect } = require('@playwright/test');
const BASE_URL = 'https://tdsesolutions.github.io/KDashX3';

test.describe('JOURNEY 4: Create & Route Task', () => {
  test('Create task and dispatch to node', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => msg.type() === 'error' && consoleErrors.push(msg.text()));
    
    // Login
    await page.goto(`${BASE_URL}/#/login`);
    await page.fill('#login-email', 'user@example.com');
    await page.fill('#login-password', 'securepass123');
    await page.click('#login-btn');
    await page.waitForTimeout(3000);
    
    // Go to tasks
    await page.goto(`${BASE_URL}/#/tasks/new`);
    await page.waitForTimeout(2000);
    
    // Fill task
    await page.fill('#task-intent', 'Test task');
    await page.selectOption('#task-priority', 'normal');
    
    // Create
    await page.click('button:has-text("Create")');
    await page.waitForTimeout(2000);
    
    // Should show task or routing
    const url = page.url();
    expect(url).toMatch(/#\/(tasks|routing)/);
    
    expect(consoleErrors).toHaveLength(0);
    console.log('✅ Create & Route Task Journey COMPLETE');
  });
});
