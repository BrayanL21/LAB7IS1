import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/web/index.php/auth/login');
  }

  username = () => this.page.getByPlaceholder('Username');
  password = () => this.page.getByPlaceholder('Password');
  submit   = () => this.page.getByRole('button', { name: 'Login' });

  async loginAsAdmin() {
    await this.goto();
    await this.username().fill('Admin');
    await this.password().fill('admin123');
    await this.submit().click();
    await expect(this.page).toHaveURL(/dashboard/);
  }
}
