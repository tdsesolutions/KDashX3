module.exports = {
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:4173/KDashX3',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
};
