import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Mic,
  ShoppingBag,
  BookOpen,
  DollarSign,
  BarChart3,
  Store,
  Menu,
  X,
  ArrowLeft,
  Globe,
  ChevronDown,
  Bot,
  Sparkles,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { useLanguage, Language } from '../../context/LanguageContext';
import { Shopkeeper24x7VoiceAssistant } from '../../components/shopkeeper/Shopkeeper24x7VoiceAssistant';

export const ShopkeeperDashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const shop = storage.getShopById('shop-1') || storage.getShops()[0];

  useEffect(() => {
    const update = () => {
      const orders = storage.getOrders(shop.id);
      const pending = orders.filter((o) => o.status === 'request_sent' || o.status === 'preparing');
      setPendingOrdersCount(pending.length);
    };
    update();
    const unsub = storage.subscribe(update);
    return () => unsub();
  }, [shop.id]);

  const navItems = [
    {
      path: '/shopkeeper',
      label: language === 'te' ? 'సారాంశం' : language === 'hi' ? 'ओवरव्यू' : 'Overview',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      path: '/shopkeeper/mana-ai',
      label: language === 'te' ? 'Mana-AI కోపైలట్' : language === 'hi' ? 'Mana-AI सलाहकार' : 'Mana-AI Copilot',
      icon: Bot,
      highlight: true,
      badgeText: 'AI',
    },
    {
      path: '/shopkeeper/ai-assistant',
      label: language === 'te' ? 'చెప్పి రాయించండి' : language === 'hi' ? 'बोलकर एंट्री करें' : 'Voice Entry',
      icon: Mic,
    },
    {
      path: '/shopkeeper/inventory',
      label: language === 'te' ? 'సరుకుల నిల్వ' : language === 'hi' ? 'स्टॉक व सामान' : 'Inventory',
      icon: Package,
    },
    {
      path: '/shopkeeper/orders',
      label: language === 'te' ? 'ఆర్డర్లు' : language === 'hi' ? 'ऑर्डर' : 'Orders',
      icon: ShoppingBag,
      badgeKey: 'orders',
    },
    {
      path: '/shopkeeper/khata',
      label: language === 'te' ? 'ఖాతా పుస్తకం' : language === 'hi' ? 'खाता बही' : 'Customer Khata',
      icon: BookOpen,
    },
    {
      path: '/shopkeeper/sales-expenses',
      label: language === 'te' ? 'అమ్మకాలు & ఖర్చులు' : language === 'hi' ? 'बिक्री और खर्च' : 'Sales & Expenses',
      icon: DollarSign,
    },
    {
      path: '/shopkeeper/reports',
      label: language === 'te' ? 'వ్యాపార రిపోర్టు' : language === 'hi' ? 'बिजनेस रिपोर्ट' : 'Reports',
      icon: BarChart3,
    },
    {
      path: '/shopkeeper/profile',
      label: language === 'te' ? 'దుకాణం వివరాలు' : language === 'hi' ? 'दुकान प्रोफाइल' : 'Shop Profile',
      icon: Store,
    },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        <div className="p-5 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base">
                {t('brandName')}
              </span>
              <span className="text-[10px] text-emerald-400 block font-semibold">
                {language === 'te' ? 'దుకాణదారుడి సెంటర్' : language === 'hi' ? 'दुकानदार सेंटर' : 'Merchant Center'}
              </span>
            </div>
          </Link>

          {/* Language dropdown in desktop sidebar */}
          <div className="mt-2.5">
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full appearance-none bg-slate-800 hover:bg-slate-700/80 text-white text-xs font-bold pl-8 pr-7 py-2 rounded-xl border border-slate-700 hover:border-emerald-500/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition shadow-sm"
                aria-label="Select Language"
              >
                <option value="en" className="bg-slate-900 text-white">English (EN)</option>
                <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
                <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div className="overflow-hidden">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">
                {language === 'te' ? 'మీ దుకాణం' : language === 'hi' ? 'आपकी दुकान' : 'Active Store'}
              </span>
              <div className="font-bold text-white text-xs truncate">{shop.name}</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
        </div>

        {/* Nav List */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : item.highlight
                    ? 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40 border border-emerald-800/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badgeText && (
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-black text-[9px] uppercase tracking-wider">
                    {item.badgeText}
                  </span>
                )}

                {item.badgeKey === 'orders' && pendingOrdersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Switch back to Customer View */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('customerView')}</span>
          </Link>
          <div className="text-[10px] text-slate-500 text-center">
            Operator: Akhil Kumar
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar for Mobile */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between md:hidden sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/shopkeeper" className="font-black text-slate-900 text-base">
              {t('brandName')}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/shopkeeper/orders"
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <ShoppingBag className="w-5 h-5" />
              {pendingOrdersCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingOrdersCount}
                </span>
              )}
            </Link>
            <Link
              to="/"
              className="text-[11px] font-bold bg-slate-900 text-white px-2.5 py-1.5 rounded-xl"
            >
              {t('customerView')}
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div
              className="w-64 bg-slate-900 h-full p-4 flex flex-col text-slate-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="font-bold text-white text-sm">{shop.name}</span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Language Switch in Mobile Sidebar */}
              <div className="mb-3">
                <div className="relative flex items-center">
                  <Globe className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 pointer-events-none" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="w-full appearance-none bg-slate-800 text-white text-xs font-bold pl-8 pr-7 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition shadow-sm"
                    aria-label="Select Mobile Language"
                  >
                    <option value="en" className="bg-slate-900 text-white">English (EN)</option>
                    <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
                    <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>

              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold ${
                      isActive(item.path, item.exact)
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8">
          {/* 24/7 AI Voice Dispatcher for the Shopkeeper */}
          <Shopkeeper24x7VoiceAssistant shopId={shop.id} />
          <Outlet />
        </main>

        {/* Mobile Bottom Thumb Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
          <Link
            to="/shopkeeper"
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
              location.pathname === '/shopkeeper' ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span>{language === 'te' ? 'సారాంశం' : language === 'hi' ? 'ओवरव्यू' : 'Overview'}</span>
          </Link>

          <Link
            to="/shopkeeper/mana-ai"
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
              location.pathname.startsWith('/shopkeeper/mana-ai')
                ? 'text-emerald-700'
                : 'text-slate-500'
            }`}
          >
            <Bot className="w-4 h-4 mb-0.5 text-emerald-600" />
            <span>Mana-AI</span>
          </Link>

          <Link
            to="/shopkeeper/inventory"
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
              location.pathname.startsWith('/shopkeeper/inventory')
                ? 'text-emerald-700'
                : 'text-slate-500'
            }`}
          >
            <Package className="w-4 h-4 mb-0.5" />
            <span>{language === 'te' ? 'సరుకులు' : language === 'hi' ? 'सामान' : 'Stock'}</span>
          </Link>

          <Link
            to="/shopkeeper/khata"
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
              location.pathname.startsWith('/shopkeeper/khata') ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span>{language === 'te' ? 'ఖాతా' : language === 'hi' ? 'खाता' : 'Khata'}</span>
          </Link>

          <Link
            to="/shopkeeper/orders"
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold relative ${
              location.pathname.startsWith('/shopkeeper/orders') ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            <ShoppingBag className="w-4 h-4 mb-0.5" />
            <span>{language === 'te' ? 'ఆర్డర్లు' : language === 'hi' ? 'ऑर्डर' : 'Orders'}</span>
            {pendingOrdersCount > 0 && (
              <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-emerald-600"></span>
            )}
          </Link>
        </nav>
      </div>
    </div>
  );
};
