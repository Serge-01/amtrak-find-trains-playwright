import { expectRequestToMatchSearch } from '../../src/assertions/search-request';
import { TripSearchBuilder } from '../../src/data/trip-search-builder';
import { expect, test } from '../../src/fixtures/test';
import { attachJson } from '../../src/utils/attachments';
import { toDisplayValue } from '../../src/utils/dates';

// The scope ends at the Find Trains click. These tests check the search request the form
// sends: that it carries exactly what was entered. The request itself is stopped before it
// reaches the site, so no results page opens (see SearchForm.findTrainsAndCaptureRequest).

test.describe('Search submission', { tag: '@submission' }, () => {
  test('one-way search sends the route, date and traveler that were entered', { tag: '@smoke' }, async ({ searchForm, today }) => {
    const search = TripSearchBuilder.validSearch(today).build();

    await searchForm.fill(search);
    await expect(searchForm.departDateInput).toHaveValue(toDisplayValue(search.departDate!));
    await expect(searchForm.findTrainsButton).toBeEnabled();

    const request = await searchForm.findTrainsAndCaptureRequest();
    await attachJson('search-request.json', request);

    expectRequestToMatchSearch(request, search);
  });

  test('round-trip search for a group sends both legs and every traveler', async ({ searchForm, today }) => {
    const search = TripSearchBuilder.validSearch(today).roundTrip().withParty({ adult: 2, child: 1 }).build();

    await searchForm.fill(search);
    await expect(searchForm.returnDateInput).toHaveValue(toDisplayValue(search.returnDate!));
    await expect(searchForm.travelers.toggle).toHaveAccessibleName(/^3 Travelers/);

    const request = await searchForm.findTrainsAndCaptureRequest();
    await attachJson('search-request.json', request);

    expectRequestToMatchSearch(request, search);
  });
});
