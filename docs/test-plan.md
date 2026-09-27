# Test plan — Amtrak "Find Trains" form

## Scope

**In scope:** the Find Trains search form on amtrak.com/home, up to and including the
**Find Trains** click. That covers:

- the trip type (One-Way, Round-Trip)
- the From and To stations
- the depart and return dates
- the travelers
- the validation messages
- the button's enabled and disabled state
- the search request the click sends

**Out of scope:**

- the results page and booking
- the other trip types (Multi-City, Group Travel)
- promo and coupon codes, Advanced Search and Use Points
- the Rail Passes and Auto Train tabs
- signed-in flows
- mobile layouts and browsers other than desktop Chrome

## Approach

**What is tested, and why.** The form's job is to turn a user's choices into a correct
search, and to refuse to search until the input is valid. So the suite checks two things:

1. **How the form behaves.** Suggestions, the date and traveler rules, and the validation
   messages. Above all, when Find Trains is enabled and when it isn't.
2. **What the click sends.** When Find Trains is clicked, the form sends a search request.
   The test captures it and checks that it carries exactly the route, dates and travelers
   that were entered. This is the one check below the UI, and the strongest evidence the
   form works: a form can look right and still send the wrong search.

**Where the test stops.** The search request is captured, checked, then aborted, so no
search reaches Amtrak. The scope ends at the click. Real searches would load production,
and the site's bot protection rejects searches from automated browsers anyway. Waiting for
results would make every run depend on something outside the scope.

**How scenarios were chosen and prioritized:**

- **P0:** a valid search can be submitted with the right data, and a search missing a
  required field can't be submitted. If these fail, the feature is broken.
- **P1:** the business rules a real user runs into:
  - same station on both sides
  - past dates
  - a round trip without a return date
  - the online traveler limit
  - an infant without an adult
  - text that isn't a station
- **P2:** convenience behavior and rarer paths.

Each rule is tested on both sides where it has a boundary: 8 travelers can search, and the
9th is sent to phone booking. Each error test also checks the recovery where there is one,
e.g. adding an adult makes an infant booking valid again.

**Categories** follow the review criteria: positive, negative, business edge case and
security.

**Level:** all tests are UI tests in Playwright, desktop Chrome, run in parallel with an
isolated browser context each. The one-way search test is tagged `@smoke` as the quickest
health check.

## Assumptions and risks

1. **The business rules are observed, not specified.** There is no requirements document,
   so the expected behavior is what the live site did on 2026-09-26. That covers these
   rules and messages:
   - 8 travelers can search online; a 9th is sent to phone booking.
   - An infant needs an adult.
   - A round trip needs a return date: the calendar's Done stays disabled without one.
   - Days before today are disabled.
   - Typing an exact code (NYP) selects the station; typed text that isn't picked from the
     suggestions is invalid.
   - The exact texts of the UI messages.

   All of them live in `src/data/booking-rules.ts`, so a changed rule is a one-line edit.
2. **The search request format is observed, not documented.** The shape comes from a
   captured request (`src/api/journey-search.ts`), and only the fields the tests check are
   modeled.
3. **The site is live production, owned by a third party.** Amtrak can change the markup,
   texts or rules at any time. Mitigations:
   - locators use the site's own test IDs and accessible names
   - expected values are kept in one place
   - traces are kept on failure
4. **Bot protection.** Page loads work from a normal network, but searches from automated
   browsers are rejected. A blocked page load fails fast with a clear message. Runs use 2
   workers and no retries locally, so real flakiness stays visible.
5. **Environment.** Desktop Chrome at 1280×800, browser timezone America/New_York. Test
   dates stay within the two months the calendar shows, so no month paging is needed.
6. **Session memory.** The form restores the previous search within a browser session.
   Every test gets a fresh context, so tests don't inherit each other's input.

## Test data

- **Stations:** New York Penn (NYP) and Washington Union Station (WAS). They are busy
  Northeast Corridor stations that always have service (`src/data/stations.ts`).
- **Dates:** relative to the browser's today. Depart is 14 days out; the return is 3 nights
  later. Nothing expires.
- **Travelers:** the site default of one adult unless a test sets a party, e.g.
  `{ adult: 2, child: 1 }`.
- **Built with `TripSearchBuilder`.** Every test starts from a valid search and changes only
  what it's testing.

## Scenarios

| #  | Area        | Scenario                                                                    | Category      | Priority | Status          |
| -- | ----------- | --------------------------------------------------------------------------- | ------------- | -------- | --------------- |
| 1  | Submission  | One-way search sends the route, date and traveler that were entered (`@smoke`) | Positive      | P0       | Automated       |
| 2  | Submission  | Round-trip search for a group sends both legs and every traveler             | Positive      | P0       | Automated       |
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

**Status:**

- **Automated:** in the suite and passing.
- **Known issue:** in the suite as `test.fixme`, see below.
- **Next:** planned, not automated yet.

## Known issues

**Swap (scenario 9) — `test.fixme`.** When the suite clicks swap right after choosing the
stations, both fields end up showing the destination (WAS / WAS). A manual swap works. With
a pause of about one second before the click, the automated swap works too.

What was found:

- A working swap makes the page look up both stations again (two `getResponseList`
  requests). The failing swap makes one lookup or none.
- After a failing swap, the To field's own accessible label also says Washington, so the
  stored value is wrong, not just the display.
- No signal in the page (element state, input value, focus, or a network response) marks
  the moment the swap would work.

The only workaround is a fixed pause, which would hide what may be a real race condition in
the form. So the test stays in the suite with its assertion unchanged, marked `test.fixme()`,
and is reported as skipped.

## With more time

- **Contract tests:** Zod schemas for the search request (and the responses, once API docs
  exist), so a backend change that breaks the front end fails a test.
- **API tests** for the search endpoint through a typed client. They need API docs and a
  test environment.
- **A controlled backend:** stub the search response at the click boundary, so tests never
  depend on production search.
- **CI:** a GitHub Actions workflow running the typecheck and tests, with the HTML report
  as an artifact and the smoke test as the merge gate. Amtrak's bot protection would likely
  block hosted runners, so a real setup would use a test environment.
- **Lint:** ESLint next to the typecheck, as one `check` step.
- **The scenarios marked Next**, including the booking-window end which needs the browser
  clock frozen with Playwright's clock API.
- **Cross-browser and mobile:** Firefox, WebKit and a mobile viewport. The form renders a
  separate mobile layout.
- **Accessibility:** an automated scan. Two gaps were noticed: the disabled Find Trains
  button gives no reason, and the station input's `aria-controls` points at itself.
- **Signed-in flows** (Use Points, Guest Rewards): per-worker test accounts, with
  credentials from CI secrets.
- **Test levels as the suite grows:** `tests/ui`, `tests/api` and `tests/e2e`, where e2e is
  search → results → booking.
- **Flakiness tracking** across runs.
