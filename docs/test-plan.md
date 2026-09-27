# Test plan — Amtrak "Find Trains" form

## Scope

**In scope:** the Find Trains search form on amtrak.com/home, up to and including the click:
the trip type (One-Way, Round-Trip), From and To stations, depart and return dates, travelers,
validation messages, the button's enabled state, and the search request the click sends.

**Out of scope:** the results page and booking, the Multi-City and Group Travel trip types, promo
codes, Advanced Search, Use Points, the Rail Passes and Auto Train tabs, signed-in flows, and
browsers other than desktop Chrome.

## Approach

The form's job is to turn a user's choices into a correct search, and to refuse to search until
the input is valid. So the suite checks two things:

1. **How the form behaves:** suggestions, the date and traveler rules, validation messages, and
   above all when Find Trains is enabled and when it isn't.
2. **What the click sends:** the test captures the search request and checks it carries exactly
   the route, dates and travelers that were entered. This is the one check below the UI, and the
   strongest evidence: a form can look right and still send the wrong search.

**Where the test stops.** The request is captured, checked, then aborted, so no search reaches
Amtrak. The scope ends at the click, and the site's bot protection rejects automated searches
anyway.

**Priorities:**

- **P0:** a valid search is sent with the right data; a search missing a required field can't be.
- **P1:** business rules a user runs into: the same station on both sides, past dates, a round
  trip without a return date, the traveler limit, an infant without an adult, text that isn't a
  station.
- **P2:** convenience behavior and rarer paths.

Rules with a boundary are tested on both sides: 8 travelers can search, the 9th is sent to phone
booking. Error tests prove their cause: they check the exact message, or fix the input and see
Find Trains enable, or both.

**Categories:** positive, negative, business edge case and security (planned). **Level:** UI tests
in desktop Chrome, each in an isolated browser context. The one-way search is tagged `@smoke`.

## Assumptions and risks

1. **The business rules are observed, not specified.** With no requirements document, the
   expected behavior is what the live site did on 2026-09-26:
   - 8 travelers can search online; a 9th goes to phone booking.
   - An infant needs an adult.
   - A round trip needs a return date.
   - Days before today are disabled.
   - Typed text must be picked from the suggestions; an exact code like NYP selects itself
     (not automated yet, scenario 15).
   - The exact texts of the UI messages.

   All of them live in `src/data/booking-rules.ts`, so a changed rule is a one-line edit.
2. **The request format is observed, not documented.** Only the fields the tests check are
   modeled, in `src/api/journey-search.ts`. The request names travelers the way the form does,
   except seniors ("seniors"), which is mapped there.
3. **The site is live production, owned by a third party.** Amtrak can change the markup, texts
   or rules at any time. Locators use the site's own test IDs and accessible names, expected
   values are kept in one place, and traces are kept on failure.
4. **Bot protection.** Page loads work from a normal network, but automated searches are
   rejected. A blocked page load fails fast with a clear message. Runs use 2 workers and no local
   retries, so real flakiness stays visible.
5. **Environment.** Desktop Chrome at 1280×800, timezone America/New_York. Test dates stay within
   the two months the calendar shows. The form restores the last search within a session, so each
   test gets a fresh browser context.

## Test data

Stations are New York Penn (NYP) and Washington Union Station (WAS), busy Northeast Corridor
stations that always have service. Dates are relative to the browser's today (depart 14 days
out, return 3 nights later), so nothing expires. Tests build their searches with
`TripSearchBuilder`; the round-trip submission sends one of every traveler type. Stations and
the no-match text live in `src/data`.

## Scenarios

