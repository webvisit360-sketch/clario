import { getCachedTecDoc, cacheTecDocResult } from '@clario/supabase';
import type { TecDocArticle, TecDocSearchResult } from '@clario/shared';

const TECDOC_API_URL = process.env.TECDOC_API_URL;
const TECDOC_API_KEY = process.env.TECDOC_API_KEY;
const TECDOC_PROVIDER_ID = process.env.TECDOC_PROVIDER_ID;

const hasCredentials = Boolean(TECDOC_API_KEY && TECDOC_PROVIDER_ID);

// ─────────────────────────────────────────────
// Mock data — realistic automotive part cross-references
// ─────────────────────────────────────────────

interface MockEntry {
  articles: TecDocArticle[];
}

// Normalize part numbers for lookup: strip spaces, dashes, dots, uppercase
function normalize(pn: string): string {
  return pn.replace(/[\s\-\.]/g, '').toUpperCase();
}

// Map of normalized part numbers → mock TecDoc data
// Each key can be an OE number OR aftermarket number — they all cross-reference
const MOCK_DATA: Record<string, MockEntry> = {};

function addMockGroup(numbers: string[], articles: TecDocArticle[]) {
  for (const num of numbers) {
    MOCK_DATA[normalize(num)] = { articles };
  }
}

// ── Brake discs (VW Golf / Audi A3) ──
addMockGroup(
  ['1K0615301M', '1K0615301AC', '0986479C26', 'DF6143S', '09.C400.13', '92181505'],
  [
    { brandNo: 5, brandName: 'Bosch', articleNo: '0 986 479 C26', genericArticleNo: 15058, genericArticleName: 'Brake Disc', oeNumbers: ['1K0 615 301 M', '1K0 615 301 AC'], tradeNumbers: [] },
    { brandNo: 1193, brandName: 'Brembo', articleNo: '09.C400.13', genericArticleNo: 15058, genericArticleName: 'Brake Disc', oeNumbers: ['1K0 615 301 M'], tradeNumbers: [] },
    { brandNo: 46, brandName: 'TRW', articleNo: 'DF6143s', genericArticleNo: 15058, genericArticleName: 'Brake Disc', oeNumbers: ['1K0 615 301 M'], tradeNumbers: [] },
    { brandNo: 120, brandName: 'Textar', articleNo: '92181505', genericArticleNo: 15058, genericArticleName: 'Brake Disc', oeNumbers: ['1K0 615 301 M'], tradeNumbers: ['92181505'] },
  ]
);

// ── Brake pads (VW Golf / Audi A3 front) ──
addMockGroup(
  ['5K0698151', '0986494399', 'GDB1550', 'P85073', '2519601'],
  [
    { brandNo: 5, brandName: 'Bosch', articleNo: '0 986 494 399', genericArticleNo: 15001, genericArticleName: 'Brake Pad Set', oeNumbers: ['5K0 698 151'], tradeNumbers: [] },
    { brandNo: 46, brandName: 'TRW', articleNo: 'GDB1550', genericArticleNo: 15001, genericArticleName: 'Brake Pad Set', oeNumbers: ['5K0 698 151'], tradeNumbers: [] },
    { brandNo: 1193, brandName: 'Brembo', articleNo: 'P 85 073', genericArticleNo: 15001, genericArticleName: 'Brake Pad Set', oeNumbers: ['5K0 698 151'], tradeNumbers: [] },
    { brandNo: 120, brandName: 'Textar', articleNo: '2519601', genericArticleNo: 15001, genericArticleName: 'Brake Pad Set', oeNumbers: ['5K0 698 151'], tradeNumbers: ['2519601'] },
  ]
);

