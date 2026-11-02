import {
  ParsedProductRequest,
  ShopSearchResult,
  MatchedItem,
  SplitOrderOption,
  InventoryItem,
  Shop,
} from '../types';
import { storage } from './storageService';

// Telugu, Hindi and English number dictionaries
const NUMBER_WORDS: Record<string, number> = {
  // Telugu words & script
  oka: 1,
  okati: 1,
  rendu: 2,
  moodu: 3,
  mudu: 3,
  naalugu: 4,
  nalugu: 4,
  aidu: 5,
  aaru: 6,
  yedu: 7,
  edu: 7,
  enimidi: 8,
  tommidi: 9,
  padi: 10,
  padnaalugu: 14,
  iravai: 20,
  'ఒక': 1,
  'ఒకటి': 1,
  'రెండు': 2,
  'మూడు': 3,
  'నాలుగు': 4,
  'ఐదు': 5,
  'ఆరు': 6,
  'ఏడు': 7,
  'ఎనిమిది': 8,
  'తొమ్మిది': 9,
  'పది': 10,
  // Hindi words & script
  ek: 1,
  do: 2,
  teen: 3,
  char: 4,
  paanch: 5,
  chhe: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  'एक': 1,
  'दो': 2,
  'तीन': 3,
  'चार': 4,
  'पांच': 5,
  'पाँच': 5,
  'छह': 6,
  'सात': 7,
  'आठ': 8,
  'नौ': 9,
  'दस': 10,
  // English
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  fifteen: 15,
  twenty: 20,
};

// Known product aliases
interface ProductAlias {
  canonical: string;
  category: string;
  defaultUnit: string;
  patterns: RegExp[];
}

const PRODUCT_ALIASES: ProductAlias[] = [
  {
    canonical: 'Oil Packet',
    category: 'Groceries',
    defaultUnit: 'packet',
    patterns: [/oil\s*packet/i, /sunflower\s*oil/i, /oil/i, /nune/i, /cooking\s*oil/i, /tel/i, /నూనె/, /నూనె\s*ప్యాకెట్/, /तेल/],
  },
  {
    canonical: 'Tube Light',
    category: 'Electrical & Hardware',
    defaultUnit: 'piece',
    patterns: [/tube\s*light/i, /tubelight/i, /fluorescent/i, /t5/i, /ట్యూబ్\s*లైట్/, /ట్యూబ్\s*లైట్లు/, /ट्यूब\s*लाइट/],
  },
  {
    canonical: 'LED Bulb',
    category: 'Electrical & Hardware',
    defaultUnit: 'piece',
    patterns: [/led\s*bulb/i, /bulb/i, /light\s*bulb/i, /havells\s*bulb/i, /బల్బ్/, /లైట్/, /बल्ब/],
  },
  {
    canonical: 'Soap',
    category: 'Personal Care',
    defaultUnit: 'piece',
    patterns: [/soap/i, /soaps/i, /sabbu/i, /sabbulu/i, /lifebuoy/i, /lux/i, /dettol/i, /bath\s*soap/i, /సబ్బు/, /సబ్బులు/, /साबुन/],
  },
  {
    canonical: 'Rice Bag',
    category: 'Groceries',
    defaultUnit: 'bag',
    patterns: [/rice\s*bag/i, /rice/i, /biyyam/i, /sona\s*masoori/i, /బియ్యం/, /రైస్/, /चावल/],
  },
  {
    canonical: 'Milk Packet',
    category: 'Dairy & Bread',
    defaultUnit: 'packet',
    patterns: [/milk\s*packet/i, /milk/i, /paalu/i, /doodh/i, /heritage\s*milk/i, /amul/i, /పాలు/, /ప్యాకెట్ల\s*పాలు/, /दूध/],
  },
  {
    canonical: 'Bread',
    category: 'Dairy & Bread',
    defaultUnit: 'packet',
    patterns: [/bread/i, /modern\s*bread/i, /bun/i, /బ్రెడ్/, /ब्रेड/],
  },
  {
    canonical: 'Biscuits',
    category: 'Snacks & Beverages',
    defaultUnit: 'packet',
    patterns: [/biscuit/i, /biscuits/i, /marie\s*gold/i, /good\s*day/i, /cookies/i, /బిస్కెట్/, /బిస్కెట్లు/, /बिस्कुट/, /बिस्किट/],
  },
  {
    canonical: 'Tea Powder',
    category: 'Groceries',
    defaultUnit: 'packet',
    patterns: [/tea\s*powder/i, /tea/i, /chai/i, /red\s*label/i, /tata\s*tea/i, /టీ\s*పొడి/, /టీ/, /చాయ్/, /चाय\s*पत्ती/, /चाय/],
  },
  {
    canonical: 'Sugar',
    category: 'Groceries',
    defaultUnit: 'kg',
    patterns: [/sugar/i, /panchadara/i, /cheeni/i, /చక్కెర/, /పంచదార/, /चीनी/, /शक्कर/],
  },
  {
    canonical: 'Salt',
    category: 'Groceries',
    defaultUnit: 'packet',
    patterns: [/salt/i, /uppu/i, /namak/i, /tata\s*salt/i, /ఉప్పు/, /నమక్/, /नमक/],
  },
  {
    canonical: 'Detergent Powder',
    category: 'Cleaning & Household',
    defaultUnit: 'packet',
    patterns: [/detergent/i, /surf\s*excel/i, /surf/i, /washing\s*powder/i, /soap\s*powder/i, /సర్ఫ్/, /డిటర్జెంట్/, /सर्फ/],
  },
  {
    canonical: 'Toothpaste',
    category: 'Personal Care',
    defaultUnit: 'piece',
    patterns: [/toothpaste/i, /colgate/i, /paste/i, /close\s*up/i, /పేస్ట్/, /టూత్‌పేస్ట్/, /टूथपेस्ट/],
  },
  {
    canonical: 'Shampoo',
    category: 'Personal Care',
    defaultUnit: 'bottle',
    patterns: [/shampoo/i, /clinic\s*plus/i, /head\s*&\s*shoulders/i, /షాంపూ/, /शैम्पू/],
  },
  {
    canonical: 'Snacks',
    category: 'Snacks & Beverages',
    defaultUnit: 'packet',
    patterns: [/snacks/i, /chips/i, /bhujia/i, /mixture/i, /namkeen/i, /మిక్చర్/, /స్నాక్స్/, /नमकीन/],
  },
];

