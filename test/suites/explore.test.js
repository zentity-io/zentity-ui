const common = require('../common.js')
const config = require('../config.js')

jest.setTimeout(40 * 1000) // must be higher than Playwright's default 30s

describe('Explore', () => {
  beforeAll(async () => await common.setup())
  afterAll(async () => await common.teardown())
  afterEach(async () => await common.screenshot(page, browserName))

  it('loads', async () => {
    await page.goto(common.url('/#/explore'), config.get('SLA'))
    await expect(page).toHaveText('.euiPageBody > h1', 'Explore', config.get('SLA'))
  })
})
