import type { Station } from '../models/trip-search';

// Stations used across the suite: busy Northeast Corridor stations that always have service.
export const Stations = {
  NewYork: { code: 'NYP', searchTerm: 'New York', city: 'New York, NY' },
  Washington: { code: 'WAS', searchTerm: 'Washington', city: 'Washington, DC' },
} satisfies Record<string, Station>;

// Text that matches no station, for the invalid-station test.
export const NoMatchText = 'Qxzq';
