// tests/pim.spec.ts
import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PimPage } from '../pages/PimPage';
import { HeaderBar } from '../pages/HeaderBar';

test.describe('OrangeHRM - PIM (Employee Management)', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.loginAsAdmin();

    const pim = new PimPage(page);
    await pim.gotoList(); // directo a PIM List
  });

  test('1) Crear empleado exitosamente', async ({ page }) => {
    const pim = new PimPage(page);
    const unique = Date.now().toString().slice(-6);
    await pim.addEmployee({ first: 'Brayan' + unique, last: 'Leal' + unique });
  });

  // caSE 2
  test('2) Cerrar sesión desde el menú de usuario', async ({ page }) => {
    const header = new HeaderBar(page);
    await header.logout(); // abre menú de usuario y hace Logout
  });

  test('3) Validación: impedir guardar sin apellido', async ({ page }) => {
    const pim = new PimPage(page);
    await pim.expectValidationForMissingLastName();
  });
});