// ── Oil filter (VW/Audi 2.0 TSI) ──
addMockGroup(
  ['03C115561H', '03C115561D', 'OC593/4', 'W71294', 'HU7197X'],
  [
    { brandNo: 77, brandName: 'MAHLE', articleNo: 'OC 593/4', genericArticleNo: 14001, genericArticleName: 'Oil Filter', oeNumbers: ['03C 115 561 H', '03C 115 561 D'], tradeNumbers: [] },
    { brandNo: 76, brandName: 'MANN-FILTER', articleNo: 'W 712/94', genericArticleNo: 14001, genericArticleName: 'Oil Filter', oeNumbers: ['03C 115 561 H'], tradeNumbers: [] },
    { brandNo: 114, brandName: 'HENGST', articleNo: 'H317W', genericArticleNo: 14001, genericArticleName: 'Oil Filter', oeNumbers: ['03C 115 561 H'], tradeNumbers: [] },
    { brandNo: 76, brandName: 'MANN-FILTER', articleNo: 'HU 719/7 x', genericArticleNo: 14001, genericArticleName: 'Oil Filter', oeNumbers: ['03C 115 561 H'], tradeNumbers: ['HU7197X'] },
  ]
);

// ── Air filter (VW Golf 7 / Audi A3 8V 1.4 TSI) ──
addMockGroup(
  ['5Q0129620B', 'C27009', 'LX27741', 'A1598'],
  [
    { brandNo: 76, brandName: 'MANN-FILTER', articleNo: 'C 27 009', genericArticleNo: 14009, genericArticleName: 'Air Filter', oeNumbers: ['5Q0 129 620 B'], tradeNumbers: [] },
    { brandNo: 77, brandName: 'MAHLE', articleNo: 'LX 2774/1', genericArticleNo: 14009, genericArticleName: 'Air Filter', oeNumbers: ['5Q0 129 620 B'], tradeNumbers: [] },
    { brandNo: 5, brandName: 'Bosch', articleNo: 'F 026 400 497', genericArticleNo: 14009, genericArticleName: 'Air Filter', oeNumbers: ['5Q0 129 620 B'], tradeNumbers: [] },
  ]
);

// ── Spark plugs (VW/Audi TFSI) ──
addMockGroup(
  ['101905631H', 'ZR7SI332S', 'IK20TT', 'PLKR7A'],
  [
    { brandNo: 5, brandName: 'Bosch', articleNo: 'ZR7SI332S', genericArticleNo: 14012, genericArticleName: 'Spark Plug', oeNumbers: ['101 905 631 H'], tradeNumbers: [] },
    { brandNo: 98, brandName: 'DENSO', articleNo: 'IK20TT', genericArticleNo: 14012, genericArticleName: 'Spark Plug', oeNumbers: ['101 905 631 H'], tradeNumbers: ['IK20TT'] },
    { brandNo: 99, brandName: 'NGK', articleNo: 'PLKR7A', genericArticleNo: 14012, genericArticleName: 'Spark Plug', oeNumbers: ['101 905 631 H'], tradeNumbers: ['PLKR7A'] },
  ]
);

// ── Timing belt (VW 1.9 TDI) ──
addMockGroup(
  ['038198119A', 'CT1028K3', 'KTB788', 'K015603XS'],
  [
    { brandNo: 27, brandName: 'Continental', articleNo: 'CT1028K3', genericArticleNo: 15251, genericArticleName: 'Timing Belt Kit', oeNumbers: ['038 198 119 A'], tradeNumbers: [] },
    { brandNo: 30, brandName: 'Dayco', articleNo: 'KTB788', genericArticleNo: 15251, genericArticleName: 'Timing Belt Kit', oeNumbers: ['038 198 119 A'], tradeNumbers: [] },
    { brandNo: 31, brandName: 'Gates', articleNo: 'K015603XS', genericArticleNo: 15251, genericArticleName: 'Timing Belt Kit', oeNumbers: ['038 198 119 A'], tradeNumbers: ['K015603XS'] },
  ]
);

// ── Wiper blades (VW Golf 7) ──
addMockGroup(
  ['5G1998002', '3397014214', 'SWF119782'],
  [
    { brandNo: 5, brandName: 'Bosch', articleNo: '3 397 014 214', genericArticleNo: 15090, genericArticleName: 'Wiper Blade', oeNumbers: ['5G1 998 002'], tradeNumbers: ['A214S'] },
    { brandNo: 149, brandName: 'SWF', articleNo: 'SWF 119782', genericArticleNo: 15090, genericArticleName: 'Wiper Blade', oeNumbers: ['5G1 998 002'], tradeNumbers: [] },
  ]
);

