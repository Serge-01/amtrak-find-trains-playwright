// Dates as plain year/month/day values, with no time or timezone.
// The date picker decides "today" from the browser clock, so tests take today's date
// from the browser (HomePage.today) and do the math here. Working in UTC internally
// keeps results the same whatever timezone the test runner is in.

export interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number;
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  const result = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return { year: result.getUTCFullYear(), month: result.getUTCMonth() + 1, day: result.getUTCDate() };
}

// "Sunday, October 18, 2026": the aria-label of a day in the date picker.
export function toAriaLabel(date: CalendarDate): string {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// "10/18/2026": how the form shows a chosen date.
export function toDisplayValue(date: CalendarDate): string {
  return `${pad(date.month)}/${pad(date.day)}/${date.year}`;
}

// "2026-10-18": the date part of the departure time in the search request.
export function toIsoDate(date: CalendarDate): string {
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`;
}

// 7 -> "07"
function pad(value: number): string {
  return String(value).padStart(2, '0');
}
