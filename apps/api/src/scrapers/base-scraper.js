const { chromium } = require('playwright');

let browser = null;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

async function runScraper(fn, credentials, partNumber, seller, timeout = 12000) {
  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const result = await Promise.race([
      fn(page, credentials, partNumber, seller),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Scraper timeout')), timeout)
      ),
    ]);
    return result;
  } catch (err) {
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
  } finally {
    await context.close();
  }
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

module.exports = { getBrowser, runScraper, closeBrowser };