// ── Cabin/pollen filter (VW Golf / Audi A3) ──
addMockGroup(
  ['5Q0819653', 'CUK26009', 'LAK867', 'E2990LC'],
  [
    { brandNo: 76, brandName: 'MANN-FILTER', articleNo: 'CUK 26 009', genericArticleNo: 14015, genericArticleName: 'Cabin Filter', oeNumbers: ['5Q0 819 653'], tradeNumbers: [] },
    { brandNo: 77, brandName: 'MAHLE', articleNo: 'LAK 867', genericArticleNo: 14015, genericArticleName: 'Cabin Filter', oeNumbers: ['5Q0 819 653'], tradeNumbers: [] },
    { brandNo: 114, brandName: 'HENGST', articleNo: 'E2990LC', genericArticleNo: 14015, genericArticleName: 'Cabin Filter', oeNumbers: ['5Q0 819 653'], tradeNumbers: ['E2990LC'] },
  ]
);

// ── Alternator (VW / Audi / Skoda) ──
addMockGroup(
  ['06J903023G', '0124525114', 'DRA0335', 'LRA03420'],
  [
    { brandNo: 5, brandName: 'Bosch', articleNo: '0 124 525 114', genericArticleNo: 15300, genericArticleName: 'Alternator', oeNumbers: ['06J 903 023 G'], tradeNumbers: [] },
    { brandNo: 135, brandName: 'DENSO', articleNo: 'DRA0335', genericArticleNo: 15300, genericArticleName: 'Alternator', oeNumbers: ['06J 903 023 G'], tradeNumbers: [] },
  ]
);

// ── Clutch kit (VW Golf 6 / 1.6 TDI) ──
addMockGroup(
  ['03L141016T', '623353400', '826860', '3000990505'],
  [
    { brandNo: 55, brandName: 'LuK', articleNo: '623 3534 00', genericArticleNo: 15400, genericArticleName: 'Clutch Kit', oeNumbers: ['03L 141 016 T'], tradeNumbers: [] },
    { brandNo: 130, brandName: 'Valeo', articleNo: '826860', genericArticleNo: 15400, genericArticleName: 'Clutch Kit', oeNumbers: ['03L 141 016 T'], tradeNumbers: [] },
    { brandNo: 140, brandName: 'Sachs', articleNo: '3000 990 505', genericArticleNo: 15400, genericArticleName: 'Clutch Kit', oeNumbers: ['03L 141 016 T'], tradeNumbers: [] },
  ]
);

// ── Water pump (VW 2.0 TDI) ──
addMockGroup(
  ['03L121011G', 'PA12530', 'WP0567', '506970'],
  [
    { brandNo: 76, brandName: 'GRAF', articleNo: 'PA12530', genericArticleNo: 15450, genericArticleName: 'Water Pump', oeNumbers: ['03L 121 011 G'], tradeNumbers: [] },
    { brandNo: 77, brandName: 'MAHLE', articleNo: 'WP 0567', genericArticleNo: 15450, genericArticleName: 'Water Pump', oeNumbers: ['03L 121 011 G'], tradeNumbers: [] },
    { brandNo: 114, brandName: 'INA', articleNo: '538 0697 10', genericArticleNo: 15450, genericArticleName: 'Water Pump', oeNumbers: ['03L 121 011 G'], tradeNumbers: [] },
  ]
);

// ─────────────────────────────────────────────
// Mock search implementation
// ─────────────────────────────────────────────

