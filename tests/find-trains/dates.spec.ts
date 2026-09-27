import { TripSearchBuilder } from '../../src/data/trip-search-builder';
import { expect, test } from '../../src/fixtures/test';
import { addDays } from '../../src/utils/dates';

test.describe('Date selection', { tag: '@dates' }, () => {
  test('days before today cannot be picked', async ({ searchForm, today }) => {
    test.skip(today.day === 1, 'On the 1st, yesterday is in a month the calendar does not show');

    await searchForm.openDatePicker();

    await expect(searchForm.datePicker.day(today)).toHaveAttribute('aria-disabled', 'false');
    await expect(searchForm.datePicker.day(addDays(today, -1))).toHaveAttribute('aria-disabled', 'true');
  });

  test('round trip dates cannot be confirmed without a return date', async ({ searchForm, today }) => {
    const search = TripSearchBuilder.validSearch(today).roundTrip().build();
    // Everything except the dates, which this test picks one at a time.
    await searchForm.fill({ ...search, departDate: undefined, returnDate: undefined });

    await searchForm.openDatePicker();
    await searchForm.datePicker.select(search.departDate!);
    await expect(searchForm.datePicker.doneButton).toBeDisabled();

    await searchForm.datePicker.select(search.returnDate!);
    await expect(searchForm.datePicker.doneButton).toBeEnabled();

    await searchForm.datePicker.confirm();
    await expect(searchForm.findTrainsButton).toBeEnabled();
  });
});
