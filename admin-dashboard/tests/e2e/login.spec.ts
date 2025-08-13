import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('should login successfully and redirect to dashboard', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')

    // Check that we're on the login page
    await expect(page).toHaveTitle(/Italian Real Estate Admin/)
    await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible()

    // Fill in credentials (using the pre-filled dev values)
    await page.getByLabel(/email/i).fill('admin@example.com')
    await page.getByLabel(/password/i).fill('admin123456')

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should show error message (toast)
    // Note: This assumes the backend returns an error for invalid credentials
    await expect(page.locator('[data-testid="toast"]')).toContainText(/error/i)
  })

  test('should redirect authenticated users away from login', async ({ page }) => {
    // First login
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@example.com')
    await page.getByLabel(/password/i).fill('admin123456')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/dashboard')

    // Try to visit login page again
    await page.goto('/login')

    // Should be redirected back to dashboard
    await expect(page).toHaveURL('/dashboard')
  })
})
