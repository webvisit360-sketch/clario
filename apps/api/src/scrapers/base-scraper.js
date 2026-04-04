const { chromium } = require('playwright');

let localBrowser = null;
let brightDataBrowser = null;

async function getLocalBrowser() {
  if (!localBrowser || !localBrowser.isConnected()) {
    localBrowser = await chromium.launch({ headless: true });
  }
  return localBrowser;
}

async function getBrightDataBrowser() {
  if (!brightDataBrowser || !brightDataBrowser.isConnected()) {
    const wss = process.env.BRIGHT_DATA_WSS;
    if (!wss) throw new Error('BRIGHT_DATA_WSS not configured');
    brightDataBrowser = await chromium.connectOverCDP(wss);
  }
  return brightDataBrowser;
}

async function getBrowser() {
  if (process.env.BRIGHT_DATA_WSS) {
    return getBrightDataBrowser();
  }
  return getLocalBrowser();
}

async function runScraper(fn, credentials, partNumber, seller, options = {}) {
  const timeout = options.timeout || 20000;
  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Restore session cookie if provided
  if (options.sessionCookie) {
    try {
      const cookies = JSON.parse(options.sessionCookie);
      if (Array.isArray(cookies)) {
        await context.addCookies(cookies);
      }
    } catch {
      // Invalid cookie format, proceed without session
    }
  }

  let retried = false;

  async function attempt() {
    try {
      const result = await Promise.race([
        fn(page, credentials, partNumber, seller),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Scraper timeout')), timeout)
        ),
      ]);
      return result;
    } catch (err) {
      // Retry once on network errors
      if (!retried && err.message && (err.message.includes('net::') || err.message.includes('Navigation timeout'))) {
        retried = true;
        return attempt();
      }
      return {
        seller_id: seller.id,
        seller_name: seller.name,
        price_net: null,
        currency: 'EUR',
        stock_qty: null,
        availability: '',
        image_url: null,
        part_number_found: partNumber,
        add_to_cart_url: null,
        status: 'error',
        error: err.message,
      };
    }
  }

  try {
    return await attempt();
  } finally {
    await context.close();
  }
}

async function closeBrowser() {
  if (localBrowser) {
    await localBrowser.close();
    localBrowser = null;
  }
  if (brightDataBrowser) {
    await brightDataBrowser.close();
    brightDataBrowser = null;
  }
}

module.exports = { getBrowser, runScraper, closeBrowser };
