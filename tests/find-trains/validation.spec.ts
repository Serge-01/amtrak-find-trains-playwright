import type { SearchForm } from '../../src/components/search-form';
import { Messages } from '../../src/data/booking-rules';
import { NoMatchText, Stations } from '../../src/data/stations';
import { TripSearchBuilder } from '../../src/data/trip-search-builder';
import { expect, test } from '../../src/fixtures/test';
import type { TripSearch } from '../../src/models/trip-search';

// One test per required field: a valid search with just that field left empty keeps
// Find Trains disabled, and filling in that one field enables it.
const requiredFields = [
  {
    field: 'From',
    leaveEmpty: (builder: TripSearchBuilder) => builder.withoutOrigin(),
    fillIn: (form: SearchForm, search: TripSearch) => form.from.choose(search.from!),
  },
  {
    field: 'To',
    leaveEmpty: (builder: TripSearchBuilder) => builder.withoutDestination(),
    fillIn: (form: SearchForm, search: TripSearch) => form.to.choose(search.to!),
  },
  {
    field: 'Depart date',
    leaveEmpty: (builder: TripSearchBuilder) => builder.withoutDepartDate(),
    fillIn: (form: SearchForm, search: TripSearch) => form.chooseDates(search.departDate!),
  },
];

test.describe('Form validation', { tag: '@validation' }, () => {
  for (const { field, leaveEmpty, fillIn } of requiredFields) {
    test(`Find Trains stays disabled without ${field}`, async ({ searchForm, today }) => {
      const completeSearch = TripSearchBuilder.validSearch(today).build();

      await searchForm.fill(leaveEmpty(TripSearchBuilder.validSearch(today)).build());
      await expect(searchForm.findTrainsButton).toBeDisabled();

      // Filling in just that field enables the button, so it was the only thing missing.
      await fillIn(searchForm, completeSearch);
      await expect(searchForm.findTrainsButton).toBeEnabled();
    });
  }

  test('text that matches no station is rejected', async ({ searchForm, today }) => {
    await searchForm.fill(TripSearchBuilder.validSearch(today).withoutOrigin().build());
    await searchForm.from.input.fill(NoMatchText);
    await searchForm.from.input.press('Tab');

    await expect(searchForm.validationError(Messages.invalidStation)).toBeVisible();
    await expect(searchForm.findTrainsButton).toBeDisabled();

    // Choosing a real station instead makes the search valid.
    await searchForm.from.choose(Stations.NewYork);
    await expect(searchForm.findTrainsButton).toBeEnabled();
  });
});
