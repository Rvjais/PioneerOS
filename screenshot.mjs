import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const BASE = 'http://localhost:3000';
const OUT = '/tmp/pioneer-screenshots';

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const pages = [
  '/login',
  '/',
  '/my-day',
  '/employees',
  '/directory',
  '/calendar',
  '/inbox',
  '/tasks',
  '/projects',
  '/clients',
  '/meetings',
  '/reports',
  '/goals',
  '/profile',
  '/settings',
  '/notifications',
  '/files',
  '/network',
  '/arcade',
  '/ideas',
  '/recognition',
  '/training',
  '/learning',
  '/knowledge',
  '/sop',
  '/policies',
  '/admin',
  '/admin/users',
  '/admin/roles',
  '/admin/departments',
  '/admin/settings',
  '/admin/audit-log',
  '/admin/magic-links',
  '/admin/sessions',
  '/hr',
  '/hr/attendance',
  '/hr/leave',
  '/hr/leaves',
  '/hr/appraisals',
  '/hr/training',
  '/accounts',
  '/accounts/clients',
  '/accounts/invoices',
  '/accounts/expenses',
  '/accounts/proposals',
  '/accounts/projects',
  '/accounts/contracts',
  '/accounts/deliverables',
  '/accounts/payments',
  '/accounts/reports',
  '/accounts/analytics',
  '/finance',
  '/finance/overview',
  '/finance/invoices',
  '/finance/expenses',
  '/sales',
  '/sales/leads',
  '/sales/deals',
  '/sales/pipeline',
  '/sales/proposals',
  '/sales/kanban',
  '/sales/analytics',
  '/seo',
  '/social',
  '/web',
  '/design',
  '/ads',
  '/crm',
  '/blended',
  '/manager',
  '/freelancer',
  '/intern',
  '/analytics',
  '/performance',
  '/dashboard',
  '/dashboard/my-tasks',
  '/dashboard/deliverables',
  '/all-access',
  '/client-access',
  '/communication-charter',
  '/glossary',
  '/guidebook',
  '/internal-tools',
  '/invoices',
  '/payments',
  '/tools',
  '/work-tracker',
  '/vendors',
  '/search',
  '/team',
  '/team/org-chart',
  '/issues',
  '/hiring',
  '/hiring/candidates',
  '/operations',
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Log in
  console.log('Logging in...');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${OUT}/00-login-page.png`, fullPage: true });
  
  // Try password login
  await page.evaluate(() => {
    // Click on password tab if it exists
    const pwdBtn = document.querySelector('[data-password]') || 
                   document.querySelector('button:has-text("Password")') ||
                   document.querySelector('a:has-text("Password")') ||
                   document.querySelector('[href*="password"]');
    if (pwdBtn) pwdBtn.click();
  });
  await page.waitForTimeout(1000);

  // Fill credentials
  const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="Email" i]');
  if (emailInput) {
    await emailInput.fill('brandingpioneers@gmail.com');
  }
  
  const phoneInput = await page.$('input[type="tel"], input[name="phone"], input[placeholder*="phone" i]');
  if (phoneInput) {
    await phoneInput.fill('+919999999999');
  }

  const passInput = await page.$('input[type="password"], input[name="password"], input[placeholder*="password" i]');
  if (passInput) {
    await passInput.fill('changeme123');
  }

  // Submit
  const submitBtn = await page.$('button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("Log in")');
  if (submitBtn) {
    await submitBtn.click();
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: `${OUT}/01-after-login.png`, fullPage: true });
  console.log('Login attempt done. Current URL:', page.url());

  // Check if we're logged in or still on login page
  const currentUrl = page.url();
  if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
    console.log('Login may have failed. Trying alternative approach...');
    
    // Try direct signIn via NextAuth
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Look for the password option more carefully
    const bodyText = await page.textContent('body');
    console.log('Page text snippet:', bodyText.substring(0, 500));
    
    // Try all possible selectors for password login option
    const allButtons = await page.$$('button, a, [role="button"]');
    for (const btn of allButtons) {
      const text = await btn.textContent().catch(() => '');
      if (text.toLowerCase().includes('password') || text.toLowerCase().includes('sign in') || text.toLowerCase().includes('login')) {
        console.log('Found button:', text.trim());
      }
    }
    
    await page.screenshot({ path: `${OUT}/01b-login-state.png`, fullPage: true });
  }

  // Navigate to key pages and screenshot
  for (const route of pages) {
    if (route === '/login') continue; // already done
    
    try {
      console.log(`Navigating to ${route}...`);
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);
      
      const filename = route.replace(/\//g, '_').replace(/^_/, '') || 'root';
      await page.screenshot({ path: `${OUT}/${filename}.png`, fullPage: true });
      console.log(`  -> Captured ${route}`);
    } catch (err) {
      console.log(`  -> Failed ${route}: ${err.message}`);
      try {
        await page.screenshot({ path: `${OUT}/${route.replace(/\//g, '_')}-error.png`, fullPage: true });
      } catch(e) {}
    }
  }

  await browser.close();
  console.log('Done. Screenshots in', OUT);
})();
