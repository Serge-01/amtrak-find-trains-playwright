import { expect } from '@playwright/test';
import { PASSENGER_TYPE_NAMES, TRIP_TYPE_CODES, type JourneyRequest } from '../api/journey-search';
import { TRAVELER_TYPES, type Party, type Station, type TripSearch } from '../models/trip-search';
import { toIsoDate, type CalendarDate } from '../utils/dates';

// Checks that the search request carries exactly the route, dates and travelers that were entered.
export function expectRequestToMatchSearch(request: JourneyRequest, search: TripSearch): void {
  const { from, to, departDate, returnDate } = search;
  if (!from || !to || !departDate) {
    throw new Error('expectRequestToMatchSearch needs a complete search');
  }
  if (search.tripType === 'Round-Trip' && !returnDate) {
    throw new Error('expectRequestToMatchSearch needs a return date for a round trip');
  }

  expect(request.type).toBe(TRIP_TYPE_CODES[search.tripType]);

  // The outbound leg, plus the same trip reversed for a round trip. On an array,
  // toMatchObject also checks the length, so an extra or a missing leg fails.
  const expectedLegs = [expectedLeg(from, to, departDate)];
  if (returnDate) {
    expectedLegs.push(expectedLeg(to, from, returnDate));
  }
  expect(request.journeyLegRequests).toMatchObject(expectedLegs);

  // Travelers are listed on the outbound leg, e.g. ['adult', 'adult', 'child'].
  const outbound = request.journeyLegRequests[0];
  const sentTravelers = outbound.passengers.map((passenger) => passenger.initialType).sort();
  expect(sentTravelers).toEqual(travelerList(search.party).sort());
}

// One leg of the trip as the request carries it: station codes and a midnight departure time.
function expectedLeg(from: Station, to: Station, date: CalendarDate) {
  return {
    origin: { code: from.code, schedule: { departureDateTime: `${toIsoDate(date)}T00:00:00` } },
    destination: { code: to.code },
  };
}

// { adult: 2, senior: 1 } -> ['adult', 'adult', 'seniors'], in the request's own names
function travelerList(party: Party): string[] {
  const list: string[] = [];
  for (const type of TRAVELER_TYPES) {
    for (let i = 0; i < (party[type] ?? 0); i++) {
      list.push(PASSENGER_TYPE_NAMES[type]);
    }
  }
  return list;
}
