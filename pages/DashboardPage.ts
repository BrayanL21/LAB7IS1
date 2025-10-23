import { Page } from '@playwright/test';

export class DashboardPage {
  constructor(private page: Page) {}

  pimMenu = () => this.page.getByRole('link', { name: 'PIM' });

  async goToPIM() {
    await this.pimMenu().click();
    await this.page.waitForURL(/pim\/viewEmployeeList/);
  }
}