class AIService {
  /**
   * Parse customer natural language requests in English or Telugu/Hinglish
   * Examples:
   * "Naaku oka oil packet, rendu tube lights, aidu soaps kavali."
   * "1 oil packet, 2 tube lights and 5 soaps"
   * "I need 2 soaps and 1 bulb"
   */
  public parseCustomerRequest(input: string): ParsedProductRequest[] {
    if (!input || !input.trim()) return [];

    const cleaned = input
      .toLowerCase()
      .replace(/[.,!?;:]/g, ' ')
      .replace(/\b(naaku|kavali|kavale|ichandi|ivvandi|chupandi|chudali|need|want|find|give|me|and|mariyu|konchem|please)\b/gi, ' ')
      .trim();

    // Split by commas, 'and', 'plus', or multiple spaces
    const segments = cleaned
      .split(/\s*,\s*|\s+and\s+|\s*\+\s*|\s+mariyu\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const results: ParsedProductRequest[] = [];
    const matchedCanonical = new Set<string>();

    for (const segment of segments) {
      // Try to parse quantity and product name from the segment
      const parsed = this.parseSegment(segment);
      if (parsed && !matchedCanonical.has(parsed.canonicalName)) {
        matchedCanonical.add(parsed.canonicalName);
        results.push(parsed);
      }
    }

    // Fallback: If segments didn't match cleanly, check regex patterns across the entire raw input
    if (results.length === 0) {
      for (const alias of PRODUCT_ALIASES) {
        for (const pattern of alias.patterns) {
          const match = cleaned.match(pattern);
          if (match && !matchedCanonical.has(alias.canonical)) {
            // Find preceding words to detect quantity
            const prefix = cleaned.substring(0, match.index || 0).trim();
            const words = prefix.split(/\s+/);
            const lastWord = words[words.length - 1];
            const qty = this.extractQuantity(lastWord) || 1;

            matchedCanonical.add(alias.canonical);
            results.push({
              rawQuery: match[0],
              name: alias.canonical,
              canonicalName: alias.canonical,
              quantity: qty,
              unit: alias.defaultUnit,
            });
            break;
          }
        }
      }
    }

    return results;
  }

  private parseSegment(segment: string): ParsedProductRequest | null {
    const tokens = segment.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return null;

    let quantity = 1;
    let productTokens: string[] = [];

    // Check if first token or token followed by 'x' or 'kg' is a number
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const parsedQty = this.extractQuantity(token);
      if (parsedQty !== null) {
        quantity = parsedQty;
      } else if (['packet', 'packets', 'piece', 'pieces', 'kg', 'kgs', 'bottle', 'bottles', 'bag', 'bags', 'x', 'times'].includes(token)) {
        // unit token, ignore in name
        continue;
      } else {
        productTokens.push(token);
      }
    }

    const productPhrase = productTokens.join(' ');
    if (!productPhrase) return null;

    // Match against aliases
    for (const alias of PRODUCT_ALIASES) {
      for (const pattern of alias.patterns) {
        if (pattern.test(productPhrase)) {
          return {
            rawQuery: segment,
            name: alias.canonical,
            canonicalName: alias.canonical,
            quantity: Math.max(1, quantity),
            unit: alias.defaultUnit,
          };
        }
      }
    }

    // Generic fallback if unknown product
    return {
      rawQuery: segment,
      name: this.capitalizeWords(productPhrase),
      canonicalName: this.capitalizeWords(productPhrase),
      quantity: Math.max(1, quantity),
      unit: 'piece',
    };
  }

