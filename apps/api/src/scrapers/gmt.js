// GMT B2B Scraper
// GMT is a Slovenian automotive parts distributor
// Login/search URL patterns will be discovered at runtime via form discovery

const shopId = 'gmt';

function matches(seller) {
  return seller.url?.toLowerCase().includes('gmt') ||
    seller.name?.toLowerCase().includes('gmt');
}

async function login(page, credentials) {
  try {
    console.log('[gmt] logging in...');

    if (credentials.sessionCookie) {
      console.log('[gmt] reusing session cookie');
      return true;
    }

    const baseUrl = 'https://www.gmt.si';
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Find login link
    const loginLink = await page.$('a[href*="login"], a[href*="prijava"], a[href*="account"]');
    if (loginLink) {
      await loginLink.click();
      await page.waitForLoadState('domcontentloaded');
    }

    // Find login form
    const form = await page.waitForSelector(
      'form[action*="login"], form[action*="prijava"], form[method="post"]',
      { timeout: 8000 }
    ).catch(() => null);

    if (!form) {
      console.log('[gmt] login form not found');
      return false;
    }

    const emailInput = await page.$('input[type="email"], input[name*="email"], input[name*="user"], input[name*="uporabnik"]');
    const passInput = await page.$('input[type="password"]');

    if (!emailInput || !passInput) {
      console.log('[gmt] login fields not found');
      return false;
    }

    await emailInput.fill(credentials.username);
    await passInput.fill(credentials.password);

    const submitBtn = await page.$('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    } else {
      await passInput.press('Enter');
    }

    await page.waitForLoadState('domcontentloaded');

    const errorEl = await page.$('[class*="error"], [class*="napaka"], .alert-danger');
    if (errorEl) {
      const errorText = await errorEl.textContent();
      if (errorText && errorText.trim().length > 0) {
        console.log('[gmt] login failed:', errorText.trim());
        return false;
      }
    }

    console.log('[gmt] login successful');
    return true;
  } catch (err) {
    console.log('[gmt] login error:', err.message);
    return false;
  }
}

async function search(page, partNumber) {
  try {
    console.log('[gmt] searching for:', partNumber);

    const searchInput = await page.$('input[name*="search"], input[name*="iskanje"], input[type="search"], #search');
    if (searchInput) {
      await searchInput.fill(partNumber);
      await searchInput.press('Enter');
      await page.waitForLoadState('domcontentloaded');
    } else {
      const currentUrl = page.url();
      const baseUrl = new URL(currentUrl).origin;
      await page.goto(`${baseUrl}/search?q=${encodeURIComponent(partNumber)}`, {
        waitUntil: 'domcontentloaded',
      });
    }

    await page.waitForTimeout(2000);

    let priceNet = null;
    let productName = '';
    let stockQty = null;
    let availability = '';
    let imageUrl = null;
    let addToCartUrl = null;

    const priceSelectors = ['.price', '.cena', '[class*="price"]', '[class*="cena"]', '.product-price'];
    for (const sel of priceSelectors) {
      const priceEl = await page.$(sel);
      if (priceEl) {
        const priceText = await priceEl.textContent();
        const match = priceText.match(/[\d.,]+/);
        if (match) {
          priceNet = parseFloat(match[0].replace(/\./g, '').replace(',', '.'));
          break;
        }
      }
    }

    const nameSelectors = ['.product-name', '.artikel-naziv', 'h1', '.product-title'];
    for (const sel of nameSelectors) {
      const el = await page.$(sel);
      if (el) {
        productName = (await el.textContent()).trim();
        if (productName) break;
      }
    }

    const stockSelectors = ['[class*="stock"]', '[class*="zaloga"]', '[class*="availability"]'];
    for (const sel of stockSelectors) {
      const el = await page.$(sel);
      if (el) {
        availability = (await el.textContent()).trim();
        const qtyMatch = availability.match(/(\d+)/);
        if (qtyMatch) stockQty = parseInt(qtyMatch[1], 10);
        break;
      }
    }

    const imgEl = await page.$('.product-image img, [class*="product"] img');
    if (imgEl) {
      imageUrl = await imgEl.getAttribute('src');
    }

    if (priceNet === null) {
      console.log('[gmt] product not found for:', partNumber);
      return [];
    }

    console.log('[gmt] found product:', productName, 'price:', priceNet);
    return [{
      partNumberFound: partNumber,
      productName,
      priceNet,
      currency: 'EUR',
      stockQty,
      availability,
      imageUrl,
      addToCartUrl,
    }];
  } catch (err) {
    console.log('[gmt] search error:', err.message);
    return [];
  }
}

// Legacy scrape function for backward compatibility
async function scrape(credentials, partNumber, seller) {
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
    error: 'Use B2B stream endpoint for scraping',
  };
}

module.exports = { shopId, matches, login, search, scrape };
