import { Messages } from '../../src/data/booking-rules';
import { expect, test } from '../../src/fixtures/test';

test.describe('Form validation', { tag: '@validation' }, () => {
  test('Find Trains is disabled on an empty form', async ({ searchForm }) => {
    await expect(searchForm.findTrainsButton).toBeDisabled();
  });

  test('text that matches no station is rejected', async ({ searchForm }) => {
    await searchForm.from.input.fill('Qxzq');
    await searchForm.from.input.press('Tab');

    await expect(searchForm.validationError(Messages.invalidStation)).toBeVisible();
  });
});
