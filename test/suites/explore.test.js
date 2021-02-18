const common = require("../common.js");
const config = require("../config.js");

jest.setTimeout(40 * 1000); // must be higher than Playwright's default 30s

describe('Explore', () => {

  beforeAll(async () => await common.setup());
  afterAll(async () => await common.teardown());
  afterEach(async () => await common.screenshot(page));

  it('loads', async () => {
    await page.goto(config.get('URL_EXPLORE'));
    await expect(page).toHaveText('.euiPageBody > h1', 'Explore', config.get('SLA'));
  });
});
