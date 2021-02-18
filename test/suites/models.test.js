const common = require("../common.js");
const config = require("../config.js");

jest.setTimeout(40 * 1000); // must be higher than Playwright's default 30s

describe('Models', () => {

  beforeAll(async () => await common.setup());
  afterAll(async () => await common.teardown());
  afterEach(async () => await common.screenshot(page));

  it('loads', async () => {
    await page.goto(config.get('URL_MODELS'));
    await expect(page).toHaveText('.euiPageBody > h1', 'Entity models', config.get('SLA'));
  });
  it('lists models', async () => {
    await expect(page).toHaveText('.euiTableRow:first-child .euiTableRowCell:first-child', 'zentity_tutorial_4_person', config.get('SLA'));
  });
});