  private extractQuantity(word: string): number | null {
    if (!word) return null;
    const num = parseInt(word, 10);
    if (!isNaN(num) && num > 0) return num;

    const lower = word.toLowerCase();
    if (NUMBER_WORDS[lower] !== undefined) {
      return NUMBER_WORDS[lower];
    }
    return null;
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Search and Rank Participating Local Shops
   * Prioritizes:
   * 1. Complete basket availability (all requested items available)
   * 2. Lowest total basket price
   * 3. Distance
   * Fallback: Single shop partial matches + Smart Split Order
   */
  public searchAndRankShops(
    requestedProducts: ParsedProductRequest[],
    options?: { maxDistance?: number; locality?: string }
  ): {
    completeMatches: ShopSearchResult[];
    partialMatches: ShopSearchResult[];
    splitOrderOption: SplitOrderOption | null;
  } {
    const shops = storage.getShops();
    const inventory = storage.getInventory();

    if (requestedProducts.length === 0) {
      return { completeMatches: [], partialMatches: [], splitOrderOption: null };
    }

    const shopResults: ShopSearchResult[] = shops.map((shop) => {
      const shopItems = inventory.filter((item) => item.shopId === shop.id);
      const availableItems: MatchedItem[] = [];
      const missingItems: ParsedProductRequest[] = [];
      let totalBasketPrice = 0;

      for (const req of requestedProducts) {
        // Find matching product in shop's inventory
        const matchedInv = shopItems.find((inv) =>
          this.isProductMatching(inv, req.canonicalName)
        );

        if (matchedInv && matchedInv.quantity > 0) {
          const isSufficient = matchedInv.quantity >= req.quantity;
          const availableQty = Math.min(matchedInv.quantity, req.quantity);
          const itemTotal = matchedInv.price * req.quantity;

          availableItems.push({
            product: matchedInv,
            requestedQuantity: req.quantity,
            unitPrice: matchedInv.price,
            itemTotal,
            availableQuantity: matchedInv.quantity,
            isSufficient,
          });

          totalBasketPrice += itemTotal;
        } else {
          missingItems.push(req);
        }
      }

      const isCompleteMatch = missingItems.length === 0 && availableItems.length === requestedProducts.length;

      // Ranking score: lower is better
      // Complete match gets massive bonus (-10000)
      // Price weighted heavily + distance penalty
      let matchScore = 0;
      if (isCompleteMatch) {
        matchScore = totalBasketPrice + shop.distanceKm * 10;
      } else {
        matchScore = 10000 + missingItems.length * 500 + totalBasketPrice + shop.distanceKm * 15;
      }

      return {
        shop,
        availableItems,
        missingItems,
        isCompleteMatch,
        totalBasketPrice,
        distanceKm: shop.distanceKm,
        pickupAvailable: shop.isPickupAvailable,
        deliveryAvailable: shop.isDeliveryAvailable,
        matchScore,
      };
    });

    const completeMatches = shopResults
      .filter((r) => r.isCompleteMatch)
      .sort((a, b) => a.totalBasketPrice - b.totalBasketPrice || a.distanceKm - b.distanceKm);

    const partialMatches = shopResults
      .filter((r) => !r.isCompleteMatch && r.availableItems.length > 0)
      .sort((a, b) => b.availableItems.length - a.availableItems.length || a.totalBasketPrice - b.totalBasketPrice);

    // Compute intelligent Split Order option if requested items > 1
    let splitOrderOption: SplitOrderOption | null = null;
    if (requestedProducts.length > 1 && partialMatches.length >= 2) {
      splitOrderOption = this.calculateBestSplitOrder(requestedProducts, partialMatches);
    }

    return {
      completeMatches,
      partialMatches,
      splitOrderOption,
    };
  }

  private isProductMatching(inv: InventoryItem, canonicalTarget: string): boolean {
    const invName = inv.productName.toLowerCase();
    const target = canonicalTarget.toLowerCase();

    if (target.includes('oil') && (invName.includes('oil') || invName.includes('sunflower'))) return true;
    if (target.includes('tube light') && (invName.includes('tube light') || invName.includes('t5'))) return true;
    if (target.includes('bulb') && (invName.includes('bulb') || invName.includes('led'))) return true;
    if (target.includes('soap') && (invName.includes('soap') || invName.includes('lux') || invName.includes('lifebuoy') || invName.includes('dettol'))) return true;
    if (target.includes('rice') && invName.includes('rice')) return true;
    if (target.includes('milk') && (invName.includes('milk') || invName.includes('toned'))) return true;
    if (target.includes('bread') && invName.includes('bread')) return true;
    if (target.includes('biscuit') && (invName.includes('biscuit') || invName.includes('marie') || invName.includes('cookies'))) return true;
    if (target.includes('tea') && (invName.includes('tea') || invName.includes('red label'))) return true;
    if (target.includes('sugar') && invName.includes('sugar')) return true;
    if (target.includes('salt') && invName.includes('salt')) return true;
    if (target.includes('detergent') && (invName.includes('surf') || invName.includes('detergent'))) return true;
    if (target.includes('toothpaste') && (invName.includes('colgate') || invName.includes('toothpaste'))) return true;
    if (target.includes('shampoo') && invName.includes('shampoo')) return true;
    if (target.includes('snacks') && (invName.includes('bhujia') || invName.includes('snacks') || invName.includes('chips'))) return true;

    return invName.includes(target);
  }

  private calculateBestSplitOrder(
    requested: ParsedProductRequest[],
    partials: ShopSearchResult[]
  ): SplitOrderOption | null {
    let bestSplit: SplitOrderOption | null = null;
    let minCombinedCost = Infinity;

    for (let i = 0; i < partials.length; i++) {
      for (let j = i + 1; j < partials.length; j++) {
        const shopA = partials[i];
        const shopB = partials[j];

        // Collect unique covered items between shopA and shopB
        const coveredCanonicals = new Set<string>();
        shopA.availableItems.forEach((item) => coveredCanonicals.add(this.getCanonicalFromItem(item.product)));
        shopB.availableItems.forEach((item) => coveredCanonicals.add(this.getCanonicalFromItem(item.product)));

        // If they together cover all requested products
        if (coveredCanonicals.size >= requested.length) {
          // ShopA takes items it has at best price, shopB takes remainder
          const shopAItems: MatchedItem[] = [...shopA.availableItems];
          const shopACanonicals = new Set(shopAItems.map((it) => this.getCanonicalFromItem(it.product)));
          
          const shopBItems: MatchedItem[] = shopB.availableItems.filter(
            (it) => !shopACanonicals.has(this.getCanonicalFromItem(it.product))
          );

          const shopATotal = shopAItems.reduce((acc, it) => acc + it.itemTotal, 0);
          const shopBTotal = shopBItems.reduce((acc, it) => acc + it.itemTotal, 0);
          const combinedTotal = shopATotal + shopBTotal;

          if (combinedTotal < minCombinedCost) {
            minCombinedCost = combinedTotal;
            bestSplit = {
              shopA: shopA.shop,
              shopAItems,
              shopATotal,
              shopB: shopB.shop,
              shopBItems,
              shopBTotal,
              combinedTotal,
              missingItemsCount: 0,
            };
          }
        }
      }
    }

    return bestSplit;
  }

  private getCanonicalFromItem(inv: InventoryItem): string {
    const name = inv.productName.toLowerCase();
    for (const alias of PRODUCT_ALIASES) {
      for (const pat of alias.patterns) {
        if (pat.test(name)) return alias.canonical;
      }
    }
    return inv.productName;
  }

  /**
   * Shopkeeper AI Assistant Natural Language Parser
   * Understands Telugu and English inputs:
   * - "10 soaps vachayi" / "10 soaps, 5 oil packets, 3 tube lights"
   * - "10 Lux soaps at 20 rupees each"
   * - "Ramesh ki 3 soaps 120 rupees"
   * - "Current bill 450 rupees"
   * - Clarification questions when details are missing!
   */
  public parseShopkeeperInput(input: string, currentShopId: string = 'shop-1'): {
    reply: string;
    actionType: 'inventory_add' | 'credit_sale' | 'cash_sale' | 'expense' | 'clarification_needed' | 'general';
    structuredData?: any;
    clarificationPrompt?: string;
  } {
    const text = input.trim();
    const lower = text.toLowerCase();

    // 0. Stock / Inventory Voice Query Pattern
    const isStockQuery =
      (lower.includes('stock') || lower.includes('సరుకు') || lower.includes('నిల్వ') || lower.includes('స్టాక్') || lower.includes('सामान') || lower.includes('स्टॉक')) &&
      (lower.includes('how much') || lower.includes('status') || lower.includes('ఎంత') || lower.includes('ఎలా') || lower.includes('చూపించు') || lower.includes('చెప్పు') || lower.includes('कितना') || lower.includes('दिखाओ') || lower.includes('स्थिति') || lower.includes('report'));

    if (isStockQuery) {
      const inv = storage.getInventory(currentShopId);
      const lowStock = inv.filter((i) => i.quantity <= i.minStockLevel);
      const totalUnits = inv.reduce((sum, i) => sum + i.quantity, 0);
      const totalVal = inv.reduce((sum, i) => sum + i.quantity * i.price, 0);

      const reply =
        lower.includes('తెలుగు') || /[\u0C00-\u0C7F]/.test(text)
          ? `మీ దుకాణంలో మొత్తం **${inv.length} రకాల సరుకులు** (${totalUnits} యూనిట్లు) ఉన్నాయి. మొత్తం స్టాక్ విలువ **₹${totalVal.toLocaleString('en-IN')}**.\n${lowStock.length > 0 ? `⚠️ తక్కువగా ఉన్నవి: ${lowStock.map(l => `${l.productName} (${l.quantity} ${l.unit})`).join(', ')}` : '✅ అన్ని సరుకులు తగినంత నిల్వ ఉన్నాయి.'}`
          : /[\u0900-\u097F]/.test(text)
          ? `आपकी दुकान में कुल **${inv.length} उत्पाद** (${totalUnits} यूनिट्स) हैं। कुल स्टॉक मूल्य **₹${totalVal.toLocaleString('en-IN')}** है।\n${lowStock.length > 0 ? `⚠️ कम स्टॉक: ${lowStock.map(l => `${l.productName} (${l.quantity} ${l.unit})`).join(', ')}` : '✅ सभी सामान पर्याप्त मात्रा में उपलब्ध हैं।'}`
          : `Your store currently has **${inv.length} SKUs** (${totalUnits} total units) with a total stock valuation of **₹${totalVal.toLocaleString('en-IN')}**.\n${lowStock.length > 0 ? `⚠️ Low stock warnings: ${lowStock.map(l => `${l.productName} (${l.quantity} ${l.unit})`).join(', ')}` : '✅ All inventory items are healthily stocked.'}`;

      return {
        reply,
        actionType: 'general',
      };
    }

    // 0b. Customer Khata Balance Voice Query Pattern
    const isCustomerQuery =
      (lower.includes('balance') || lower.includes('బాకీ') || lower.includes('బ్యాలెన్స్') || lower.includes('బకాయి') || lower.includes('बाकी')) &&
      !lower.includes('bill');

    if (isCustomerQuery) {
      const customers = storage.getCustomers();
      const matchedCustomer = customers.find((c) => lower.includes(c.name.toLowerCase().split(' ')[0]));
      if (matchedCustomer) {
        const reply =
          lower.includes('తెలుగు') || /[\u0C00-\u0C7F]/.test(text)
            ? `**${matchedCustomer.name}** ప్రస్తుత బాకీ నిల్వ: **₹${matchedCustomer.khataBalance}** (చివరి సందర్శన: ${matchedCustomer.lastVisit}).`
            : /[\u0900-\u097F]/.test(text)
            ? `**${matchedCustomer.name}** का कुल बकाया: **₹${matchedCustomer.khataBalance}** (अंतिम विज़िट: ${matchedCustomer.lastVisit})।`
            : `**${matchedCustomer.name}**'s outstanding Khata balance is **₹${matchedCustomer.khataBalance}** (last visit: ${matchedCustomer.lastVisit}).`;
        return {
          reply,
          actionType: 'general',
        };
      }
    }

    // 1. Credit Sale Pattern: "Ramesh ki 3 soaps 120 rupees" / "Ramesh credit 2 oil 280"
    const creditSaleMatch = lower.match(
      /(?:credit|ki|khata|account|ledger)?\s*([a-zA-Z]+)\s*(?:ki|gariki|account|khata)?\s*(\d+|oka|rendu|moodu|aidu)?\s*([a-zA-Z\s]+?)\s*(\d+)\s*(?:rupees|rs|rs\.|inr)?\s*$/i
    );

    const hasCreditKeyword =
      lower.includes('ki') ||
      lower.includes('khata') ||
      lower.includes('credit') ||
      lower.includes('కి') ||
      lower.includes('కు') ||
      lower.includes('ఖాతా') ||
      lower.includes('ఉధార్') ||
      lower.includes('బాకీ') ||
      lower.includes('కో') ||
      lower.includes('खाता') ||
      lower.includes('उधार') ||
      lower.includes('उधारी') ||
      lower.includes('రమేష్') ||
      lower.includes('సురేష్') ||
      lower.includes('रमेश') ||
      lower.includes('सुरेश');

    if (
      hasCreditKeyword &&
      !lower.includes('bill') &&
      !lower.includes('బిల్లు') &&
      !lower.includes('बिल') &&
      !lower.includes('vachayi') &&
      !lower.includes('వచ్చాయి') &&
      !lower.includes('आए') &&
      !lower.includes('restock')
    ) {
      // Check customer name
      const customers = storage.getCustomers();
      const matchedCustomer = customers.find((c) => lower.includes(c.name.toLowerCase().split(' ')[0]));
      const custName = matchedCustomer ? matchedCustomer.name : this.extractCustomerName(lower);

      // Check amount
      const amountMatch = lower.match(/(\d+)\s*(?:rupees|rs|rs\.|\/-|inr|రూపాయలు|రూ|రాయలు|रुपये|रु|रुपए)/i) || lower.match(/\b(\d{2,5})\b/);
      const amount = amountMatch ? parseInt(amountMatch[1], 10) : null;

      // Check product
      const parsedProds = this.parseCustomerRequest(lower);
      const prod = parsedProds.length > 0 ? parsedProds[0] : null;

      if (!custName && !amount) {
        return {
          reply: 'ఖాతా వివరాలు నమోదు చేయాలా? కస్టమర్ పేరు మరియు రూపాయలు చెప్పండి (ఉదా: "రమేష్ కి 3 సబ్బులు 120 రూపాయలు").',
          actionType: 'clarification_needed',
          clarificationPrompt: 'Please specify customer name, product and total rupees (e.g., "Ramesh ki 3 soaps 120 rupees").',
        };
      }

      if (custName && !amount) {
        return {
          reply: `${custName} ఖాతాకు ఎంత మొత్తం (రూపాయలు) రాయాలి?`,
          actionType: 'clarification_needed',
          clarificationPrompt: `What is the total rupees for ${custName}? (e.g., "120 rupees")`,
        };
      }

      const finalCustName = custName || 'Ramesh Kumar';
      const finalAmount = amount || 120;
      const finalItem = prod ? `${prod.canonicalName} × ${prod.quantity}` : 'General Provisions';

      const customerObj = customers.find((c) => c.name.toLowerCase().includes(finalCustName.toLowerCase())) || customers[0];
      const prevBal = customerObj ? customerObj.khataBalance : 0;
      const newBal = prevBal + finalAmount;

      return {
        reply: `అర్థమైంది: ${finalCustName} ఖాతాలో ₹${finalAmount} ఉధార్ రాస్తున్నాను.`,
        actionType: 'credit_sale',
        structuredData: {
          type: 'credit_sale',
          title: 'Confirm Khata Transaction',
          fields: [
            { label: 'Customer', value: finalCustName },
            { label: 'Items', value: finalItem },
            { label: 'Total Amount', value: `₹${finalAmount}` },
            { label: 'Previous Balance', value: `₹${prevBal}` },
            { label: 'New Outstanding Balance', value: `₹${newBal}` },
          ],
          payload: {
            shopId: currentShopId,
            customerId: customerObj ? customerObj.id : 'cust-1',
            customerName: finalCustName,
            itemDescription: finalItem,
            debit: finalAmount,
            credit: 0,
            previousBalance: prevBal,
            remainingBalance: newBal,
            date: 'Today',
            notes: 'Recorded via Voice / AI Assistant',
          },
          status: 'pending',
        },
      };
    }

    // 2. Expense Pattern: "Current bill 450 rupees", "Shop rent 5000", "Auto charges 150"
    if (
      lower.includes('bill') ||
      lower.includes('బిల్లు') ||
      lower.includes('కరెంట్') ||
      lower.includes('rent') ||
      lower.includes('అద్దె') ||
      lower.includes('auto') ||
      lower.includes('fuel') ||
      lower.includes('tea') ||
      lower.includes('wages') ||
      lower.includes('repair') ||
      lower.includes('kharchu') ||
      lower.includes('ఖర్చు') ||
      lower.includes('ఖర్చులు') ||
      lower.includes('बिजली') ||
      lower.includes('बिल') ||
      lower.includes('किराया') ||
      lower.includes('खर्च') ||
      lower.includes('खर्चा') ||
      lower.includes('expense')
    ) {
      const amountMatch = lower.match(/(\d+)\s*(?:rupees|rs|rs\.|\/-|inr|రూపాయలు|రూ|రాయలు|रुपये|रु|रुपए)/i) || lower.match(/\b(\d{2,5})\b/);
      const amount = amountMatch ? parseInt(amountMatch[1], 10) : null;

      if (!amount) {
        return {
          reply: 'ఖర్చు నమోదు చేయాలా? ఎంత రూపాయలు చెల్లించారో చెప్పండి (ఉదా: "కరెంట్ బిల్లు 450 రూపాయలు").',
          actionType: 'clarification_needed',
          clarificationPrompt: 'Please specify the rupees paid (e.g., "Electricity bill 450 rupees").',
        };
      }

      let category: any = 'Miscellaneous';
      let note = text;
      if (lower.includes('electric') || lower.includes('current') || lower.includes('power') || lower.includes('కరెంట్') || lower.includes('बिजली')) {
        category = 'Electricity & Utilities';
        note = 'Electricity / Current power bill';
      } else if (lower.includes('rent') || lower.includes('అద్దె') || lower.includes('किराया')) {
        category = 'Shop Rent';
        note = 'Shop monthly rent';
      } else if (lower.includes('tea') || lower.includes('snacks') || lower.includes('tiffin') || lower.includes('టీ') || lower.includes('చాయ్') || lower.includes('चाय')) {
        category = 'Tea & Refreshments';
        note = 'Tea and snacks for helpers';
      } else if (lower.includes('auto') || lower.includes('transport') || lower.includes('petrol') || lower.includes('fuel') || lower.includes('ఆటో') || lower.includes('भाड़ा')) {
        category = 'Transport & Fuel';
        note = 'Goods transport / auto fare';
      } else if (lower.includes('wages') || lower.includes('salary') || lower.includes('helper') || lower.includes('జీతం') || lower.includes('కూలీ')) {
        category = 'Helper Wages';
        note = 'Store assistant wages';
      }

      return {
        reply: `అర్థమైంది: ₹${amount} ఖర్చు (${category}) నమోదు చేస్తున్నాను.`,
        actionType: 'expense',
        structuredData: {
          type: 'expense',
          title: 'Confirm Business Expense',
          fields: [
            { label: 'Category', value: category },
            { label: 'Amount', value: `₹${amount}` },
            { label: 'Notes', value: note },
            { label: 'Date', value: 'Today' },
          ],
          payload: {
            shopId: currentShopId,
            date: 'Today',
            category,
            amount,
            notes: note,
          },
          status: 'pending',
        },
      };
    }

    // 3. Inventory Restock Pattern:
    // "10 soaps vachayi", "10 soaps, 5 oil packets, 3 tube lights", "Restocked 20 milk packets"
    const parsedItems = this.parseCustomerRequest(text);
    if (parsedItems.length > 0) {
      const isRestock =
        lower.includes('vachayi') ||
        lower.includes('vachai') ||
        lower.includes('వచ్చాయి') ||
        lower.includes('వచ్చింది') ||
        lower.includes('వచ్చినవి') ||
        lower.includes('ఆయా') ||
        lower.includes('आए') ||
        lower.includes('आया') ||
        lower.includes('खरीदा') ||
        lower.includes('restock') ||
        lower.includes('added') ||
        lower.includes('vachindi') ||
        lower.includes('incoming') ||
        lower.includes('stock') ||
        !lower.includes('sold');

      // Check if price is specified, e.g. "10 Lux soaps at 20 rupees each"
      const priceMatch = lower.match(/(?:at|for|rate|price|each)?\s*(\d+)\s*(?:rupees|rs|rs\.|\/-|each|రూపాయలు|रुपये)/i);
      const unitPrice = priceMatch ? parseInt(priceMatch[1], 10) : undefined;

      return {
        reply: isRestock
          ? `దుకాణంలోకి కొత్త సరుకులు వచ్చాయి అని అర్థమైంది:`
          : `సరుకుల నిల్వ మార్పు అర్థమైంది:`,
        actionType: 'inventory_add',
        structuredData: {
          type: 'inventory_add',
          title: 'Confirm Inventory Restock',
          fields: parsedItems.map((p) => ({
            label: p.canonicalName,
            value: `+${p.quantity} ${p.unit} ${unitPrice ? `(@ ₹${unitPrice})` : ''}`,
          })),
          payload: {
            shopId: currentShopId,
            items: parsedItems.map((p) => ({
              productName: p.canonicalName,
              quantity: p.quantity,
              unit: p.unit,
              price: unitPrice || 25,
            })),
          },
          status: 'pending',
        },
      };
    }

    // General fallback
    return {
      reply: `మీ మాట అర్థం కాలేదు. ఇలా చెప్పండి: "10 సబ్బులు వచ్చాయి", "రమేష్ కి 3 సబ్బులు 120 రూపాయలు", లేదా "కరెంట్ బిల్లు 450 రూపాయలు".`,
      actionType: 'general',
    };
  }

  private extractCustomerName(text: string): string | null {
    if (text.includes('రమేష్') || text.includes('రమేశ్') || text.includes('रमेश')) return 'Ramesh Kumar';
    if (text.includes('సురేష్') || text.includes('సురేశ్') || text.includes('सुरेश')) return 'Suresh Reddy';
    if (text.includes('ప్రియ') || text.includes('प्रिया')) return 'Priya Sharma';
    if (text.includes('వెంకట్') || text.includes('वेंकट')) return 'Venkat Rao';
    if (text.includes('లక్ష్మి') || text.includes('लक्ष्मी')) return 'Lakshmi Devi';
    if (text.includes('రాజేష్') || text.includes('राजेश')) return 'Rajesh Verma';

    const words = text.split(/\s+/);
    for (const w of words) {
      const clean = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (['ramesh', 'suresh', 'priya', 'venkat', 'lakshmi', 'rajesh', 'kumar', 'reddy', 'sharma', 'rao'].includes(clean)) {
        return this.capitalizeWords(clean);
      }
    }
    return null;
  }

  /**
   * 24/7 AI Receptionist Query Handler
   */
  public answerCustomerQuestion(question: string): {
    answer: string;
    suggestedActions?: { label: string; action: string; data?: any }[];
    highlightShop?: Shop;
  } {
    const q = question.toLowerCase();
    const shops = storage.getShops();
    const inventory = storage.getInventory();

    // 1. Where can I find an oil packet? / products query
    if (q.includes('oil') || q.includes('soap') || q.includes('tube light') || q.includes('bulb') || q.includes('find') || q.includes('where')) {
      const parsed = this.parseCustomerRequest(question);
      if (parsed.length > 0) {
        const results = this.searchAndRankShops(parsed);
        if (results.completeMatches.length > 0) {
          const top = results.completeMatches[0];
          return {
            answer: `Yes! You can find ${parsed.map((p) => p.canonicalName).join(', ')} at **${top.shop.name}** (${top.distanceKm} km away in ${top.shop.locality}) for an estimated basket total of **₹${top.totalBasketPrice}**. Pickup & Delivery are both available.`,
            suggestedActions: [
              { label: `View ${top.shop.name}`, action: 'view_shop', data: top.shop.id },
              { label: 'Compare All Shops', action: 'search', data: question },
            ],
            highlightShop: top.shop,
          };
        }
      }
    }

    // 2. Which shop has the cheapest soap / price comparison?
    if (q.includes('cheapest') || q.includes('lowest price') || q.includes('best price')) {
      const parsed = this.parseCustomerRequest(question);
      const targetName = parsed.length > 0 ? parsed[0].canonicalName : 'Soap';
      
      const relevantInv = inventory
        .filter((i) => this.isProductMatching(i, targetName) && i.quantity > 0)
        .sort((a, b) => a.price - b.price);

      if (relevantInv.length > 0) {
        const cheapest = relevantInv[0];
        const shop = shops.find((s) => s.id === cheapest.shopId);
        return {
          answer: `**${shop?.name || 'Local Store'}** currently offers the lowest price for **${cheapest.productName}** at just **₹${cheapest.price}** per ${cheapest.unit} (${shop?.distanceKm} km away).`,
          suggestedActions: [
            { label: `Order from ${shop?.name}`, action: 'view_shop', data: shop?.id },
            { label: 'View All Available Shops', action: 'compare_all' },
          ],
          highlightShop: shop,
        };
      }
    }

    // 3. Does [Shop Name] have [Product]?
    for (const shop of shops) {
      if (q.includes(shop.name.toLowerCase().split(' ')[0])) {
        const shopItems = inventory.filter((i) => i.shopId === shop.id && i.quantity > 0);
        const hasTubeLight = shopItems.some((i) => i.productName.toLowerCase().includes('tube'));
        const hasOil = shopItems.some((i) => i.productName.toLowerCase().includes('oil'));

        if (q.includes('tube')) {
          if (hasTubeLight) {
            return {
              answer: `Yes, **${shop.name}** has Philips Tube Lights in stock for **₹115**! Would you like to reserve for pickup or request delivery?`,
              suggestedActions: [{ label: `View ${shop.name}`, action: 'view_shop', data: shop.id }],
              highlightShop: shop,
            };
          } else {
            return {
              answer: `Currently, **${shop.name}** does not have Tube Lights in stock. However, **Sri Lakshmi General Store** (0.8 km) and **Venkateswara Stores** (1.5 km) have them available right now.`,
              suggestedActions: [{ label: 'Find Nearby Tube Lights', action: 'search', data: '1 tube light' }],
            };
          }
        }
      }
    }

    // 4. Order status query: "What's my order status?" / "Order status"
    if (q.includes('order status') || q.includes('my order') || q.includes('track')) {
      const orders = storage.getOrders();
      if (orders.length > 0) {
        const latest = orders[0];
        const readableStatus = latest.status.replace('_', ' ').toUpperCase();
        return {
          answer: `Your most recent order **#${latest.orderNumber}** at **${latest.shopName}** is currently **${readableStatus}**. Status update: ${latest.estimatedTime}.`,
          suggestedActions: [
            { label: `Track Order #${latest.orderNumber}`, action: 'track_order', data: latest.orderNumber },
            { label: 'Contact Shopkeeper', action: 'talk_shopkeeper' },
          ],
        };
      }
    }

    // 5. Default helpful receptionist response
    return {
      answer: `Hello! I am your 24/7 AI Local Shopping Receptionist. You can ask me what items are in stock, compare prices between nearby shops, or check on your recent orders. For personalized store assistance, you can also connect directly with the shopkeeper.`,
      suggestedActions: [
        { label: 'Find 1 oil, 2 tube lights, 5 soaps', action: 'search', data: '1 oil packet, 2 tube lights and 5 soaps' },
        { label: 'Cheapest soap nearby', action: 'search', data: 'cheapest soap' },
        { label: 'Talk to Shopkeeper', action: 'talk_shopkeeper' },
      ],
    };
  }
}

export const aiService = new AIService();

