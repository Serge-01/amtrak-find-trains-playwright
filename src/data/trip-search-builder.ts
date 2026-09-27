import type { Party, Station, TripSearch, TripType } from '../models/trip-search';
import { addDays, type CalendarDate } from '../utils/dates';
import { Stations } from './stations';

// Builds form input for tests. Starts from a valid search (one-way, New York to
// Washington, two weeks out, one adult), so each test only changes what it's testing.
export class TripSearchBuilder {
  private tripType: TripType = 'One-Way';
  private from: Station | undefined = Stations.NewYork;
  private to: Station | undefined = Stations.Washington;
  private departInDays: number | undefined = 14;
  private readonly nightsAway = 3; // return date for round trips
  private party: Party = { adult: 1 };

  // today comes from the browser, so dates match what the date picker considers today.
  constructor(private readonly today: CalendarDate) {}

  static validSearch(today: CalendarDate): TripSearchBuilder {
    return new TripSearchBuilder(today);
  }

  roundTrip(): TripSearchBuilder {
    this.tripType = 'Round-Trip';
    return this;
  }

  toStation(station: Station): TripSearchBuilder {
    this.to = station;
    return this;
  }

  withParty(party: Party): TripSearchBuilder {
    this.party = party;
    return this;
  }

  // For validation tests: leave one required field empty.
  withoutOrigin(): TripSearchBuilder {
    this.from = undefined;
    return this;
  }

  withoutDestination(): TripSearchBuilder {
    this.to = undefined;
    return this;
  }

  withoutDepartDate(): TripSearchBuilder {
    this.departInDays = undefined;
    return this;
  }

  build(): TripSearch {
    const departDate = this.departInDays === undefined ? undefined : addDays(this.today, this.departInDays);
    const returnDate = this.tripType === 'Round-Trip' && departDate ? addDays(departDate, this.nightsAway) : undefined;

    return {
      tripType: this.tripType,
      from: this.from,
      to: this.to,
      departDate,
      returnDate,
      party: this.party,
    };
  }
}
