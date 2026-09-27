import { expect, type Locator, type Page } from '@playwright/test';
import { TRAVELER_TYPES, type Party, type TravelerType } from '../models/trip-search';

// The site's test IDs use the plural "infants" for this one type.
const TEST_ID_NAMES: Record<TravelerType, string> = {
  adult: 'adult',
  senior: 'senior',
  youth: 'youth',
  child: 'child',
  infant: 'infants',
};

// The travelers dropdown: a +/- counter for each traveler type, Reset and Close.
export class TravelersPanel {
  // Its accessible name carries the party size, e.g. "1 Traveler Add travelers and discounts".
  readonly toggle: Locator;
  readonly panel: Locator;
  readonly messages: Locator;
  readonly resetButton: Locator;
  // Close keeps the counts. The Done button at the bottom works too, but a fixed promo
  // banner at the bottom of the page can cover it.
  readonly closeButton: Locator;

  constructor(page: Page) {
    // The page has a second, hidden copy of the toggle for the mobile layout.
    this.toggle = page.getByTestId('traveler-dropdown-button').filter({ visible: true });
    this.panel = page.locator('#traveler-menu');
    this.messages = this.panel.locator('.traveler-dropdown__messages');
    this.resetButton = this.panel.getByTestId('traveler-clear');
    this.closeButton = this.panel.getByRole('button', { name: 'Close', exact: true });
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

  // Resets to the default (one adult), then adds or removes travelers to match the party.
  async setParty(party: Party): Promise<void> {
    await this.resetButton.click();
    const adults = party.adult ?? 0;
    if (adults === 0) {
      await this.remove('adult');
    } else {
      await this.add('adult', adults - 1);
    }
    for (const type of TRAVELER_TYPES) {
      if (type !== 'adult') {
        await this.add(type, party[type] ?? 0);
      }
    }
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await expect(this.panel).toBeHidden();
  }
}
