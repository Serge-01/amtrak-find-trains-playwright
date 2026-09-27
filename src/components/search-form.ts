import { expect, type Locator, type Page } from '@playwright/test';
import { JOURNEY_SEARCH_URL, type JourneyRequest, type JourneySearchBody } from '../api/journey-search';
import { StationField } from './station-field';
import { DatePicker } from './date-picker';
import { TravelersPanel } from './travelers-panel';
import type { CalendarDate } from '../utils/dates';
import { partySize, type TripSearch, type TripType } from '../models/trip-search';

// The "Find trains" search form on the home page (the site's <amt-md-farefinder> element).
export class SearchForm {
  readonly root: Locator;
  readonly from: StationField;
  readonly to: StationField;
  readonly swapStationsButton: Locator;
  readonly findTrainsButton: Locator;
  readonly tripTypeToggle: Locator;
  readonly departDateLabel: Locator;
  readonly departDateInput: Locator;
  readonly returnDateInput: Locator;
  readonly datePicker: DatePicker;
  readonly travelers: TravelersPanel;

  constructor(private readonly page: Page) {
    this.root = page.locator('amt-md-farefinder');
    this.from = new StationField(this.root.getByTestId('fare-finder-from-station-field-page'));
    this.to = new StationField(this.root.getByTestId('fare-finder-to-station-field-page'));
    this.swapStationsButton = this.root.getByRole('button', { name: 'Switch departure and arrival stations.' });
    this.tripTypeToggle = this.root.getByTestId('fare-finder-travel-selection');
    // The floating "Depart Date" label sits on top of the input and catches the click,
    // so the calendar is opened by clicking the label, as a user does.
    this.departDateLabel = this.root.locator('label', { hasText: 'Depart Date' }).filter({ visible: true });
    // The depart and return inputs share one test ID, so data-julie tells them apart.
    // It ends in _oneway or _roundtrip, hence ^= ("starts with") for the depart input.
    this.departDateInput = this.root.locator('input[data-julie^="departdisplay_booking"]').filter({ visible: true });
    this.returnDateInput = this.root.locator('input[data-julie="returndisplay_booking_roundtrip"]').filter({ visible: true });
    this.datePicker = new DatePicker(page);
    this.travelers = new TravelersPanel(page);
    // The page has a second, hidden copy of the button for the mobile layout.
    this.findTrainsButton = this.root.getByTestId('fare-finder-findtrains-button').filter({ visible: true });
  }

  // An inline validation message under the form fields.
  validationError(message: string): Locator {
    return this.root.locator('am-error-new', { hasText: message });
  }

  async waitUntilReady(): Promise<void> {
    await expect(this.findTrainsButton).toBeVisible();
    await expect(this.from.input).toBeEditable();
  }

  async selectTripType(tripType: TripType): Promise<void> {
    if ((await this.tripTypeToggle.getAttribute('aria-label')) === `Trip Type:${tripType}`) {
      return; // already selected
    }
    await this.tripTypeToggle.click();
    const option = tripType === 'One-Way' ? 'fare-finder-oneway-trip-tab' : 'fare-finder-round-trip-tab';
    await this.page.getByTestId(option).filter({ visible: true }).click();
    await expect(this.tripTypeToggle).toHaveAttribute('aria-label', `Trip Type:${tripType}`);
  }

  async openDatePicker(): Promise<void> {
    await this.departDateLabel.click();
    await expect(this.datePicker.root).toBeVisible();
  }

  // Opens the calendar from the Depart field, picks the date(s), then clicks Done.
  async chooseDates(departDate: CalendarDate, returnDate?: CalendarDate): Promise<void> {
    await this.openDatePicker();
    await this.datePicker.select(departDate);
    if (returnDate) {
      await this.datePicker.select(returnDate);
    }
    await this.datePicker.confirm();
  }

  // Fills in whatever the search contains; fields left undefined stay empty.
  async fill(search: TripSearch): Promise<void> {
    await this.selectTripType(search.tripType);
    if (search.from) {
      await this.from.choose(search.from);
    }
    if (search.to) {
      await this.to.choose(search.to);
    }
    if (search.departDate) {
      await this.chooseDates(search.departDate, search.returnDate);
    }
    // The form starts with one adult, so the travelers panel is only opened for other parties.
    const isDefaultParty = search.party.adult === 1 && partySize(search.party) === 1;
    if (!isDefaultParty) {
      await this.travelers.open();
      await this.travelers.setParty(search.party);
      await this.travelers.close();
    }
  }

  // Clicks Find Trains and returns the search request the form sends. The request is
  // stopped at the network layer so no search reaches the site: the scope ends at the
  // click, and the site's bot protection rejects searches from automated browsers anyway.
  async findTrainsAndCaptureRequest(): Promise<JourneyRequest> {
    await this.page.route(JOURNEY_SEARCH_URL, (route) => route.abort());
    const requestPromise = this.page.waitForRequest(JOURNEY_SEARCH_URL);
    await this.findTrainsButton.click();
    const request = await requestPromise;
    const body: JourneySearchBody = request.postDataJSON();
    expect(body, 'search request body has an unexpected shape')
      .toHaveProperty('journeyRequest.journeyLegRequests.0.passengers');
    return body.journeyRequest;
  }
}
