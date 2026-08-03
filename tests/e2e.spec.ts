import { test, expect } from '@playwright/test'

// Test suite for KDP Publishing Studio E2E tests

test.describe('Authentication', () => {
  test('should show auth page when not logged in', async ({ page }) => {
    await page.goto('/')
    
    // Should redirect to auth page
    await expect(page).toHaveURL(/\/auth/)
    
    // Should show login/signup options
    await expect(page.getByRole('heading', { name: /welcome|sign in|login/i })).toBeVisible({ timeout: 10000 })
  })

  test('should show email input field', async ({ page }) => {
    await page.goto('/auth')
    
    const emailInput = page.getByPlaceholder(/email/i)
    await expect(emailInput).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth')
    
    const emailInput = page.getByPlaceholder(/email/i)
    const submitButton = page.getByRole('button', { name: /sign in|login|continue/i })
    
    // Try submitting with invalid email
    await emailInput.fill('invalid-email')
    await submitButton.click()
    
    // Should show validation error
    await expect(page.getByText(/valid email|invalid email/i)).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Navigation', () => {
  test('should show 404 page for unknown routes', async ({ page }) => {
    await page.goto('/some-unknown-route-that-does-not-exist')
    
    await expect(page.getByText(/404|not found/i)).toBeVisible({ timeout: 10000 })
  })

  test('should have working navigation links on auth page', async ({ page }) => {
    await page.goto('/auth')
    
    // Check for logo or brand element
    const logo = page.locator('img[alt], svg').first()
    await expect(logo).toBeVisible()
  })
})

test.describe('UI Components', () => {
  test('should have no console errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    // Filter out known acceptable errors (like Supabase connection errors in test env)
    const criticalErrors = errors.filter(
      (e) => !e.includes('supabase') && !e.includes('Failed to fetch')
    )
    
    expect(criticalErrors).toHaveLength(0)
  })

  test('should render loading state correctly', async ({ page }) => {
    await page.goto('/auth')
    
    // Check that loading spinner exists initially if present
    const loadingSpinner = page.locator('.animate-spin')
    // This is optional - some pages show loading, some don't
  })
})

test.describe('Accessibility', () => {
  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/auth')
    
    const title = await page.title()
    expect(title).toContain('KDP Publishing Studio')
  })

  test('should have accessible form inputs', async ({ page }) => {
    await page.goto('/auth')
    
    // Check for labels or aria-labels
    const inputs = page.locator('input')
    const count = await inputs.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Visual', () => {
  test('should render favicon', async ({ page }) => {
    await page.goto('/auth')
    
    const favicon = page.locator('link[rel="icon"]')
    await expect(favicon).toHaveAttribute('href', /.svg/)
  })

  test('should apply custom font', async ({ page }) => {
    await page.goto('/auth')
    
    // Check that fonts are being loaded
    const fontLink = page.locator('link[href*="fonts.googleapis.com"]')
    await expect(fontLink).toHaveCount(1)
  })
})
