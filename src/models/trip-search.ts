import type { CalendarDate } from '../utils/dates';

export interface Station {
  code: string; // three-letter Amtrak code, e.g. NYP
  searchTerm: string; // what a user types to find it
  city: string; // city line on the selected-station card
}

export type TripType = 'One-Way' | 'Round-Trip';

export type TravelerType = 'adult' | 'senior' | 'youth' | 'child' | 'infant';

// Same order as the travelers panel.
export const TRAVELER_TYPES: TravelerType[] = ['adult', 'senior', 'youth', 'child', 'infant'];

// Number of travelers of each type. A missing type means zero.
export interface Party {
  adult?: number;
  senior?: number;
  youth?: number;
  child?: number;
  infant?: number;
}

// What gets entered into the form. Station and date fields are optional
// so validation tests can leave one of them empty.
export interface TripSearch {
  tripType: TripType;
  from?: Station;
  to?: Station;
  departDate?: CalendarDate;
  returnDate?: CalendarDate;
  party: Party;
}

export function partySize(party: Party): number {
  let total = 0;
  for (const type of TRAVELER_TYPES) {
    total += party[type] ?? 0;
  }
  return total;
}
