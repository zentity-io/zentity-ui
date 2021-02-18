// Needs to be higher than the default Playwright timeout
jest.setTimeout(40 * 1000);

const URL_HOME = 'http://localhost:2048';
const URL_MODELS = 'http://localhost:2048/#/models';
const URL_EXPLORE = 'http://localhost:2048/#/explore';
const SLA = { timeout: 2 * 1000 }; // Time it should take for a selector to pass

describe('Home', () => {
  it('shows buttons for "Models" and "Explore"', async () => {
    await page.goto(URL_HOME);
    await expect(page).toHaveText('a[href="#/models"]', "Models", SLA);
    await expect(page).toHaveText('a[href="#/explore"]', "Explore", SLA);
  });
  it('navigates to "Models"', async () => {
    await page.goto(URL_HOME);
    await page.click('a[href="#/models"]');
    await expect(page).toHaveText('.euiPageBody > h1', "Entity models", SLA);
  });
  it('navigates to "Explore"', async () => {
    await page.goto(URL_HOME);
    await page.click('a[href="#/explore"]');
    await expect(page).toHaveText('.euiPageBody > h1', "Explore", SLA);
  });
});

describe('Models', () => {
  it('loads', async () => {
    await page.goto(URL_MODELS);
    await expect(page).toHaveText('.euiPageBody > h1', "Entity models", SLA);
  });
});