function mockSearch(partNumber: string): TecDocSearchResult {
  const key = normalize(partNumber);
  const entry = MOCK_DATA[key];

  if (!entry) {
    return { query: partNumber, articles: [], crossReferences: [], source: 'mock' };
  }

  // Build unique cross-reference list from all articles' numbers + OE numbers
  const allNumbers = new Set<string>();
  for (const article of entry.articles) {
    allNumbers.add(normalize(article.articleNo));
    for (const oe of article.oeNumbers) allNumbers.add(normalize(oe));
    for (const trade of article.tradeNumbers) allNumbers.add(normalize(trade));
  }
  // Remove the original query from cross-references
  allNumbers.delete(key);

  // Return readable (non-normalized) versions
  const crossRefs: string[] = [];
  for (const article of entry.articles) {
    if (normalize(article.articleNo) !== key) crossRefs.push(article.articleNo);
    for (const oe of article.oeNumbers) {
      if (normalize(oe) !== key && !crossRefs.includes(oe)) crossRefs.push(oe);
    }
    for (const trade of article.tradeNumbers) {
      if (normalize(trade) !== key && !crossRefs.includes(trade)) crossRefs.push(trade);
    }
  }

  return {
    query: partNumber,
    articles: entry.articles,
    crossReferences: [...new Set(crossRefs)],
    source: 'mock',
  };
}

// ─────────────────────────────────────────────
// Real TecAlliance API (stub — activate with credentials)
// ─────────────────────────────────────────────

async function apiSearch(partNumber: string): Promise<TecDocSearchResult> {
  const url = TECDOC_API_URL || 'https://webservice.tecalliance.net/pegasus-3-0/services/TecdocToCatDLB.jsonEndpoint';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': TECDOC_API_KEY! },
    body: JSON.stringify({
      getArticleDirectSearchAllNumbersWithState: {
        articleCountry: 'SI',
        lang: 'SL',
        articleNumber: partNumber,
        numberType: 0, // 0 = all number types
        searchExact: false,
        provider: Number(TECDOC_PROVIDER_ID),
      },
    }),
  });

  if (!response.ok) {
    console.log('[tecdoc] API error:', response.status, response.statusText);
    return { query: partNumber, articles: [], crossReferences: [], source: 'api' };
  }

  const data = await response.json();
  const rawArticles = data?.data?.array ?? [];

  const articles: TecDocArticle[] = rawArticles.map((a: any) => ({
    brandNo: a.brandNo ?? 0,
    brandName: a.brandName ?? '',
    articleNo: a.articleNo ?? '',
    genericArticleNo: a.genericArticles?.[0]?.genericArticleId ?? 0,
    genericArticleName: a.genericArticles?.[0]?.genericArticleDescription ?? '',
    oeNumbers: (a.oeNumbers ?? []).map((oe: any) => oe.articleNumber),
    tradeNumbers: (a.tradeNumbers ?? []).map((t: any) => t.tradeNumber),
  }));

  const crossRefs = new Set<string>();
  const normalizedQuery = normalize(partNumber);
  for (const article of articles) {
    if (normalize(article.articleNo) !== normalizedQuery) crossRefs.add(article.articleNo);
    for (const oe of article.oeNumbers) {
      if (normalize(oe) !== normalizedQuery) crossRefs.add(oe);
    }
  }

  return {
    query: partNumber,
    articles,
    crossReferences: [...crossRefs],
    source: 'api',
  };
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

export async function searchByNumber(partNumber: string): Promise<TecDocSearchResult> {
  // 1. Check cache first
  try {
    const cached = await getCachedTecDoc(partNumber);
    if (cached) {
      console.log('[tecdoc] Cache hit for:', partNumber);
      return { ...cached, source: 'cache' };
    }
  } catch {
    // Cache miss or error — continue
  }

  // 2. Use real API if credentials exist, otherwise mock
  let result: TecDocSearchResult;
  if (hasCredentials) {
    console.log('[tecdoc] API lookup for:', partNumber);
    result = await apiSearch(partNumber);
  } else {
    console.log('[tecdoc] Mock lookup for:', partNumber);
    result = mockSearch(partNumber);
  }

  // 3. Cache the result (non-blocking)
  if (result.articles.length > 0) {
    cacheTecDocResult(partNumber, result).catch(() => {});
  }

  return result;
}

export async function getCrossReferences(partNumber: string): Promise<string[]> {
  const result = await searchByNumber(partNumber);
  return result.crossReferences;
}
