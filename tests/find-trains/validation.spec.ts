import { expect, test } from '../../src/fixtures/test';

test.describe('Form validation', { tag: '@validation' }, () => {
  test('Find Trains is disabled on an empty form', async ({ searchForm }) => {
    await expect(searchForm.findTrainsButton).toBeDisabled();
  });
});
