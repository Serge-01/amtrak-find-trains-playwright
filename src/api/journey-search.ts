import type { TripType } from '../models/trip-search';

// The request the form sends when Find Trains is clicked, right before it opens the
// results page. The body wraps the search in "journeyRequest". Only the fields the
// tests check are listed; the shape was taken from a captured request.
export interface JourneySearchBody {
  journeyRequest: JourneyRequest;
}

export interface JourneyRequest {
  type: string; // trip type code, see TRIP_TYPE_CODES
  journeyLegRequests: JourneyLeg[];
}

export interface JourneyLeg {
  origin: { code: string; schedule: { departureDateTime: string } };
  destination: { code: string };
  passengers: { initialType?: string }[]; // "adult", "child"... (outbound leg only)
}

// How the request encodes the trip type chosen in the form.
export const TRIP_TYPE_CODES: Record<TripType, string> = {
  'One-Way': 'OW',
  'Round-Trip': 'RT',
};

// URL of the search request, as a pattern for page.route() and page.waitForRequest().
export const JOURNEY_SEARCH_URL = '**/dotcom/journey-solution-option';
