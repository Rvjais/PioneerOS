import { test, expect } from '@playwright/test'

const KEY_PAGES = [
  '/login',
  '/accounts',
  '/accounts/daily-meeting',
  '/accounts/proforma-invoice',
  '/accounts/clients',
  '/sales',
  '/hr',
  '/hr/forms/exit',
  '/web',
  '/tasks/daily',
  '/calendar',
  '/clients',
  '/admin/users',
]

test.describe('Visual Contrast and UI Audit', () => {
  for (const path of KEY_PAGES) {
    test(`checks visual issues on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 })
      await page.waitForTimeout(1500)

      const issues: string[] = []

      // 1. Find all visible text elements and check computed styles
      const textElements = await page.locator('p, span, h1, h2, h3, h4, h5, h6, a, button, label, td, th, li, div').all()

      for (const el of textElements) {
        try {
          const isVisible = await el.isVisible()
          if (!isVisible) continue

          const tag = await el.evaluate(el => el.tagName.toLowerCase())
          const text = (await el.innerText()).trim()
          if (!text || text.length < 2) continue

          const styles = await el.evaluate(el => {
            const style = getComputedStyle(el)
            return {
              color: style.color,
              bg: style.backgroundColor,
              opacity: style.opacity,
              fontSize: style.fontSize,
              display: style.display,
              visibility: style.visibility,
              width: style.width,
              height: style.height,
            }
          })

          // Check for invisible text
          if (styles.opacity === '0') {
            issues.push(`Zero opacity: <${tag}> "${text.slice(0, 40)}"`)
            continue
          }
          if (styles.visibility === 'hidden') {
            issues.push(`Visibility hidden: <${tag}> "${text.slice(0, 40)}"`)
            continue
          }

          // Check for zero-size elements
          if (parseFloat(styles.width) === 0 || parseFloat(styles.height) === 0) {
            issues.push(`Zero size: <${tag}> "${text.slice(0, 40)}"`)
            continue
          }

          // Check for same foreground and background color
          if (styles.color === styles.bg) {
            issues.push(`Same fg/bg color: <${tag}> "${text.slice(0, 40)}" color=${styles.color}`)
          }

          // Check rgba with alpha 0
          if (styles.color.includes('rgba(0, 0, 0, 0)') || styles.color === 'rgba(0,0,0,0)' || styles.color === 'transparent') {
            issues.push(`Transparent text color: <${tag}> "${text.slice(0, 40)}"`)
          }
        } catch {
          // skip if element is detached
        }
      }

      // 2. Check for placeholder text that shouldn't be visible
      const inputPlaceholders = await page.locator('input, textarea, select').all()
      for (const input of inputPlaceholders) {
        try {
          const ph = await input.getAttribute('placeholder')
          if (ph) {
            const styles = await input.evaluate(el => {
              const style = getComputedStyle(el)
              return { color: style.color, bg: style.backgroundColor }
            })
            if (styles.color === styles.bg) {
              issues.push(`Input placeholder invisible: placeholder="${ph}"`)
            }
          }
        } catch { /* skip detached */ }
      }

      await page.screenshot({ path: `e2e-screenshots/visual-${path.replace(/\//g, '-') || 'root'}.png`, fullPage: true })

      if (issues.length > 0) {
        console.log(`\n[${path}] ${issues.length} issue(s):`)
        issues.forEach(i => console.log(`  ⚠ ${i}`))
      }

      expect(issues,
        `${path}: Found ${issues.length} visual issues`
      ).toHaveLength(0)
    })
  }
})
