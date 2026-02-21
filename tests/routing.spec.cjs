const { test, expect } = require('@playwright/test');

test.describe('SPA Routing', () => {
  test('root loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/KDashX3/);
  });

  test('/setup route loads', async ({ page }) => {
    await page.goto('/#/setup');
    await expect(page.locator('text=Setup Center')).toBeVisible();
  });

  test('/nodes route loads', async ({ page }) => {
    await page.goto('/#/nodes');
    await expect(page.locator('text=Nodes')).toBeVisible();
  });

  test('/providers route loads', async ({ page }) => {
    await page.goto('/#/providers');
    await expect(page.locator('text=Providers')).toBeVisible();
  });

  test('/routing route loads', async ({ page }) => {
    await page.goto('/#/routing');
    await expect(page.locator('text=Routing')).toBeVisible();
  });

  test('/tasks route loads', async ({ page }) => {
    await page.goto('/#/tasks');
    await expect(page.locator('text=Tasks')).toBeVisible();
  });
});

test.describe('Core User Flow', () => {
  test('login to workspace creation', async ({ page }) => {
    await page.goto('/#/login');
    await expect(page.locator('text=Sign In')).toBeVisible();
    
    // Enter email
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    
    // Should redirect to setup or dashboard
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toMatch(/\/#\/(setup|dashboard)/);
  });

  test('add node flow', async ({ page }) => {
    // Login first
    await page.goto('/#/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(500);
    
    // Go to nodes
    await page.goto('/#/nodes');
    await expect(page.locator('text=Add Your First Node')).toBeVisible();
    
    // Click add node
    await page.click('button:has-text("Add Your First Node")');
    await expect(page.locator('text=Add New Node')).toBeVisible();
  });
});
