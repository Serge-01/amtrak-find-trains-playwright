import { expect, type Locator, type Page } from '@playwright/test';
import type { TravelerType } from '../models/trip-search';

// The site's test IDs use the plural "infants" for this one type.
const TEST_ID_NAMES: Record<TravelerType, string> = {
  adult: 'adult',
  senior: 'senior',
  youth: 'youth',
  child: 'child',
  infant: 'infants',
};

// The travelers dropdown: a +/- counter for each traveler type.
export class TravelersPanel {
  // Its accessible name carries the party size, e.g. "1 Traveler Add travelers and discounts".
  readonly toggle: Locator;
  readonly panel: Locator;
  readonly messages: Locator;

  constructor(page: Page) {
    // The page has a second, hidden copy of the toggle for the mobile layout.
    this.toggle = page.getByTestId('traveler-dropdown-button').filter({ visible: true });
    this.panel = page.locator('#traveler-menu');
    this.messages = this.panel.locator('.traveler-dropdown__messages');
  }

  addButton(type: TravelerType): Locator {
    return this.panel.getByTestId(`traveler-component-${TEST_ID_NAMES[type]}-incr-button`);
  }

  removeButton(type: TravelerType): Locator {
    return this.panel.getByTestId(`traveler-component-${TEST_ID_NAMES[type]}-dcr-button`);
  }

  async open(): Promise<void> {
    await this.toggle.click();
    await expect(this.panel).toBeVisible();
  }

  async add(type: TravelerType, count = 1): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.addButton(type).click();
    }
  }

  async remove(type: TravelerType, count = 1): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.removeButton(type).click();
    }
  }
}
