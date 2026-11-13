const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: {timeout: 12_000},
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"],["html",{open:"never"}]] : "list",
  use: {
    baseURL:"http://127.0.0.1:3000",
    trace:"retain-on-failure",
    screenshot:"only-on-failure",
  },
  projects: [
    {name:"chromium",use:{...devices["Desktop Chrome"]}},
    {name:"firefox",use:{...devices["Desktop Firefox"]}},
    {name:"webkit",use:{...devices["Desktop Safari"]}}
  ],
  webServer: {
    command:"npm run start -- -p 3000",
    url:"http://127.0.0.1:3000",
    timeout:90_000,
    reuseExistingServer:!process.env.CI,
  }
});
