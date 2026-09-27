import { BookingRules, Messages } from '../../src/data/booking-rules';
import { TripSearchBuilder } from '../../src/data/trip-search-builder';
import { expect, test } from '../../src/fixtures/test';
import { TRAVELER_TYPES } from '../../src/models/trip-search';

test.describe('Travelers', { tag: '@travelers' }, () => {
  test('starts with one adult and no other travelers', async ({ searchForm }) => {
    await expect(searchForm.travelers.toggle).toHaveAccessibleName(/^1 Traveler\b/);

    await searchForm.travelers.open();
    for (const type of TRAVELER_TYPES) {
      if (type !== 'adult') {
        // A disabled "-" button means that count is zero.
        await expect(searchForm.travelers.removeButton(type)).toBeDisabled();
      }
    }
  });

  test(`up to ${BookingRules.maxTravelersOnline} travelers can search online, one more is sent to phone booking`, async ({ searchForm, today }) => {
    const max = BookingRules.maxTravelersOnline;
    await searchForm.fill(TripSearchBuilder.validSearch(today).build());
    await searchForm.travelers.open();

    await searchForm.travelers.add('adult', max - 1);
    await expect(searchForm.travelers.toggle).toHaveAccessibleName(new RegExp(`^${max} Travelers`));
    await expect(searchForm.findTrainsButton).toBeEnabled();

    await searchForm.travelers.add('adult');
    await expect(searchForm.travelers.messages).toContainText(Messages.phoneBookingForLargeParty);
    await expect(searchForm.findTrainsButton).toBeDisabled();
  });

  test('an infant cannot travel without an adult', async ({ searchForm, today }) => {
    await searchForm.fill(TripSearchBuilder.validSearch(today).build());
    await searchForm.travelers.open();

    await searchForm.travelers.remove('adult');
    await searchForm.travelers.add('infant');
    await expect(searchForm.travelers.messages).toContainText(Messages.adultRequired);
    await expect(searchForm.findTrainsButton).toBeDisabled();

    await searchForm.travelers.add('adult');
    await expect(searchForm.findTrainsButton).toBeEnabled();
  });
});
