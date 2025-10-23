import { Page, expect, Locator } from '@playwright/test';

export class PimPage {
  constructor(private page: Page) {}

  // ---------- Selectores base ----------
  addBtn     = () => this.page.locator('button:has-text("Add")').first();
  firstName  = () => this.page.getByPlaceholder('First Name');
  middleName = () => this.page.getByPlaceholder('Middle Name');
  lastName   = () => this.page.getByPlaceholder('Last Name');
  saveBtn    = () => this.page.locator('button:has-text("Save")').first();
  successToast = () => this.page.locator('.oxd-toast--success');

  // Loader/overlay que interfiere
  private loader = () => this.page.locator('.oxd-form-loader');

  // Lista / tabla
  listForm   = () => this.page.locator('form');
  resetBtn   = () => this.page.locator('button:has-text("Reset")').first();
  searchBtn  = () => this.page.locator('button:has-text("Search")').first();
  tableBody  = () => this.page.locator('div.oxd-table-body');
  tableRows  = () => this.page.locator('div.oxd-table-body > div.oxd-table-card');

  employeeIdInputOnList = () =>
    this.listForm().locator('label:has-text("Employee Id")').locator('..').locator('input');

  // Personal Details
  personalDetailsForm = () =>
    this.page.locator('h6:has-text("Personal Details")').first().locator('..').locator('form');

  employeeIdInputOnPersonal = () =>
    this.personalDetailsForm().locator('label:has-text("Employee Id")').locator('..').locator('input,textarea').first();

  pdInputByLabel = (labelText: string) =>
    this.personalDetailsForm().locator(`label:has-text("${labelText}")`).locator('..').locator('input,textarea').first();

  pdEditBtn = () => this.personalDetailsForm().locator('button:has-text("Edit")').first();
  pdSaveBtn = () => this.personalDetailsForm().locator('button:has-text("Save")').first();

  // ---------- Helpers robustos ----------
  private async waitLoaderGone(timeout = 20_000) {
    await this.loader().waitFor({ state: 'detached', timeout }).catch(() => {});
  }

  private async safeClick(el: Locator) {
    // Si no está visible, intenta igualmente con force luego de preparar página
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitLoaderGone();
    try {
      await el.waitFor({ state: 'visible', timeout: 4_000 });
      await el.scrollIntoViewIfNeeded();
      await el.click();
    } catch {
      // fallback por si hay overlay o el botón no reporta visible
      await el.scrollIntoViewIfNeeded().catch(() => {});
      await this.waitLoaderGone();
      await el.click({ force: true });
    }
    await this.waitLoaderGone();
  }

  private async safeFill(el: Locator, value: string) {
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await el.waitFor({ state: 'attached' });
    await this.waitLoaderGone();
    await el.fill(value);
  }

  // ---------- Navegación ----------
  async gotoList() {
    // Ir directo a la lista PIM y confirmar que el botón "Add" existe (página lista)
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitLoaderGone();
    await expect(this.addBtn()).toBeAttached({ timeout: 15_000 });
  }

  // ---------- Flujos ----------
  async addEmployee(data: { first: string; middle?: string; last: string }) {
    await this.safeClick(this.addBtn());
    await expect(this.page).toHaveURL(/pim\/addEmployee/);

    await this.safeFill(this.firstName(), data.first);
    if (data.middle) await this.safeFill(this.middleName(), data.middle);
    await this.safeFill(this.lastName(), data.last);

    await this.safeClick(this.saveBtn());

    await expect(this.successToast()).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /Personal Details/i })).toBeVisible();
  }

  async getCurrentEmployeeId(): Promise<string> {
    await this.page.getByRole('heading', { name: /Personal Details/i }).waitFor();
    const input = this.employeeIdInputOnPersonal();
    await input.scrollIntoViewIfNeeded().catch(() => {});
    await input.waitFor({ state: 'attached' });
    await this.waitLoaderGone();

    let empId = (await input.inputValue()).trim();
    if (!empId) {
      await this.page.waitForTimeout(300);
      empId = (await input.inputValue()).trim();
    }
    expect(empId).not.toBe('');
    return empId;
  }

  async searchEmployeeById(empId: string) {
    await this.gotoList();
    if (await this.resetBtn().isVisible().catch(() => false)) {
      await this.safeClick(this.resetBtn());
    }
    await this.safeFill(this.employeeIdInputOnList(), empId);
    await this.safeClick(this.searchBtn());

    const rowCount = await this.tableRows().count();
    expect(rowCount).toBeGreaterThan(0);
    await expect(this.tableBody()).toContainText(empId);
  }

  private async ensureEditMode() {
    if (await this.pdEditBtn().isVisible().catch(() => false)) {
      await this.safeClick(this.pdEditBtn());
      await this.pdSaveBtn().waitFor({ state: 'attached' });
    }
  }

  async updatePersonalDetails(data: { nickname?: string; otherId?: string }) {
    await this.page.getByRole('heading', { name: /Personal Details/i }).waitFor();
    await this.personalDetailsForm().waitFor({ state: 'attached' });
    await this.ensureEditMode();

    if (data.nickname !== undefined) {
      await this.safeFill(this.pdInputByLabel('Nickname'), data.nickname);
    }
    if (data.otherId !== undefined) {
      await this.safeFill(this.pdInputByLabel('Other Id'), data.otherId);
    }

    await this.safeClick(this.pdSaveBtn());
    await expect(this.successToast()).toBeVisible();
  }

  async expectPersonalDetails(values: { nickname?: string; otherId?: string }) {
    await this.page.getByRole('heading', { name: /Personal Details/i }).waitFor();
    if (values.nickname !== undefined) {
      await expect(this.pdInputByLabel('Nickname')).toHaveValue(values.nickname);
    }
    if (values.otherId !== undefined) {
      await expect(this.pdInputByLabel('Other Id')).toHaveValue(values.otherId);
    }
  }

  async expectValidationForMissingLastName() {
    await this.safeClick(this.addBtn());
    await expect(this.page).toHaveURL(/pim\/addEmployee/);

    await this.safeFill(this.firstName(), 'Test');
    await this.safeClick(this.saveBtn());

    const lastNameError = this.page.locator('span.oxd-input-field-error-message');
    await expect(lastNameError).toContainText('Required');
  }
}
