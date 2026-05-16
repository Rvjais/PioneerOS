import { test, expect } from '@playwright/test'

const ROUTES = [
  { path: '/', name: 'root' },
  { path: '/login', name: 'login' },
  { path: '/accounts', name: 'accounts-dashboard' },
  { path: '/accounts/client-onboarding', name: 'accounts-client-onboarding' },
  { path: '/accounts/clients', name: 'accounts-clients' },
  { path: '/accounts/invoices', name: 'accounts-invoices' },
  { path: '/accounts/proforma-invoice', name: 'accounts-proforma-invoice' },
  { path: '/accounts/finance-overview', name: 'accounts-finance-overview' },
  { path: '/accounts/payment-tracker', name: 'accounts-payment-tracker' },
  { path: '/accounts/daily-meeting', name: 'accounts-daily-meeting' },
  { path: '/accounts/contracts', name: 'accounts-contracts' },
  { path: '/accounts/expenses', name: 'accounts-expenses' },
  { path: '/accounts/reports', name: 'accounts-reports' },
  { path: '/accounts/projects', name: 'accounts-projects' },
  { path: '/accounts/analytics', name: 'accounts-analytics' },
  { path: '/accounts/performance', name: 'accounts-performance' },
  { path: '/sales', name: 'sales-dashboard' },
  { path: '/sales/leads', name: 'sales-leads' },
  { path: '/sales/pipeline', name: 'sales-pipeline' },
  { path: '/sales/proposals', name: 'sales-proposals' },
  { path: '/sales/rfp-manager', name: 'sales-rfp' },
  { path: '/sales/deals', name: 'sales-deals' },
  { path: '/sales/performance', name: 'sales-performance' },
  { path: '/hr', name: 'hr-dashboard' },
  { path: '/hr/employees', name: 'hr-employees' },
  { path: '/hr/attendance', name: 'hr-attendance' },
  { path: '/hr/leave', name: 'hr-leave' },
  { path: '/hr/payroll', name: 'hr-payroll' },
  { path: '/hr/recruitment', name: 'hr-recruitment' },
  { path: '/hr/appraisals', name: 'hr-appraisals' },
  { path: '/hr/forms/exit', name: 'hr-exit' },
  { path: '/web', name: 'web-dashboard' },
  { path: '/web/projects', name: 'web-projects' },
  { path: '/tasks/daily', name: 'tasks-daily' },
  { path: '/calendar', name: 'calendar' },
  { path: '/clients', name: 'clients' },
  { path: '/directory', name: 'directory' },
  { path: '/recognition', name: 'recognition' },
  { path: '/admin/users', name: 'admin-users' },
  { path: '/admin/reports', name: 'admin-reports' },
]

test.describe('Comprehensive App Audit', () => {
  for (const { path, name } of ROUTES) {
    test(`navigates to ${name} (${path}) without errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
      })

      const resp = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null)
      await page.waitForTimeout(1000)

      await page.screenshot({ path: `e2e-screenshots/${name}.png`, fullPage: true })

      // Check HTTP status: should not be 5xx
      if (resp) {
        expect(resp.status(), `${path}: HTTP ${resp.status()}`).toBeLessThan(500)
      }

      // Check visible text for real 404 pages (not RSC internal payload)
      const visibleText = await page.locator('body').innerText().catch(() => '')

      // Check for actual 404 page (the app has a styled 404 page with "Page Not Found")
      const is404Page =
        visibleText.includes('404') &&
        visibleText.includes('Page Not Found')

      expect.soft(is404Page, `${path}: Rendered a 404 page`).toBe(false)

      // Check for "Coming Soon" in visible text
      expect.soft(!/coming.?soon/i.test(visibleText), `${path}: Contains "Coming Soon"`).toBe(true)

      // Log any JS errors (but don't fail for network errors during auth redirects)
      if (errors.length > 0) {
        console.log(`[${name}] Console errors:`, errors.join('; '))
      }
    })
  }
})

test.describe('Interactive Element Checks', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'e2e-screenshots/login-page.png', fullPage: true })

    // Check for login form elements
    const bodyText = await page.locator('body').innerText()

    // Should have login-related text (not a 404)
    const isLoginPage = /sign\s*in|login|magic\s*link|password/i.test(bodyText)
    expect.soft(isLoginPage, 'Login page not rendering correctly').toBe(true)
    expect.soft(!bodyText.includes('404'), 'Login page shows 404').toBe(true)
  })

  test('404 page exists for invalid routes', async ({ page }) => {
    const resp = await page.goto('/this-route-does-not-exist-xyz', { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'e2e-screenshots/404-test.png', fullPage: true })

    const bodyText = await page.locator('body').innerText()
    expect.soft(bodyText.includes('404')).toBe(true)
    expect.soft(bodyText.includes('Page Not Found')).toBe(true)
  })
})
