import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'te' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Navigation
    brandName: 'SMARTVYAPAAR.AI',
    brandTagline: 'Local Neighborhood Stores',
    home: 'Home',
    findProducts: 'Find Products',
    nearbyShops: 'Nearby Shops',
    myOrders: 'My Orders',
    shopkeeperMode: 'Shopkeeper Mode',
    customerView: 'Customer View',
    changeLocation: 'Change Area',
    resetDemo: 'Reset Data',

    // Hero & Search
    heroTitle: 'Find what you need from your local shops —',
    heroTitleHighlight: 'just speak or type.',
    heroSubtitle: 'Know which nearby shop has your items in stock at the best price. Search in Telugu, Hindi or English.',
    searchPlaceholder: 'Try: 1 oil packet, 2 soaps and 1 bulb...',
    speakButton: 'Speak',
    findButton: 'Find',
    popularQueries: 'Popular searches:',
    sampleTelugu: 'Telugu: "Naaku oka oil packet, rendu tube lights, aidu soaps kavali"',
    sampleHindi: 'Hindi: "1 tel packet, 2 tube light aur 5 sabun chahiye"',
    sampleEnglish: '1 oil packet, 2 tube lights and 5 soaps',

    // How it works
    howItWorksTitle: 'Simple 3 Steps for Local Shopping',
    step1Title: '1. Tell what you need',
    step1Desc: 'Speak into the mic or type your list in your own language.',
    step2Title: '2. See nearby stores',
    step2Desc: 'Check which store has all items in stock and total price.',
    step3Title: '3. Order or pick up',
    step3Desc: 'Collect from the store or get home delivery.',

    // Store comparison & Search Results
    searchingStatus: 'Checking nearby stores...',
    yourItems: 'Your Requested Items:',
    itemsParsed: 'items in list',
    adjustQuantity: 'Adjust quantities if needed:',
    allInStock: 'Stores with ALL items in stock',
    partialInStock: 'Stores with partial stock',
    splitOrderTitle: 'Combined Order (Get everything from 2 shops)',
    splitOrderDesc: 'No single shop has everything? Combine these two nearby shops:',
    totalBasket: 'Total Cost:',
    available: 'Available in store:',
    unavailable: 'Out of stock here:',
    orderButton: 'Order from this Shop',
    viewShopButton: 'View Store',
    callButton: 'Call Shopkeeper',
    pickupOnly: 'Store Pickup only',
    deliveryAvailable: 'Delivery & Pickup available',
    filterAll: 'All Stores',
    filterDelivery: '🛵 Home Delivery',
    filterPickup: '🏪 Store Pickup',
    sortByRecommended: 'Best Match (Lowest Price & Distance)',
    sortByPrice: 'Lowest Total Price (₹)',
    sortByDistance: 'Nearest Distance (km)',

    // Checkout & Order
    reviewOrder: 'Review & Send Request',
    fulfillmentType: 'How do you want to receive it?',
    storePickup: 'Store Pickup',
    storePickupDesc: 'Ready in 10-15 mins • No extra fee',
    homeDelivery: 'Home Delivery',
    homeDeliveryDesc: 'Direct to your home • Pay on arrival',
    fullName: 'Your Name',
    phoneNumber: 'Mobile Number',
    deliveryAddress: 'Home Address',
    specialNotes: 'Instructions (Optional)',
    paymentNotice: 'Payment Notice: No online payment needed now. Pay directly by cash or UPI scanner upon receiving items.',
    submitOrderButton: 'Send Request to Shopkeeper',
    orderSentSuccess: 'Order Request Sent Successfully!',

    // Order Status
    orderTracking: 'Order Tracking',
    stepSent: 'Request Sent',
    stepAccepted: 'Store Accepted',
    stepPreparing: 'Packing Items',
    stepReady: 'Ready / Out for Delivery',
    stepCompleted: 'Delivered / Completed',
    advanceStatusSim: 'Simulate Shopkeeper Status Update',

    // Shopkeeper Dashboard
    dashboardTitle: 'Store Overview',
    todaySummary: "Today's Business Summary",
    todaySales: "Today's Sales",
    totalOrders: 'Orders Count',
    pendingOrders: 'Pending Orders',
    lowStock: 'Low Stock Alert',
    outstandingKhata: 'Customer Udhar (Khata)',
    quickActions: 'Quick Actions',
    actionAddProduct: 'Add Product',
    actionUpdateStock: 'Update Stock',
    actionViewOrders: 'View Orders',
    actionAddExpense: 'Add Expense',
    actionVoiceEntry: 'Voice / Quick Entry',
    incomingOrders: 'Incoming Customer Orders',
    acceptOrder: 'Accept Order',
    recentTransactions: 'Recent Transactions',

    // Voice & Quick Entry (formerly Shop AI Assistant)
    voiceEntryTitle: 'Voice & Quick Shop Entry',
    voiceEntrySubtitle: 'Speak or type what happened — stock arrival, credit sale, or expenses.',
    speakRestockPrompt: '10 soaps vachayi (Restock)',
    speakCreditSalePrompt: 'Ramesh ki 3 soaps 120 rupees (Khata Sale)',
    speakExpensePrompt: 'Current bill 450 rupees (Expense)',
    confirmRecord: 'Confirm & Save',
    recordSale: 'Record in Khata',
    editRecord: 'Edit Details',
    savedSuccess: 'Successfully saved in records!',

    // Khata
    khataTitle: 'Customer Khata (Credit Book)',
    khataSubtitle: 'Track customer balances, credit purchases, and cash repayments.',
    totalKhataDue: 'Total Customer Due:',
    addKhataPurchase: 'Add Udhar (Credit Purchase)',
    recordKhataPayment: 'Record Payment (Jama)',
    downloadStatementPDF: 'Download Statement (PDF)',
    searchCustomer: 'Search customer...',
    debitOwed: 'Credit Given (₹)',
    creditPaid: 'Payment Received (₹)',
    balanceRunning: 'Remaining Due (₹)',

    // Inventory
    inventoryTitle: 'Store Inventory & Stock',
    inventorySubtitle: 'Keep your shelf quantities and prices up to date.',
    productName: 'Product Name',
    category: 'Category',
    quantity: 'Quantity',
    price: 'Price',
    status: 'Status',
    actions: 'Actions',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    lowStockBadge: 'Low Stock',
    bulkRestock: 'Bulk Restock (+10)',
    methodManual: 'Manual Form',
    methodVoice: 'Voice / Easy Input',

    // Reports
    reportsTitle: 'Store Reports & Audit',
    reportsSubtitle: 'Clear view of sales, expenses, profits and credit.',
    downloadReportPDF: 'Download Business Report (PDF)',
    revenueProgression: 'Weekly Sales vs Expenses',
    netProfit: 'Net Operating Profit',

    // Help & Direct Contact
    helpTitle: 'Store Help & Queries',
    callOwner: 'Call Store Owner Directly',
    talkToHuman: 'Call Shopkeeper',
  },

  te: {
    // Brand & Navigation
    brandName: 'SMARTVYAPAAR.AI',
    brandTagline: 'దగ్గర్లోని కిరాణా దుకాణాలు',
    home: 'హోమ్',
    findProducts: 'సరుకులు వెతకండి',
    nearbyShops: 'దగ్గర్లోని షాపులు',
    myOrders: 'నా ఆర్డర్లు',
    shopkeeperMode: 'దుకాణదారుడి ఖాతా',
    customerView: 'కస్టమర్ పేజీ',
    changeLocation: 'ప్రాంతం మార్చండి',
    resetDemo: 'డేటా రీసెట్',

    // Hero & Search
    heroTitle: 'మీ దగ్గర్లోని దుకాణాల్లో సరుకులు —',
    heroTitleHighlight: 'చెప్పండి లేదా రాయండి.',
    heroSubtitle: 'ఏ షాపులో సరుకు ఉంది, ఎంత ధర ఉంది వెంటనే తెలుసుకోండి. తెలుగు, హిందీ లేదా ఇంగ్లీషులో సులభంగా వెతకండి.',
    searchPlaceholder: 'ఉదాహరణ: 1 నూనె ప్యాకెట్, 2 సబ్బులు, 1 బల్బు...',
    speakButton: 'చెప్పండి',
    findButton: 'వెతకండి',
    popularQueries: 'ఎక్కువగా వెతికేవి:',
    sampleTelugu: 'తెలుగు: "నాకు ఒక ఆయిల్ ప్యాకెట్, రెండు ట్యూబ్ లైట్లు, ఐదు సబ్బులు కావాలి"',
    sampleHindi: 'హిందీ: "1 tel packet, 2 tube light aur 5 sabun chahiye"',
    sampleEnglish: '1 oil packet, 2 tube lights and 5 soaps',

    // How it works
    howItWorksTitle: 'స్థానిక షాపింగ్ కేవలం 3 అడుగుల్లో',
    step1Title: '1. ఏం కావాలో చెప్పండి',
    step1Desc: 'మైక్ నొక్కి మాట్లాడండి లేదా లిస్ట్ టైప్ చేయండి.',
    step2Title: '2. దగ్గర్లోని షాపులు చూడండి',
    step2Desc: 'ఏ షాపులో మొత్తం సరుకులు ఉన్నాయో, మొత్తం ఖరీదు ఎంతవుతుందో చూడండి.',
    step3Title: '3. తీసుకోండి లేదా ఆర్డర్ చేయండి',
    step3Desc: 'షాపుకు వెళ్లి తీసుకోండి లేదా ఇంటికే డెలివరీ పొందండి.',

    // Store comparison & Search Results
    searchingStatus: 'దగ్గర్లోని దుకాణాలను పరిశీలిస్తున్నాము...',
    yourItems: 'మీరు అడిగిన సరుకులు:',
    itemsParsed: 'సరుకులు లిస్టులో ఉన్నాయి',
    adjustQuantity: 'పరిమాణం మార్చుకోండి (+ / -):',
    allInStock: 'మొత్తం సరుకులు ఉన్న దుకాణాలు',
    partialInStock: 'కొన్ని సరుకులు మాత్రమే ఉన్న దుకాణాలు',
    splitOrderTitle: 'రెండు షాపుల కలయిక ఆర్డర్',
    splitOrderDesc: 'ఒకే షాపులో అన్నీ లేకపోతే, ఈ రెండు షాపుల ద్వారా అన్నీ పొందవచ్చు:',
    totalBasket: 'మొత్తం ఖరీదు:',
    available: 'షాపులో ఉన్నవి:',
    unavailable: 'ఈ షాపులో లేనివి:',
    orderButton: 'ఈ షాపు నుండి ఆర్డర్ చేయండి',
    viewShopButton: 'దుకాణం వివరాలు',
    callButton: 'ఫోన్ చేయండి',
    pickupOnly: 'షాపుకి వచ్చి తీసుకోవాలి',
    deliveryAvailable: 'ఇంటికి డెలివరీ కలదు',
    filterAll: 'అన్ని దుకాణాలు',
    filterDelivery: '🛵 ఇంటికి డెలివరీ',
    filterPickup: '🏪 షాపులో పికప్',
    sortByRecommended: 'ఉత్తమ ఎంపిక (తక్కువ ధర & దూరం)',
    sortByPrice: 'తక్కువ మొత్తం ధర (₹)',
    sortByDistance: 'అతి దగ్గరి దూరం (కి.మీ)',

    // Checkout & Order
    reviewOrder: 'ఆర్డర్ సరిచూసి పంపండి',
    fulfillmentType: 'సరుకులు ఎలా కావాలి?',
    storePickup: 'షాపుకి వచ్చి తీసుకుంటాను',
    storePickupDesc: '10-15 నిమిషాల్లో సిద్ధం • ఎలాంటి అదనపు రుసుము లేదు',
    homeDelivery: 'ఇంటికి డెలివరీ కావాలి',
    homeDeliveryDesc: 'ఇంటికే తెచ్చిస్తారు • సరుకు వచ్చాక డబ్బులు ఇవ్వండి',
    fullName: 'మీ పూర్తి పేరు',
    phoneNumber: 'ఫోన్ నంబర్',
    deliveryAddress: 'ఇంటి చిరునామా',
    specialNotes: 'గమనిక / సూచనలు (ఐచ్ఛికం)',
    paymentNotice: 'ముఖ్య గమనిక: ఆన్‌లైన్ పేమెంట్ అవసరం లేదు. సరుకులు అందుకున్నాక నేరుగా నగదు లేదా UPI ద్వారా ఇవ్వవచ్చు.',
    submitOrderButton: 'షాపుకి ఆర్డర్ పంపండి',
    orderSentSuccess: 'ఆర్డర్ షాపుకి విజయవంతంగా చేరింది!',

    // Order Status
    orderTracking: 'ఆర్డర్ స్థితి',
    stepSent: 'ఆర్డర్ చేరింది',
    stepAccepted: 'షాపు అంగీకరించింది',
    stepPreparing: 'ప్యాకింగ్ జరుగుతోంది',
    stepReady: 'సిద్ధంగా ఉంది / బయలుదేరింది',
    stepCompleted: 'పూర్తయింది',
    advanceStatusSim: 'దుకాణదారుడు అప్‌డేట్ చేసినట్లు పరీక్షించండి',

    // Shopkeeper Dashboard
    dashboardTitle: 'దుకాణ వ్యాపార సారాంశం',
    todaySummary: 'ఈరోజు లెక్కలు',
    todaySales: 'నేటి అమ్మకాలు',
    totalOrders: 'మొత్తం ఆర్డర్లు',
    pendingOrders: 'కొత్త ఆర్డర్లు',
    lowStock: 'తక్కువగా ఉన్న సరుకులు',
    outstandingKhata: 'కస్టమర్ల మొత్తం బాకీ (ఖాతా)',
    quickActions: 'సులువైన పనులు',
    actionAddProduct: 'కొత్త సరుకు',
    actionUpdateStock: 'సరుకు మార్పు',
    actionViewOrders: 'ఆర్డర్లు చూడండి',
    actionAddExpense: 'ఖర్చు రాయండి',
    actionVoiceEntry: 'చెప్పి రాయించండి',
    incomingOrders: 'వచ్చిన కస్టమర్ ఆర్డర్లు',
    acceptOrder: 'ఆర్డర్ తీసుకోండి',
    recentTransactions: 'తాజా లావాదేవీలు',

    // Voice & Quick Entry
    voiceEntryTitle: 'మాటలతో సులభంగా రికార్డు చేయండి',
    voiceEntrySubtitle: 'ఫోన్ లో చెప్పండి — సరుకులు రావడం, అరువు అమ్మకం, ఖర్చులు ఆటోమేటిక్ గా సేవ్ అవుతాయి.',
    speakRestockPrompt: '10 సబ్బులు వచ్చాయి (సరుకు చేర్చడం)',
    speakCreditSalePrompt: 'రమేష్ కి 3 సబ్బులు 120 రూపాయలు (ఖాతా)',
    speakExpensePrompt: 'కరెంట్ బిల్లు 450 రూపాయలు (ఖర్చు)',
    confirmRecord: 'సరే - సేవ్ చేయి',
    recordSale: 'ఖాతాలో రాయండి',
    editRecord: 'మార్చండి',
    savedSuccess: 'విజయవంతంగా రికార్డు అయ్యింది!',

    // Khata
    khataTitle: 'కస్టమర్ ఖాతా పుస్తకం (ఉధార్ బహీ)',
    khataSubtitle: 'కస్టమర్ల బాకీలు, ఇచ్చిన అరువు, వచ్చిన డబ్బుల పూర్తి వివరాలు.',
    totalKhataDue: 'మొత్తం రావలసిన బాకీ:',
    addKhataPurchase: 'అరువు రాయండి (ఉధార్)',
    recordKhataPayment: 'డబ్బులు జమ చేయండి (పేమెంట్)',
    downloadStatementPDF: 'ఖాతా బిల్లు డౌన్‌లోడ్ (PDF)',
    searchCustomer: 'కస్టమర్ పేరు లేదా ఫోన్...',
    debitOwed: 'ఇచ్చిన అరువు (₹)',
    creditPaid: 'కట్టిన డబ్బు (₹)',
    balanceRunning: 'మిగిలిన బాకీ (₹)',

    // Inventory
    inventoryTitle: 'షాపు సరుకుల నిల్వ (ఇన్వెంటరీ)',
    inventorySubtitle: 'మీ సరుకులు, ధరలు మరియు నిల్వను సులభంగా నిర్వహించండి.',
    productName: 'సరుకు పేరు',
    category: 'రకం',
    quantity: 'పరిమాణం / నిల్వ',
    price: 'ధర',
    status: 'స్థితి',
    actions: 'చర్యలు',
    inStock: 'నిల్వ ఉంది',
    outOfStock: 'అయిపోయింది',
    lowStockBadge: 'తక్కువగా ఉంది',
    bulkRestock: 'ఒకేసారి సరుకు చేర్చండి (+10)',
    methodManual: 'ఫారమ్ నింపడం',
    methodVoice: 'చెప్పి రాయించడం',

    // Reports
    reportsTitle: 'వ్యాపార లాభనష్టాల రిపోర్టు',
    reportsSubtitle: 'రోజువారీ అమ్మకాలు, ఖర్చులు, లాభాలు మరియు ఖాతా నివేదిక.',
    downloadReportPDF: 'వ్యాపార రిపోర్టు డౌన్‌లోడ్ (PDF)',
    revenueProgression: 'వారంవారీ అమ్మకాలు మరియు ఖర్చులు',
    netProfit: 'నికర నిర్వహణ లాభం',

    // Help & Direct Contact
    helpTitle: 'సహాయం & దుకాణ సమాచారం',
    callOwner: 'దుకాణదారుడికి నేరుగా కాల్ చేయండి',
    talkToHuman: 'షాపు యజమానితో మాట్లాడండి',
  },

  hi: {
    // Brand & Navigation
    brandName: 'SMARTVYAPAAR.AI',
    brandTagline: 'पास की किराना दुकानें',
    home: 'होम',
    findProducts: 'सामान खोजें',
    nearbyShops: 'पास की दुकानें',
    myOrders: 'मेरे ऑर्डर',
    shopkeeperMode: 'दुकानदार खाता',
    customerView: 'ग्राहक व्यू',
    changeLocation: 'इलाका बदलें',
    resetDemo: 'डेटा रीसेट',

    // Hero & Search
    heroTitle: 'अपनी पास की दुकानों से सामान पाएं —',
    heroTitleHighlight: 'बस बोलें या लिखें।',
    heroSubtitle: 'जानें किस पास की दुकान में सामान उपलब्ध है और सही दाम क्या है। हिंदी, तेलुगु या अंग्रेजी में आसानी से खोजें।',
    searchPlaceholder: 'जैसे: 1 तेल पैकेट, 2 साबुन और 1 बल्ब...',
    speakButton: 'बोलें',
    findButton: 'खोजें',
    popularQueries: 'अक्सर खोजे जाने वाले:',
    sampleTelugu: 'तेलुगु: "Naaku oka oil packet, rendu tube lights, aidu soaps kavali"',
    sampleHindi: 'हिंदी: "1 तेल पैकेट, 2 ट्यूब लाइट और 5 साबुन चाहिए"',
    sampleEnglish: '1 oil packet, 2 tube lights and 5 soaps',

    // How it works
    howItWorksTitle: 'स्थानीय खरीदारी के 3 आसान कदम',
    step1Title: '1. बताएं क्या चाहिए',
    step1Desc: 'माइक दबाकर बोलें या अपनी भाषा में सामान की लिस्ट लिखें।',
    step2Title: '2. पास की दुकानें देखें',
    step2Desc: 'देखें किस दुकान में सभी सामान उपलब्ध हैं और कुल खर्च कितना है।',
    step3Title: '3. दुकान से लें या घर मंगवाएं',
    step3Desc: 'दुकान से खुद लें या होम डिलीवरी का विकल्प चुनें।',

    // Store comparison & Search Results
    searchingStatus: 'आस-पास की दुकानों में सामान खोज रहे हैं...',
    yourItems: 'आपकी सामान सूची:',
    itemsParsed: 'सामान लिस्ट में हैं',
    adjustQuantity: 'मात्रा बदलें (+ / -):',
    allInStock: 'दुकानें जहाँ पूरा सामान उपलब्ध है',
    partialInStock: 'दुकानें जहाँ कुछ सामान उपलब्ध है',
    splitOrderTitle: 'दो दुकानों का मिला-जुला ऑर्डर',
    splitOrderDesc: 'अगर एक दुकान में सब नहीं है, तो इन दो दुकानों से पूरा सामान मिल जाएगा:',
    totalBasket: 'कुल खर्च:',
    available: 'दुकान में उपलब्ध:',
    unavailable: 'यहाँ उपलब्ध नहीं:',
    orderButton: 'इस दुकान से ऑर्डर करें',
    viewShopButton: 'दुकान देखें',
    callButton: 'दुकानदार को कॉल करें',
    pickupOnly: 'दुकान से खुद लेना होगा',
    deliveryAvailable: 'होम डिलीवरी उपलब्ध है',
    filterAll: 'सभी दुकानें',
    filterDelivery: '🛵 होम डिलीवरी',
    filterPickup: '🏪 दुकान से पिकअप',
    sortByRecommended: 'सबसे बेहतर (कम दाम और पास की दुकान)',
    sortByPrice: 'सबसे कम कुल दाम (₹)',
    sortByDistance: 'सबसे नज़दीकी दूरी (किमी)',

    // Checkout & Order
    reviewOrder: 'ऑर्डर जांचें और भेजें',
    fulfillmentType: 'सामान कैसे चाहिए?',
    storePickup: 'दुकान से खुद लूंगा',
    storePickupDesc: '10-15 मिनट में तैयार • कोई अतिरिक्त शुल्क नहीं',
    homeDelivery: 'घर पर डिलीवरी चाहिए',
    homeDeliveryDesc: 'घर पर पहुंचेगा • सामान मिलने पर पैसे दें',
    fullName: 'आपका नाम',
    phoneNumber: 'मोबाइल नंबर',
    deliveryAddress: 'घर का पता',
    specialNotes: 'निर्देश (वैकल्पिक)',
    paymentNotice: 'ध्यान दें: अभी ऑनलाइन पेमेंट की कोई जरूरत नहीं है। सामान मिलने पर सीधे नकद या UPI स्कैनर से भुगतान करें।',
    submitOrderButton: 'दुकानदार को ऑर्डर भेजें',
    orderSentSuccess: 'ऑर्डर दुकानदार के पास सफलता से पहुँच गया!',

    // Order Status
    orderTracking: 'ऑर्डर की स्थिति',
    stepSent: 'ऑर्डर भेजा गया',
    stepAccepted: 'दुकानदार ने स्वीकार किया',
    stepPreparing: 'सामान पैक हो रहा है',
    stepReady: 'तैयार है / डिलीवरी के लिए निकला',
    stepCompleted: 'पूरा हो गया / डिलीवर',
    advanceStatusSim: 'दुकानदार का स्टेटस टेस्ट करें',

    // Shopkeeper Dashboard
    dashboardTitle: 'दुकान का बही-खाता',
    todaySummary: 'आज का कारोबार',
    todaySales: 'आज की बिक्री',
    totalOrders: 'कुल ऑर्डर',
    pendingOrders: 'नए ऑर्डर',
    lowStock: 'कम स्टॉक वाले सामान',
    outstandingKhata: 'ग्राहकों का कुल उधार (खाता)',
    quickActions: 'त्वरित कार्य',
    actionAddProduct: 'नया सामान',
    actionUpdateStock: 'स्टॉक अपडेट',
    actionViewOrders: 'ऑर्डर देखें',
    actionAddExpense: 'खर्चा लिखें',
    actionVoiceEntry: 'बोलकर दर्ज करें',
    incomingOrders: 'ग्राहकों के नए ऑर्डर',
    acceptOrder: 'ऑर्डर स्वीकारें',
    recentTransactions: 'ताज़ा लेन-देन',

    // Voice & Quick Entry
    voiceEntryTitle: 'बोलकर आसान एंट्री करें',
    voiceEntrySubtitle: 'दुकान में जो हुआ बोलकर बताएं — नया स्टॉक, उधारी बिक्री या रोज़ का खर्चा।',
    speakRestockPrompt: '10 साबुन आए (नया माल)',
    speakCreditSalePrompt: 'रमेश को 3 साबुन 120 रुपये (उधार खाता)',
    speakExpensePrompt: 'बिजली का बिल 450 रुपये (खर्चा)',
    confirmRecord: 'पुष्टि करें और सहेजें',
    recordSale: 'खाते में जोड़ें',
    editRecord: 'बदलें',
    savedSuccess: 'सफलतापूर्वक सहेजा गया!',

    // Khata
    khataTitle: 'डिजिटल ग्राहक खाता बही',
    khataSubtitle: 'उधार, जमा और हर ग्राहक का बकाया हिसाब आसानी से रखें।',
    totalKhataDue: 'कुल बकाया उधार:',
    addKhataPurchase: 'उधार जोड़ें',
    recordKhataPayment: 'रुपये जमा करें (पेमेंट)',
    downloadStatementPDF: 'खाता बिल डाउनलोड (PDF)',
    searchCustomer: 'ग्राहक का नाम या फोन खोजें...',
    debitOwed: 'दिया गया उधार (₹)',
    creditPaid: 'जमा की गई रकम (₹)',
    balanceRunning: 'बकाया रकम (₹)',

    // Inventory
    inventoryTitle: 'दुकान का स्टॉक और सामान',
    inventorySubtitle: 'दुकान में मौजूद सामान, मात्रा और सही दाम दर्ज रखें।',
    productName: 'सामान का नाम',
    category: 'श्रेणी',
    quantity: 'मात्रा / स्टॉक',
    price: 'दाम',
    status: 'स्थिति',
    actions: 'कार्रवाई',
    inStock: 'उपलब्ध है',
    outOfStock: 'खत्म हो गया',
    lowStockBadge: 'कम स्टॉक',
    bulkRestock: 'एक साथ स्टॉक जोड़ें (+10)',
    methodManual: 'फॉर्म भरें',
    methodVoice: 'बोलकर जोड़ें',

    // Reports
    reportsTitle: 'व्यापार और मुनाफे की रिपोर्ट',
    reportsSubtitle: 'दैनिक बिक्री, खर्च, शुद्ध मुनाफा और उधारी का पूरा हिसाब।',
    downloadReportPDF: 'व्यापार रिपोर्ट डाउनलोड (PDF)',
    revenueProgression: 'साप्ताहिक बिक्री और खर्च',
    netProfit: 'शुद्ध मुनाफा',

    // Help & Direct Contact
    helpTitle: 'दुकान सहायता एवं संपर्क',
    callOwner: 'दुकानदार से सीधे बात करें',
    talkToHuman: 'दुकानदार को कॉल करें',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mana_kirana_lang');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mana_kirana_lang', lang);
  };

  const t = (key: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    return translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

