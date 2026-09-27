export interface Station {
  code: string; // three-letter Amtrak code, e.g. NYP
  searchTerm: string; // what a user types to find it
  city: string; // city line on the selected-station card
}

export type TripType = 'One-Way' | 'Round-Trip';
