// Autodoc B2B Scraper
// Login: https://www.autodoc.de/login → #email, #password, button[type=submit]
// Search: https://www.autodoc.de/search?query={partNumber}
// Price selectors: .price-value, fallback JSON in <script type="application/json">

const shopId = 'autodoc';

function matches(seller) {
  return seller.url?.toLowerCase().includes('autodoc') ||
    seller.name?.toLowerCase().includes('autodoc');
}

async function login(page, credentials) {
  try {
    console.log('[autodoc] logging in...');
    await page.goto('https://www.autodoc.de/login', { waitUntil: 'domcontentloaded' });

    // Restore session if cookie provided
    if (credentials.sessionCookie) {
      console.log('[autodoc] reusing session cookie');
      return true;
    }

    await page.fill('#email', credentials.username);
    await page.fill('#password', credentials.password);
    await page.click('button[type=submit]');

    await page.waitForURL('**/account**', { timeout: 10000 }).catch(() => {});

    // Check if login was successful by looking for account-related elements
    const isLoggedIn = await page.$('.user-menu, .account-menu, [data-testid="user-menu"]');
    if (isLoggedIn) {
      console.log('[autodoc] login successful');
      return true;
    }

    // Check for error messages
    const errorEl = await page.$('.error-message, .alert-danger, [class*="error"]');
    if (errorEl) {
      console.log('[autodoc] login failed — error message found');
      return false;
    }

    console.log('[autodoc] login status uncertain, proceeding');
    return true;
  } catch (err) {
    console.log('[autodoc] login error:', err.message);
    return false;
  }
}

async function search(page, partNumber) {
  try {
    console.log('[autodoc] searching for:', partNumber);
    await page.goto(`https://www.autodoc.de/search?query=${encodeURIComponent(partNumber)}`, {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForSelector('.product-list, .search-results, [class*="product"]', { timeout: 8000 }).catch(() => {});

    // Try to extract price from .price-value selector
    let priceNet = null;
    let productName = '';
    let stockQty = null;
    let availability = '';
    let imageUrl = null;
    let addToCartUrl = null;
    let partNumberFound = partNumber;

    // Try .price-value first
    const priceEl = await page.$('.price-value, .product-price, [class*="price"]');
    if (priceEl) {
      const priceText = await priceEl.textContent();
      const match = priceText.match(/[\d.,]+/);
      if (match) {
        priceNet = parseFloat(match[0].replace(',', '.'));
      }
    }

    // Fallback: look for JSON data in script tags
    if (priceNet === null) {
      const jsonScripts = await page.$$('script[type="application/json"], script[type="application/ld+json"]');
      for (const script of jsonScripts) {
        try {
          const content = await script.textContent();
          const data = JSON.parse(content);
          if (data.price || data.offers?.price) {
            priceNet = parseFloat(data.price || data.offers.price);
            break;
          }
        } catch {
          // Not valid JSON or no price field
        }
      }
    }

    // Extract product name
    const nameEl = await page.$('.product-name, .product-title, h1[class*="product"], [class*="title"]');
    if (nameEl) {
      productName = (await nameEl.textContent()).trim();
    }

    // Extract stock info
    const stockEl = await page.$('[class*="stock"], [class*="availability"], .availability');
    if (stockEl) {
      availability = (await stockEl.textContent()).trim();
      const qtyMatch = availability.match(/(\d+)/);
      if (qtyMatch) stockQty = parseInt(qtyMatch[1], 10);
    }

    // Extract image
    const imgEl = await page.$('.product-image img, [class*="product"] img');
    if (imgEl) {
      imageUrl = await imgEl.getAttribute('src');
    }

    if (priceNet === null) {
      console.log('[autodoc] product not found for:', partNumber);
      return [];
    }

    console.log('[autodoc] found product:', productName, 'price:', priceNet);
    return [{
      partNumberFound,
      productName,
      priceNet,
      currency: 'EUR',
      stockQty,
      availability,
      imageUrl,
      addToCartUrl,
    }];
  } catch (err) {
    console.log('[autodoc] search error:', err.message);
    return [];
  }
}

// Legacy scrape function for backward compatibility with existing search.js
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
