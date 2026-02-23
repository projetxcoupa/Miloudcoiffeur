import { test, expect } from '@playwright/test';

test('landing page loads', async ({ page }) => {
    await page.goto('/');
    // Check title
    await expect(page).toHaveTitle(/Miloud Coiffeur/);
    // Check headline
    await expect(page.getByText(/Dominez votre style/i)).toBeVisible();
});

test('navigation to booking flow', async ({ page }) => {
    await page.goto('/');
    // Click the "Réserver" link in the navbar
    const reserveBtn = page.getByRole('link', { name: /réserver/i }).first();
    await reserveBtn.click();
    // Expect URL to change to /book
    await expect(page).toHaveURL(/\/book/);
});
