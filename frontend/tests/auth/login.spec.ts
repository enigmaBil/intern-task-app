import {test, expect} from '@playwright/test';

test('login utilisateur existant', async ({page}) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[type="email"]', 'emmanueldigital9@gmail.com');
    await page.fill('input[type="password"]', 'admin123');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(page.getByText('Dashboard')).toBeVisible();
});