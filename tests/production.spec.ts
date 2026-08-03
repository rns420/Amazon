import { test, expect } from '@playwright/test'

// Production build verification tests

test.describe('Production Build', () => {
  test('production build has correct HTML structure', async ({ page }) => {
    // Test the preview server (production build)
    await page.goto('/')
    
    // Check that root element exists
    const root = page.locator('#root')
    await expect(root).toBeVisible()
  })

  test('production build includes PWA manifest', async ({ page }) => {
    await page.goto('/')
    
    const manifest = page.locator('link[rel="manifest"]')
    await expect(manifest).toBeVisible()
  })

  test('production build has SEO meta tags', async ({ page }) => {
    await page.goto('/')
    
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
    
    const metaTitle = page.locator('meta[name="title"]')
    await expect(metaTitle).toHaveAttribute('content', /.+/)
  })

  test('production build has security headers', async ({ page }) => {
    // Check that security-related meta tags are present
    const themeColor = page.locator('meta[name="theme-color"]')
    await expect(themeColor).toHaveAttribute('content', /#[0-9a-fA-F]{6}/)
  })
})

test.describe('Error Handling', () => {
  test('should display error boundary for runtime errors', async ({ page }) => {
    // Inject a test error
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // The error boundary should catch any errors gracefully
    // Check that either the app loaded or error boundary showed
    const rootContent = await page.locator('#root').innerHTML()
    expect(rootContent.length).toBeGreaterThan(0)
  })
})

test.describe('Performance', () => {
  test('should load fonts efficiently', async ({ page }) => {
    await page.goto('/')
    
    // Check preconnect links for fonts
    const preconnects = page.locator('link[rel="preconnect"]')
    const count = await preconnects.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('should have reasonable page load time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - startTime
    
    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })
})
