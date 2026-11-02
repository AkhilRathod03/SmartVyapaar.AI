# SMARTVYAPAAR.AI (స్మార్ట్ వ్యాపార్ / स्मार्ट व्यापार) — Autonomous Local Commerce & Digital Khata Intelligence

> **"Find what you need from your local shops — just speak or ask."**  
> *"మీ దగ్గర్లోని దుకాణాలలో మీకు కావాల్సిన సరుకులు వెతకండి — అడగండి చాలు."*  
> *"अपनी पास की दुकान से जो चाहिए खोजें — बस बोलिए या पूछिए।"*

**SMARTVYAPAAR.AI** connects neighborhood kirana and general stores with nearby customers. Small retailers can digitize their inventory, track customer Khata (udhar/jama), and log daily expenses using natural voice or text in **Telugu, Hindi, or English** without complicated software. Shopkeepers can also consult **Mana-AI** for automated PDF stock audits, customer statements, and revenue breakdown.

Developed by **Akhil Kumar** ([@AkhilRathod03](https://github.com/AkhilRathod03)).

---

## 🌟 Key Highlights & Real-World Features

1. **🎙️ Real Working Voice Recognition & Audio Feedback**
   - Direct Web Speech API integration in both **Customer Search** and **Shopkeeper Assistant**.
   - Speak naturally in **Telugu (`te-IN`)**, **Hindi (`hi-IN`)**, or **Indian English (`en-IN`)**.
   - Real-time listening indicator, live speech wave, and live transcript visualizer.
   - Text-to-Speech (TTS) voice synthesis lets shopkeepers listen to structured confirmations aloud.

2. **🌐 Trilingual Localization (English, Telugu, Hindi)**
   - Complete toggle at the top bar and sidebar: English | తెలుగు | हिंदी.
   - Preserves state seamlessly across sessions via `localStorage`.

3. **🛒 AI-Powered Multi-Product Basket Discovery**
   - Natural language input:
     - *"Naaku oka oil packet, rendu tube lights, aidu soaps kavali."*
     - *"1 तेल पैकेट, 2 ट्यूब लाइट और 5 साबुन चाहिए"*
     - *"I need 1 oil packet, 2 tube lights and 5 soaps"*
   - Ranks stores by **Total Basket Cost** (not simply isolated cheapest items).
   - **Smart Split-Order Fallback (Option B):** If no single store has everything, the system calculates an optimal combination between two nearby shops.

4. **🏪 Simple Shopkeeper Assistant ("Tell me what happened in your shop")**
   - *"10 సబ్బులు వచ్చాయి"* / *"10 साबुन आए"* → Confirms inventory restock.
   - *"రమేష్ కి 3 సబ్బులు 120 రూపాయలు"* / *"रमेश को 3 साबुन 120 रुपये"* → Records Khata credit sale.
   - *"కరెంట్ బిల్లు 450 రూపాయలు"* / *"बिजली का बिल 450 रुपये"* → Logs utility expense.
   - Asks intelligent clarifying questions when essential details are missing.

5. **📒 Digital Khata Ledger & Browser PDF Statement Generator**
   - Instant customer credit accounts with Udhar (Debit) and Jama (Credit) tracking.
   - Generates and downloads professional PDF statements using client-side vector rendering (`jsPDF`).

6. **📊 Daily Sales, Expenses & Business Performance Reports**
   - Interactive financial charts using `recharts`.
   - Downloadable business audit PDF reports with revenue, operating expenses, profit margins, and outstanding Khata totals.

7. **📱 100% Mobile Responsive**
   - Tested across screen widths from 320px compact smartphones to 4K displays.
   - Mobile bottom thumb navigation for shopkeepers on smartphones.
   - Tables automatically adapt to accessible, touch-friendly cards on small screens.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS (Accessible Indian Kirana theme: Slate, Emerald Green, Indigo Accent)
- **Routing:** React Router v6
- **Voice Recognition:** Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- **Speech Synthesis:** Browser `window.speechSynthesis` API
- **Charts:** Recharts
- **Document Generation:** jsPDF + html2canvas
- **Icons:** Lucide React
- **Persistence:** Reactive `localStorage` storage service with instant cross-tab synchronization

```
src/
├── components/
│   └── common/
│       ├── Navbar.tsx             # Multilingual switcher, location indicator, mobile drawer
│       ├── Footer.tsx             # Grounded footer with Akhil Kumar attribution
│       ├── LocationModal.tsx      # Neighborhood locality picker
│       ├── VoiceInputModal.tsx    # Customer voice search modal with audio feedback
│       └── AIReceptionistWidget.tsx # 24/7 Store Help & Customer Desk with dialer
├── pages/
│   ├── customer/
│   │   ├── LandingPage.tsx        # Hero with voice search, 3-step guide, and featured stores
│   │   ├── AISearchPage.tsx       # Multi-product basket discovery, +/- adjusters, shop comparison
│   │   ├── ShopsDirectoryPage.tsx # Directory of local stores
│   │   ├── ShopDetailPage.tsx     # Authentic local store view and live shelf catalog
│   │   ├── OrderCheckoutPage.tsx  # Pickup vs. Delivery request submission
│   │   ├── OrderStatusPage.tsx    # Live progression steps (#LS-1024)
│   │   └── CustomerOrdersListPage.tsx # Customer order history
│   └── shopkeeper/
│       ├── ShopkeeperDashboardLayout.tsx # Responsive sidebar & mobile bottom bar
│       ├── ShopOverview.tsx       # Daily metrics (Sales, Orders, Low Stock, Khata)
│       ├── ShopAIAssistant.tsx    # Real voice assistant for stock, sales, expenses
│       ├── InventoryManagement.tsx # Inventory table + mobile cards, Voice & Manual Add
│       ├── OrdersManagement.tsx   # Live order acceptance & fulfillment
│       ├── KhataManagement.tsx    # Customer credit ledgers & PDF statement export
│       ├── SalesExpensesPage.tsx  # Cash/UPI sales ledger & expense logger
│       ├── ReportsPage.tsx        # Charts & downloadable PDF business audits
│       └── ShopProfilePage.tsx    # Store settings & operational hours
├── services/
│   ├── aiService.ts               # Telugu, Hindi & English NLP, basket ranker, split-order engine
│   ├── storageService.ts          # Reactive localStorage with demo data
│   └── pdfService.ts              # PDF statements & business reports
├── context/
│   └── LanguageContext.tsx        # Multilingual context (English, Telugu, Hindi)
├── data/
│   └── mockData.ts                # Real-world seed data for stores, products & accounts
└── types/
    └── index.ts                   # TypeScript interfaces and domain types
```

---

## 🏃‍♂️ Running Locally

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd "AI STORE"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://127.0.0.1:3000` in Google Chrome or Microsoft Edge.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🚢 Deploying to Production

### Option 1: Deploy to Vercel (Recommended)
This repository includes a pre-configured `vercel.json` with SPA routing:
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Leave build settings as default (`npm run build`, output directory `dist`).
5. Click **Deploy**.

### Option 2: Deploy to Netlify
This repository includes `public/_redirects`:
1. Push your repository to GitHub.
2. Sign in to [Netlify](https://netlify.com) and click **"Add new site"** > **"Import an existing project"**.
3. Select your repository, set build command to `npm run build` and publish directory to `dist`.
4. Click **Deploy Site**.

---

© 2026 SMARTVYAPAAR.AI. Designed & Developed by **Akhil Kumar** ([@AkhilRathod03](https://github.com/AkhilRathod03)).
