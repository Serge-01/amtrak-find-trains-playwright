import { expect, type Locator, type Page } from '@playwright/test';
import { StationField } from './station-field';

// The "Find trains" search form on the home page (the site's <amt-md-farefinder> element).
export class SearchForm {
  readonly root: Locator;
  readonly from: StationField;
  readonly to: StationField;
  readonly swapStationsButton: Locator;
  readonly findTrainsButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('amt-md-farefinder');
    this.from = new StationField(this.root.getByTestId('fare-finder-from-station-field-page'));
    this.to = new StationField(this.root.getByTestId('fare-finder-to-station-field-page'));
    this.swapStationsButton = this.root.getByRole('button', { name: 'Switch departure and arrival stations.' });
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
}
