import { expect } from '@playwright/test';
import { TRIP_TYPE_CODES, type JourneyRequest } from '../api/journey-search';
import { TRAVELER_TYPES, type Party, type Station, type TripSearch } from '../models/trip-search';
import { toIsoDate, type CalendarDate } from '../utils/dates';

// Checks that the search request carries exactly the route, dates and travelers that were entered.
export function expectRequestToMatchSearch(request: JourneyRequest, search: TripSearch): void {
  const { from, to, departDate, returnDate } = search;
  if (!from || !to || !departDate) {
    throw new Error('expectRequestToMatchSearch needs a complete search');
  }
  const [outbound, inbound] = request.journeyLegRequests;

  expect(request.type).toBe(TRIP_TYPE_CODES[search.tripType]);
  expect(outbound).toMatchObject(expectedLeg(from, to, departDate));

  if (search.tripType === 'Round-Trip' && returnDate) {
    expect(inbound).toMatchObject(expectedLeg(to, from, returnDate));
  } else {
    expect(request.journeyLegRequests).toHaveLength(1);
  }

  // Travelers are listed on the outbound leg, e.g. ['adult', 'adult', 'child'].
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

// { adult: 2, child: 1 } -> ['adult', 'adult', 'child']
function travelerList(party: Party): string[] {
  const list: string[] = [];
  for (const type of TRAVELER_TYPES) {
    for (let i = 0; i < (party[type] ?? 0); i++) {
      list.push(type);
    }
  }
  return list;
}
