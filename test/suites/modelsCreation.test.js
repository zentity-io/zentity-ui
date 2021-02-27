const common = require("../common.js");
const config = require("../config.js");

jest.setTimeout(40 * 1000); // must be higher than Playwright's default 30s

describe('Models creation', () => {

  beforeAll(async () => await common.setupIndex());
  afterAll(async () => await common.teardown());
  afterEach(async () => await common.screenshot(page, browserName));

  it('loads', async () => {
    await page.goto(common.url('/#/models'), config.get('SLA'));
    await expect(page).toHaveText('.euiPageBody > h1', 'Entity models', config.get('SLA'));
  });
  it('says there are no models', async () => {
    await expect(page).toHaveText('.euiEmptyPrompt .euiTitle', 'No Models', config.get('SLA'));
  });

  // Click "Create Model" and validate the modal dialogue.
  it('opens modal when clicking "create" button', async () => {
    await page.click('.euiEmptyPrompt button', config.get('SLA'));
    await expect(page).toHaveSelector('.euiModal', config.get('SLA'));
  });
  it('has modal with correct title', async () => {
    await expect(page).toHaveText('.euiModal .euiTitle', 'Create Model', config.get('SLA'));
  });
  it('has modal with "create" button disabled', async () => {
    await expect(page).toHaveSelector('.euiModal .euiButton--primary:disabled', config.get('SLA'));
  });
  it('enables "create" button when name is given', async () => {
    await page.fill('.euiModal input[type=text]', 'zentity_tutorial_4_person', config.get('SLA'));
    await expect(page).not.toHaveSelector('.euiModal .euiButton--primary:disabled', config.get('SLA'));
    await expect(page).toHaveSelector('.euiModal .euiButton--primary', config.get('SLA'));
  });
  it('creates model and notifies user of success', async () => {
    await page.click('.euiModal .euiButton--primary', config.get('SLA'));
    await expect(page).toHaveText('.euiToast--success .euiToastBody', 'zentity_tutorial_4_person', config.get('SLA'));
  });
  it('navigates to created model', async () => {
    await expect(page).toHaveText('.euiPageBody > h1', 'zentity_tutorial_4_person', config.get('SLA'));
  });

  // Click "Create Attribute" and validate the modal dialogue.
  it('disables "save" button when there are no changes', async () => {
    await expect(page).toHaveSelector('.euiPageBody button[type=submit]:first-child:disabled', config.get('SLA'));
  });
  it('instructs user to define attributes', async () => {
    await expect(page).toHaveText('.euiEmptyPrompt h3.euiTitle:first-child', 'Define Attributes', config.get('SLA'));
  });
  it('opens modal on clicking "create attribute" button', async () => {
    await page.click('.euiEmptyPrompt button', config.get('SLA'));
    await expect(page).toHaveSelector('.euiModal', config.get('SLA'));
  });
  it('has modal with correct title', async () => {
    await expect(page).toHaveText('.euiModal .euiTitle', 'Create', config.get('SLA'));
  });
  it('has modal with "create" button disabled', async () => {
    await expect(page).toHaveSelector('.euiModal .euiButton--primary:disabled', config.get('SLA'));
  });
  it('enables "create" button when name is given', async () => {
    await page.fill('.euiModal input[type=text]', 'first_name', config.get('SLA'));
    await expect(page).not.toHaveSelector('.euiModal .euiButton--primary:disabled', config.get('SLA'));
    await expect(page).toHaveSelector('.euiModal .euiButton--primary', config.get('SLA'));
  });
  it('creates attribute and navigates to flyout editor', async () => {
    await page.click('.euiModal .euiButton--primary', config.get('SLA'));
    await expect(page).toHaveSelector('.euiFlyout', config.get('SLA'));
  });
  it('has flyout editor with title of attribute', async () => {
    await expect(page).toHaveText('.euiFlyoutHeader .euiTitle', 'first_name', config.get('SLA'));
  });
  it('has default attribute score of 0.5', async () => {
    await expect(page).toHaveSelector('#attribute-score[value="0.5"]', config.get('SLA'));
  });
  it('has note about attribute score of 0.5', async () => {
    await expect(page).toHaveSelector('.euiCallOutHeader', 'Note', config.get('SLA'));
  });
});
