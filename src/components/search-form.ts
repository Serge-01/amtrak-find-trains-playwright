import { expect, type Locator, type Page } from '@playwright/test';
import { StationField } from './station-field';
import { DatePicker } from './date-picker';
import type { TripType } from '../models/trip-search';

// The "Find trains" search form on the home page (the site's <amt-md-farefinder> element).
export class SearchForm {
  readonly root: Locator;
  readonly from: StationField;
  readonly to: StationField;
  readonly swapStationsButton: Locator;
  readonly findTrainsButton: Locator;
  readonly tripTypeToggle: Locator;
  readonly departDateLabel: Locator;
  readonly datePicker: DatePicker;

  constructor(private readonly page: Page) {
    this.root = page.locator('amt-md-farefinder');
    this.from = new StationField(this.root.getByTestId('fare-finder-from-station-field-page'));
    this.to = new StationField(this.root.getByTestId('fare-finder-to-station-field-page'));
    this.swapStationsButton = this.root.getByRole('button', { name: 'Switch departure and arrival stations.' });
    this.tripTypeToggle = this.root.getByTestId('fare-finder-travel-selection');
    // The floating "Depart Date" label sits on top of the input and catches the click,
    // so the calendar is opened by clicking the label, as a user does.
    this.departDateLabel = this.root.locator('label', { hasText: 'Depart Date' }).filter({ visible: true });
    this.datePicker = new DatePicker(page);
    // The page has a second, hidden copy of the button for the mobile layout.
    this.findTrainsButton = this.root.getByTestId('fare-finder-findtrains-button').filter({ visible: true });
  }

  // An inline validation message under the form fields.
  validationError(message: string): Locator {
    return this.root.locator('am-error-new', { hasText: message });
  }

  async waitUntilReady(): Promise<void> {
    // The home page is heavy, so this one check gets a longer ceiling than the 5s default.
    await expect(this.findTrainsButton).toBeVisible({ timeout: 15_000 });
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
}
