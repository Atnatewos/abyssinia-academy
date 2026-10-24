# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e-production.spec.js >> Production Smoke Tests >> Contact page loads with Telegram link
- Location: tests\e2e-production.spec.js:69:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Telegram')
Expected: visible
Error: strict mode violation: locator('text=Telegram') resolved to 4 elements:
    1) <h3 class="feature-card-title">Telegram Community</h3> aka getByRole('link', { name: 'Telegram Community Join our' })
    2) <p class="feature-card-desc">Join our private Telegram group for direct mentor…</p> aka getByRole('link', { name: 'Telegram Community Join our' })
    3) <span>…</span> aka getByRole('link', { name: 'Telegram Community Join our' })
    4) <a target="_blank" class="pricing-btn" rel="noopener noreferrer" href="https://t.me/AbyssiniaAcademy">…</a> aka getByRole('link', { name: 'Telegram Support' })

Call log:
  - Expect "toBeVisible" locator('text=Telegram') with timeout 5000ms
  - waiting for locator('text=Telegram')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e11]: 💰 Students earn while they learn — up to 500 ETB per sale · Withdraw in 24h.
      - link "See How You Earn →" [ref=e12] [cursor=pointer]:
        - /url: /#earn
    - banner [ref=e13]:
      - generic [ref=e14]:
        - link "ABYSSiNIA" [ref=e15] [cursor=pointer]:
          - /url: /
          - generic [ref=e21]:
            - generic [ref=e22]: ABYSSiNIA
            - generic [ref=e23]: Tech Academy
        - navigation "Primary" [ref=e24]:
          - link "Overview" [ref=e25] [cursor=pointer]:
            - /url: /
          - link "Courses" [ref=e26] [cursor=pointer]:
            - /url: /courses
          - link "Earn" [ref=e27] [cursor=pointer]:
            - /url: /#earn
          - link "Tuition" [ref=e28] [cursor=pointer]:
            - /url: /pricing
          - link "Contact" [ref=e29] [cursor=pointer]:
            - /url: /contact
        - generic [ref=e30]:
          - button "Switch language" [ref=e31] [cursor=pointer]:
            - generic [ref=e35]: EN
          - button "Switch to dark mode" [ref=e36] [cursor=pointer]
          - generic [ref=e39]:
            - link "Sign In" [ref=e40] [cursor=pointer]:
              - /url: /auth/login
            - link "Enroll Now" [ref=e45] [cursor=pointer]:
              - /url: /auth/register
    - main [ref=e50]:
      - generic [ref=e51]:
        - generic [ref=e52]:
          - text: Support
          - heading "Contact Us" [level=1] [ref=e53]
          - paragraph [ref=e54]: We are here to help. Choose the best way to reach us below.
        - generic [ref=e55]:
          - link [ref=e56] [cursor=pointer]:
            - /url: https://t.me/AbyssiniaAcademy
            - generic [ref=e57]:
              - heading "Telegram Community" [level=3] [ref=e61]
              - paragraph [ref=e62]: Join our private Telegram group for direct mentorship, peer support, and course discussions.
              - generic [ref=e63]: Join Telegram
          - link [ref=e68] [cursor=pointer]:
            - /url: /#faq
            - generic [ref=e69]:
              - heading "Frequently Asked Questions" [level=3] [ref=e74]
              - paragraph [ref=e75]: Find instant answers to common questions about enrollment, payments, and course access.
              - generic [ref=e76]: View FAQ
          - link [ref=e79] [cursor=pointer]:
            - /url: /courses
            - generic [ref=e80]:
              - heading "Course Information" [level=3] [ref=e85]
              - paragraph [ref=e86]: Browse our full course catalog and explore the 5-phase curriculum structure.
              - generic [ref=e87]: Browse Courses
        - generic [ref=e90]:
          - heading "Prefer Direct Contact?" [level=2] [ref=e91]
          - paragraph [ref=e92]: Reach out to our team anytime. We typically respond within a few hours.
          - link "Telegram Support" [ref=e94] [cursor=pointer]:
            - /url: https://t.me/AbyssiniaAcademy
    - contentinfo [ref=e97]:
      - generic [ref=e98]:
        - paragraph [ref=e99]: © 2026 – 2026 ABYSSiNIA Tech Academy. All rights reserved. Powered By SoDar!
        - generic [ref=e100]:
          - generic [ref=e101]: +251 920944941
          - generic [ref=e102]: •
          - generic [ref=e103]: Addis Ababa, Ethiopia
  - alert [ref=e104]
```

# Test source

```ts
  1   | /**
  2   |  * @fileoverview Production smoke tests for abyssiniatech.vercel.app
  3   |  *
  4   |  * Run with: npx playwright test tests/e2e-production.spec.js
  5   |  * Requires: npm i -D @playwright/test && npx playwright install
  6   |  */
  7   | 
  8   | const { test, expect } = require('@playwright/test');
  9   | 
  10  | const BASE_URL = 'https://abyssiniatech.vercel.app';
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
> 71  |     await expect(page.locator('text=Telegram')).toBeVisible();
      |                                                 ^ Error: expect(locator).toBeVisible() failed
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
  111 |     expect([401, 500]).toContain(response.status());
  112 |     // 500 is the current known bug (getAgentConfig missing) — expect 500 or 401
  113 |   });
  114 | });
```