import { Page, expect } from '@playwright/test';

export class PimPage {
  constructor(private page: Page) {}

  addBtn     = () => this.page.getByRole('button', { name: 'Add' });
  firstName  = () => this.page.getByPlaceholder('First Name');
  middleName = () => this.page.getByPlaceholder('Middle Name');
  lastName   = () => this.page.getByPlaceholder('Last Name');
  saveBtn    = () => this.page.getByRole('button', { name: 'Save' });
  successToast = () => this.page.locator('.oxd-toast--success');

  // --- LISTA ---
  listForm     = () => this.page.locator('form'); // único form de filtros
  resetBtn     = () => this.page.getByRole('button', { name: 'Reset' });
  searchBtn    = () => this.page.getByRole('button', { name: 'Search' });
  tableBody    = () => this.page.locator('div.oxd-table-body');
  tableRows    = () => this.page.locator('div.oxd-table-body > div.oxd-table-card');

  // Campo "Employee Name" por LABEL (evita conflicto con "Supervisor Name")
  employeeNameInput = () =>
    this.listForm()
      .locator('label:has-text("Employee Name")')
      .locator('..')                   // contenedor del input
      .locator('input[placeholder="Type for hints..."]');

  // Dropdown del autocomplete
  autoOptions = () => this.page.locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option');

  async gotoList() {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
    await expect(this.listForm()).toBeVisible();
  }

  async addEmployee(data: { first: string; middle?: string; last: string }) {
    await this.addBtn().click();
    await expect(this.page).toHaveURL(/pim\/addEmployee/);
    await this.firstName().fill(data.first);
    if (data.middle) await this.middleName().fill(data.middle);
    await this.lastName().fill(data.last);
    await this.saveBtn().click();
    await expect(this.successToast()).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /Personal Details/i })).toBeVisible();
  }

  async searchEmployeeByFullName(fullName: string) {
    await this.gotoList();
    // Limpia filtros por si quedó algo cargado
    if (await this.resetBtn().isVisible()) await this.resetBtn().click();

    // Rellena y selecciona opción del autocomplete
    await this.employeeNameInput().click();
    await this.employeeNameInput().fill(fullName);

    // Espera opciones y elige la que coincide (o la primera si no hay match exacto)
    await expect(this.autoOptions().first()).toBeVisible();
    const match = this.autoOptions().filter({ hasText: fullName });
    if (await match.count() > 0) {
      await match.first().click();
    } else {
      await this.autoOptions().first().click();
    }

    // Ejecuta búsqueda
    await this.searchBtn().click();

    // Valida resultados
    await expect(this.tableRows()).toHaveCountGreaterThan(0);
    // Verifica que al menos aparezcan nombre y apellido en la tabla
    const [first, last] = fullName.split(' ');
    await expect(this.tableBody()).toContainText(first);
    await expect(this.tableBody()).toContainText(last);
  }

  async expectValidationForMissingLastName() {
    await this.addBtn().click();
    await expect(this.page).toHaveURL(/pim\/addEmployee/);
    await this.firstName().fill('Test');
    await this.saveBtn().click();
    const lastNameError = this.page.locator('span.oxd-input-field-error-message');
    await expect(lastNameError).toContainText('Required');
  }
}
