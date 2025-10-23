// pages/HeaderBar.ts
import { Page, expect, Locator } from '@playwright/test';

export class HeaderBar {
  constructor(private page: Page) {}

  // Área de usuario (arriba a la derecha)
  userArea = () => this.page.locator('.oxd-topbar-header-userarea');
  userDropdownToggle = () => this.page.locator('.oxd-userdropdown-name'); // botón con el nombre
  logoutLink = () => this.page.locator('a:has-text("Logout")');
  aboutLink = () => this.page.locator('a:has-text("About")'); // por si quieres usarlo luego

  private async safeClick(el: Locator) {
    await el.waitFor({ state: 'visible' });
    await el.scrollIntoViewIfNeeded();
    await el.click({ trial: true }).catch(() => {}); // prueba de click (no falla si overlay)
    await el.click({ force: true });                 // click definitivo
  }

  async openUserMenu() {
    await this.userArea().waitFor({ state: 'visible' });
    await this.safeClick(this.userDropdownToggle());
  }

  async logout() {
    await this.openUserMenu();
    await this.safeClick(this.logoutLink());
    await expect(this.page).toHaveURL(/\/auth\/login$/); // estamos de vuelta en login
  }
}
