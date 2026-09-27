import { expect, type Locator } from '@playwright/test';
import type { Station } from '../models/trip-search';

// The From or To field: an autocomplete that turns into a station card once a station is chosen.
export class StationField {
  readonly input: Locator;
  readonly suggestions: Locator;
  readonly selection: Locator; // the card: code, city and station name

  constructor(root: Locator) {
    // The wrapper around the input also has role=combobox and the same name, so target the <input> itself.
    this.input = root.locator('input[role="combobox"]');
    this.suggestions = root.getByRole('option');
    this.selection = root.getByTestId('refine-search-from&to');
  }

  suggestion(station: Station): Locator {
    return this.suggestions.filter({ hasText: `(${station.code})` });
  }

  async choose(station: Station): Promise<void> {
    await this.input.fill(station.searchTerm);
    await this.suggestion(station).click();
    await expect(this.selection).toContainText(station.code);
  }
}