| #  | Area        | Scenario                                                                    | Category      | Priority | Status          |
| -- | ----------- | --------------------------------------------------------------------------- | ------------- | -------- | --------------- |
| 1  | Submission  | One-way search sends the route, date and traveler that were entered (`@smoke`) | Positive      | P0       | Automated       |
| 2  | Submission  | Round-trip search for a group sends both legs and every traveler type        | Positive      | P0       | Automated       |
| 3  | Validation  | Find Trains stays disabled without From                                      | Negative      | P0       | Automated       |
| 4  | Validation  | Find Trains stays disabled without To                                        | Negative      | P0       | Automated       |
| 5  | Validation  | Find Trains stays disabled without a depart date                             | Negative      | P0       | Automated       |
| 6  | Validation  | Text that matches no station is rejected                                     | Negative      | P1       | Automated       |
| 7  | Stations    | Suggestions appear while typing; the chosen station is shown                 | Positive      | P1       | Automated       |
| 8  | Stations    | The same station for From and To is rejected                                 | Business edge | P1       | Automated       |
| 9  | Stations    | Swap exchanges From and To                                                   | Positive      | P2       | Known issue     |
| 10 | Dates       | Days before today can't be picked                                            | Business edge | P1       | Automated       |
| 11 | Dates       | A round trip can't be confirmed without a return date                        | Business edge | P1       | Automated       |
| 12 | Travelers   | The form starts with one adult and no other travelers                        | Positive      | P2       | Automated       |
| 13 | Travelers   | Up to 8 travelers can search online; a 9th is sent to phone booking          | Business edge | P1       | Automated       |
| 14 | Travelers   | An infant can't travel without an adult                                      | Business edge | P1       | Automated       |
| 15 | Stations    | Typing an exact code (NYP) selects the station without a pick                | Positive      | P2       | Next            |
| 16 | Travelers   | Zero travelers disables the search                                           | Negative      | P2       | Next            |
| 17 | Dates       | The last bookable day (today + 11 months) can be picked; the day after can't  | Business edge | P2       | Next            |
| 18 | Stations    | Markup typed into From isn't executed and is rejected as an invalid station  | Security      | P2       | Next            |
| 19 | Trip type   | Multi-City and Group Travel                                                  | Positive      | P2       | Next            |
| 20 | Form        | Promo and coupon codes                                                       | Positive      | P2       | Next            |
| 21 | Trip type   | Switching trip type, including picking a return date while One-Way is selected | Positive      | P2       | Next            |
| 22 | Dates       | A return date before the depart date is handled                              | Business edge | P2       | Next            |

**Status:** Automated = in the suite and passing · Known issue = in the suite as `test.fixme`,
see below · Next = planned, not automated yet.

## Known issues

**Swap (scenario 9) — `test.fixme`.** When the suite clicks swap right after choosing the
stations, both fields end up showing the destination (WAS / WAS). A manual swap works, and so
does an automated one after a pause of about a second.

- A working swap makes the page look up both stations again (two `getResponseList` requests);
  the failing swap makes one lookup or none.
- After a failing swap, the To field's own accessible label also says Washington, so the stored
  value is wrong, not just the display.
- No signal in the page (element state, input value, focus or a network response) marks the
  moment the swap would work.

The only workaround is a fixed pause, which would hide what may be a real race condition in the
form. So the test keeps its assertion unchanged and is marked `test.fixme()`, reported as skipped.

## Next steps

Where I'd take the suite with more time:

- **Contract tests:** a schema for the search request (and the responses, once API docs exist),
  so a backend change that breaks the front end fails a test.
- **API tests** for the search endpoint through a typed client, given API docs and a test
  environment.
- **A controlled backend:** stub the search response, so tests never depend on production search.
- **CI:** GitHub Actions running the typecheck and tests, with the report as an artifact and the
  smoke test as the merge gate. Bot protection would likely block hosted runners, so it would run
  against a test environment.
- **Lint and formatting:** ESLint with `eslint-plugin-playwright` (it catches a missing `await`,
  the most common Playwright bug) and Prettier, as one `check` step.
- **Scope every component to its form,** as `StationField` is, after checking where the date
  picker and travelers popups render.
- **The scenarios marked Next,** including the booking-window end with Playwright's clock API.
- **Cross-browser and mobile:** Firefox, WebKit and the form's separate mobile layout.
- **Accessibility:** an automated scan. Noticed so far: the disabled Find Trains button gives no
  reason, and the station input's `aria-controls` points at itself.
- **Signed-in flows** (Use Points, Guest Rewards), with per-worker test accounts.
- **Test levels as the suite grows:** `tests/ui`, `tests/api` and `tests/e2e`.
- **Flakiness tracking** across runs.
