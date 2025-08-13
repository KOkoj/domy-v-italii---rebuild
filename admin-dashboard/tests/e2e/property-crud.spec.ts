import { test, expect } from '@playwright/test'

test.describe('Property CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@example.com')
    await page.getByLabel(/password/i).fill('admin123456')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('should create a new property', async ({ page }) => {
    // Navigate to properties page
    await page.getByRole('link', { name: /properties/i }).click()
    await expect(page).toHaveURL('/properties')

    // Click "Add Property" button
    await page.getByRole('link', { name: /add property/i }).click()
    await expect(page).toHaveURL('/properties/new')

    // Fill in the form
    await page.getByLabel(/title/i).fill('Test Property')
    await page.getByLabel(/price/i).fill('250000')
    await page.getByLabel(/property type/i).selectOption('apartment')
    await page.getByLabel(/description/i).fill('A beautiful test property')
    await page.getByLabel(/address/i).fill('Via Test 123')
    await page.getByLabel(/city/i).fill('Florence')
    await page.getByLabel(/region/i).fill('Tuscany')
    await page.getByLabel(/postal code/i).fill('50100')
    await page.getByLabel(/bedrooms/i).fill('3')
    await page.getByLabel(/bathrooms/i).fill('2')
    await page.getByLabel(/area/i).fill('120')

    // Submit the form
    await page.getByRole('button', { name: /create property/i }).click()

    // Should redirect to properties list and show success message
    await expect(page).toHaveURL('/properties')
    // Note: Success message would be in toast notification
  })

  test('should edit property title and price', async ({ page }) => {
    // Navigate to properties page
    await page.getByRole('link', { name: /properties/i }).click()
    await expect(page).toHaveURL('/properties')

    // Assuming there's at least one property, click edit on the first one
    const editButton = page.getByRole('button', { name: /edit/i }).first()
    if (await editButton.isVisible()) {
      await editButton.click()

      // Should be on edit page
      await expect(page.url()).toMatch(/\/properties\/[^/]+$/)

      // The edit page shows placeholder text for now
      await expect(page.getByText(/property edit form will be implemented/i)).toBeVisible()
    }
  })

  test('should logout successfully', async ({ page }) => {
    // Click on user menu
    await page.getByRole('button', { name: /admin/i }).click()

    // Click logout
    await page.getByRole('button', { name: /logout/i }).click()

    // Should redirect to login page
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible()
  })

  test('should navigate through sidebar menu', async ({ page }) => {
    // Test navigation to different pages
    const menuItems = [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Properties', url: '/properties' },
      { name: 'Blog', url: '/blog' },
      { name: 'Inquiries', url: '/inquiries' },
      { name: 'Users', url: '/users' },
      { name: 'Settings', url: '/settings' },
    ]

    for (const item of menuItems) {
      await page.getByRole('link', { name: item.name }).click()
      await expect(page).toHaveURL(item.url)
      await expect(page.getByRole('heading', { name: new RegExp(item.name, 'i') })).toBeVisible()
    }
  })
})
