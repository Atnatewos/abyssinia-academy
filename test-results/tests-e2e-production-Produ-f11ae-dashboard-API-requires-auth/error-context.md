# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e-production.spec.js >> Production Smoke Tests >> Agent dashboard API requires auth
- Location: tests\e2e-production.spec.js:109:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 404
Received array: [401, 500]
```

# Test source

```ts
  11  | 
  12  | test.describe('Production Smoke Tests', () => {
  13  |   test('Landing page loads and shows hero', async ({ page }) => {
  14  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  15  |     await expect(page).toHaveTitle(/ABYSSiNIA/i);
  16  |     await expect(page.locator('h1')).toContainText(/Master Full Stack/i);
  17  |   });
  18  | 
  19  |   test('Language dropdown opens with 4 locales', async ({ page }) => {
  20  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  21  |     await page.waitForSelector('.language-dropdown-trigger');
  22  |     await page.click('.language-dropdown-trigger');
  23  |     const options = page.locator('.language-dropdown-option');
  24  |     await expect(options).toHaveCount(4);
  25  |   });
  26  | 
  27  |   test('Selecting Oromo switches page to Oromo and persists', async ({ page }) => {
  28  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  29  |     await page.click('.language-dropdown-trigger');
  30  |     await page.click('.language-dropdown-option:has-text("Afaan Oromoo")');
  31  |     await page.waitForTimeout(500);
  32  | 
  33  |     // localStorage updated
  34  |     const stored = await page.evaluate(() => localStorage.getItem('abyssinia_language'));
  35  |     expect(stored).toBe('om');
  36  | 
  37  |     // reload and confirm persistence
  38  |     await page.reload({ waitUntil: 'networkidle' });
  39  |     const storedAfter = await page.evaluate(() => localStorage.getItem('abyssinia_language'));
  40  |     expect(storedAfter).toBe('om');
  41  |   });
  42  | 
  43  |   test('Theme toggle switches between light and dark', async ({ page }) => {
  44  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  45  |     const themeBtn = page.locator('.nav-theme-btn');
  46  |     await themeBtn.click();
  47  |     // Theme class applied to root or body
  48  |     const hasLight = await page.evaluate(() =>
  49  |       document.documentElement.classList.contains('light-theme') ||
  50  |       document.body.classList.contains('light-theme')
  51  |     );
  52  |     expect(hasLight).toBe(true);
  53  |   });
  54  | 
  55  |   test('Pricing page shows 4 tiers with prices', async ({ page }) => {
  56  |     await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle' });
  57  |     await expect(page.locator('text=1,199 ETB')).toBeVisible();
  58  |     await expect(page.locator('text=399 ETB').first()).toBeVisible();
  59  |   });
  60  | 
  61  |   test('Course detail page loads', async ({ page }) => {
  62  |     await page.goto(`${BASE_URL}/courses`, { waitUntil: 'networkidle' });
  63  |     const firstCourse = page.locator('a[href*="/courses/"]').first();
  64  |     await firstCourse.click();
  65  |     await page.waitForLoadState('networkidle');
  66  |     expect(page.url()).toContain('/courses/');
  67  |   });
  68  | 
  69  |   test('Contact page loads with Telegram link', async ({ page }) => {
  70  |     await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle' });
  71  |     await expect(page.locator('text=Telegram')).toBeVisible();
  72  |   });
  73  | 
  74  |   test('Admin login page loads', async ({ page }) => {
  75  |     await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
  76  |     await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
  77  |   });
  78  | 
  79  |   test('No console errors on landing page', async ({ page }) => {
  80  |     const errors = [];
  81  |     page.on('console', (msg) => {
  82  |       if (msg.type() === 'error') errors.push(msg.text());
  83  |     });
  84  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  85  |     await page.waitForTimeout(2000);
  86  | 
  87  |     // Filter out known benign errors (agent WIP warnings aren't runtime errors)
  88  |     const fatalErrors = errors.filter(
  89  |       (e) => !e.includes('favicon') && !e.includes('@shared') && !e.includes('getAgentConfig')
  90  |     );
  91  |     expect(fatalErrors).toHaveLength(0);
  92  |   });
  93  | 
  94  |   test('Profile agents page is 404 (WIP, gitignored)', async ({ page }) => {
  95  |     const response = await page.goto(`${BASE_URL}/profile/agents`, { waitUntil: 'networkidle' });
  96  |     // Either 404 or redirect to login
  97  |     expect([404, 200, 307]).toContain(response.status());
  98  |     if (response.status() === 200) {
  99  |       // If it loads, it must be the login page (auth redirect)
  100 |       expect(page.url()).toContain('/auth/');
  101 |     }
  102 |   });
  103 | 
  104 |   test('Agent admin API requires auth', async ({ request }) => {
  105 |     const response = await request.get(`${BASE_URL}/api/admin/agents`);
  106 |     expect([401, 403]).toContain(response.status());
  107 |   });
  108 | 
  109 |   test('Agent dashboard API requires auth', async ({ request }) => {
  110 |     const response = await request.get(`${BASE_URL}/api/agents/dashboard`);
> 111 |     expect([401, 500]).toContain(response.status());
      |                        ^ Error: expect(received).toContain(expected) // indexOf
  112 |     // 500 is the current known bug (getAgentConfig missing) — expect 500 or 401
  113 |   });
  114 | });
```