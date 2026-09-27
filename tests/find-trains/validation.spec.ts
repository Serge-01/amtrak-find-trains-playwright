import { Messages } from '../../src/data/booking-rules';
import { TripSearchBuilder } from '../../src/data/trip-search-builder';
import { expect, test } from '../../src/fixtures/test';

// One test per required field: a valid search with just that field left empty.
const requiredFields = [
  { field: 'From', leaveEmpty: (builder: TripSearchBuilder) => builder.withoutOrigin() },
  { field: 'To', leaveEmpty: (builder: TripSearchBuilder) => builder.withoutDestination() },
  { field: 'Depart date', leaveEmpty: (builder: TripSearchBuilder) => builder.withoutDepartDate() },
];

test.describe('Form validation', { tag: '@validation' }, () => {
  for (const { field, leaveEmpty } of requiredFields) {
    test(`Find Trains stays disabled without ${field}`, async ({ searchForm, today }) => {
      const search = leaveEmpty(TripSearchBuilder.validSearch(today)).build();

      await searchForm.fill(search);

      await expect(searchForm.findTrainsButton).toBeDisabled();
    });
  }

  test('text that matches no station is rejected', async ({ searchForm }) => {
    await searchForm.from.input.fill('Qxzq');
    await searchForm.from.input.press('Tab');

    await expect(searchForm.validationError(Messages.invalidStation)).toBeVisible();
  });
});
