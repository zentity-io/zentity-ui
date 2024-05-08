const common = require('../common.js')
const config = require('../config.js')

jest.setTimeout(40 * 1000) // must be higher than Playwright's default 30s

describe('Home', () => {
  beforeAll(async () => await common.setup())
  afterAll(async () => await common.teardown())
  afterEach(async () => await common.screenshot(page, browserName))

  it('shows buttons for "Models" and "Explore"', async () => {
    await page.goto(common.url(), config.get('SLA'))
    await expect(page).toHaveText('a[href="#/models"]', 'Models', config.get('SLA'))
    await expect(page).toHaveText('a[href="#/explore"]', 'Explore', config.get('SLA'))
  })
  it('navigates to "Models"', async () => {
    await page.goto(common.url(), config.get('SLA'))
    await page.click('a[href="#/models"]')
    await expect(page).toHaveText('.euiPageBody > h1', 'Entity models', config.get('SLA'))
  })
  it('navigates to "Explore"', async () => {
    await page.goto(common.url(), config.get('SLA'))
    await page.click('a[href="#/explore"]', config.get('SLA'))
    await expect(page).toHaveText('.euiPageBody > h1', 'Explore', config.get('SLA'))
  })
})
