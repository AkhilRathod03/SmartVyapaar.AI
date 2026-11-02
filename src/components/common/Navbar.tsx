import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Store,
  MapPin,
  ShoppingBag,
  LayoutDashboard,
  Menu,
  X,
  RotateCcw,
  PackageCheck,
  ChevronDown,
  Globe,
  Mic,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { LocationModal } from './LocationModal';
import { useLanguage, Language } from '../../context/LanguageContext';

export const Navbar: React.FC = () => {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [locationState, setLocationState] = useState(storage.getLocation());

  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isShopkeeperRoute = location.pathname.startsWith('/shopkeeper');

  useEffect(() => {
    const updateStats = () => {
      const orders = storage.getOrders();
      const active = orders.filter((o) => o.status !== 'completed' && o.status !== 'rejected');
      setOrdersCount(active.length);
      setLocationState(storage.getLocation());
    };

    updateStats();
    const unsubscribe = storage.subscribe(updateStats);
    return () => unsubscribe();
  }, []);

  const handleResetData = () => {
    if (window.confirm('Reset all demo data (inventory, orders, khata) to default?')) {
      storage.resetToDemoData();
      window.location.reload();
    }
  };

  return (
    <>
      {/* Top Language Bar */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300 hidden sm:inline">Language / భాష / भाषा:</span>
            <div className="relative inline-flex items-center">
              <Globe className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="appearance-none bg-slate-800 hover:bg-slate-700/90 text-white text-xs font-bold pl-8 pr-7 py-1 rounded-lg border border-slate-700 hover:border-emerald-500/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition shadow-sm"
                aria-label="Select Language"
              >
                <option value="en" className="bg-slate-900 text-white">English (EN)</option>
                <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
                <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <button
              onClick={() => setIsLocationOpen(true)}
              className="hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{locationState.locality}, {locationState.city}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left: Brand Logo & Tagline */}
            <div className="flex items-center gap-5">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Store className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 tracking-tight text-lg sm:text-xl">
                      {t('brandName')}
                    </span>
                    <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      Local
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                    {t('brandTagline')}
                  </p>
                </div>
              </Link>
            </div>

            {/* Middle: Primary Navigation */}
            <nav className="hidden lg:flex items-center gap-1.5">
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  location.pathname === '/'
                    ? 'text-emerald-800 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t('home')}
              </Link>
              <Link
                to="/search"
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                  location.pathname === '/search'
                    ? 'text-emerald-800 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Mic className="w-4 h-4 text-emerald-600" />
                <span>{t('findProducts')}</span>
              </Link>
              <Link
                to="/shops"
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  location.pathname === '/shops'
                    ? 'text-emerald-800 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t('nearbyShops')}
              </Link>
              <Link
                to="/orders"
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition relative flex items-center gap-1.5 ${
                  location.pathname.startsWith('/orders') || location.pathname.startsWith('/order-status')
                    ? 'text-emerald-800 bg-emerald-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PackageCheck className="w-4 h-4" />
                <span>{t('myOrders')}</span>
                {ordersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {ordersCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Right: Switcher (Customer vs Shopkeeper) & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Reset Demo Data button */}
              <button
                onClick={handleResetData}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-medium transition"
                title={t('resetDemo')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('resetDemo')}</span>
              </button>

              {/* Mode Switcher Button */}
              {isShopkeeperRoute ? (
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm font-bold transition shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>{t('customerView')}</span>
                </Link>
              ) : (
                <Link
                  to="/shopkeeper"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs sm:text-sm font-bold transition shadow-sm shadow-emerald-600/20"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-200" />
                  <span>{t('shopkeeperMode')}</span>
                </Link>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-2 animate-fadeIn">
            {/* Language Selector in mobile menu */}
            <div className="p-2.5 bg-slate-100 rounded-xl mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                Language / భాష:
              </span>
              <div className="relative inline-flex items-center">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="appearance-none bg-white text-slate-800 text-xs font-bold pl-3 pr-7 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition shadow-sm"
                  aria-label="Select Mobile Language"
                >
                  <option value="en">English (EN)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
              </div>
            </div>

            {/* Location Pill for mobile */}
            <button
              onClick={() => {
                setIsLocationOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium mb-2"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{locationState.locality}, {locationState.city}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase">{t('changeLocation')}</span>
            </button>

            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              {t('home')}
            </Link>
            <Link
              to="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-50"
            >
              <Mic className="w-4 h-4 text-emerald-600" />
              <span>{t('findProducts')}</span>
            </Link>
            <Link
              to="/shops"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              {t('nearbyShops')}
            </Link>
            <Link
              to="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-slate-500" />
                <span>{t('myOrders')}</span>
              </div>
              {ordersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                  {ordersCount}
                </span>
              )}
            </Link>
            <Link
              to="/shopkeeper"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>{t('shopkeeperMode')}</span>
            </Link>
          </div>
        )}
      </header>

      <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
    </>
  );
};
