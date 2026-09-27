// Business rules and messages observed on amtrak.com/home.
// Tests read expected values from here instead of hard-coding them.

export const BookingRules = {
  maxTravelersOnline: 8, // a 9th traveler is sent to phone booking
};

export const Messages = {
  invalidStation: 'Enter a valid station',
  adultRequired: 'Add at least one adult 18 years old or older.',
  phoneBookingForLargeParty: 'Call 1-800-USA-RAIL to make reservations for 9 to 14 travelers.',
};
