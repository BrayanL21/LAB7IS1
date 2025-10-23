import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PimPage } from '../pages/PimPage';

test.describe('OrangeHRM - PIM (Employee Management)', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.loginAsAdmin();
    const dashboard = new DashboardPage(page);
    await dashboard.goToPIM();
  });

  test('1) Crear empleado exitosamente', async ({ page }) => {
    const pim = new PimPage(page);
    const unique = Date.now().toString().slice(-6);
    await pim.addEmployee({ first: 'Brayan' + unique, last: 'Leal' + unique });
  });

//   test('2) Buscar empleado por nombre', async ({ page }) => {
//     const pim = new PimPage(page);
//     // En el demo suelen existir nombres como "Linda", "Paul", etc.
//     await pim.searchEmployeeByName('Amelia');
//   });
test('2) Buscar empleado por nombre', async ({ page }) => {
  const pim = new PimPage(page);
  const unique = Date.now().toString().slice(-6);
  const first = 'Brayan' + unique;
  const last  = 'Leal' + unique;
  const full  = `${first} ${last}`;

  // Crear empleado
  await pim.addEmployee({ first, last });

  // Buscarlo en la lista por nombre completo (usando autocomplete)
  await pim.searchEmployeeByFullName(full);
});


  test('3) Validación: impedir guardar sin apellido', async ({ page }) => {
    const pim = new PimPage(page);
    await pim.expectValidationForMissingLastName();
  });
});
