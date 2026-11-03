import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Shield, MapPin, Globe } from 'lucide-react';
import { useLanguage, Language } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Store className="w-4 h-4 text-emerald-200" />
              </div>
              <span className="font-black text-white text-base">
                {t('brandName')}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {language === 'te'
                ? 'స్థానిక కిరాణా షాపులు మరియు సమీప కస్టమర్లను సులభంగా అనుసంధానించే వేదిక.'
                : language === 'hi'
                ? 'पास की दुकानों और ग्राहकों को सीधे जोड़ने वाला आसान मंच।'
                : 'Connecting neighborhood kirana stores with nearby customers easily.'}
            </p>
          </div>

          {/* Customer Links */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              {language === 'te' ? 'కస్టమర్ల కోసం' : language === 'hi' ? 'ग्राहकों के लिए' : 'For Customers'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="hover:text-emerald-400 transition">
                  {t('findProducts')}
                </Link>
              </li>
              <li>
                <Link to="/shops" className="hover:text-emerald-400 transition">
                  {t('nearbyShops')}
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-emerald-400 transition">
                  {t('myOrders')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Shopkeeper Solutions */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              {language === 'te' ? 'దుకాణదారుల కోసం' : language === 'hi' ? 'दुकानदारों के लिए' : 'For Shopkeepers'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shopkeeper/mana-ai" className="hover:text-emerald-400 transition">
                  {language === 'te' ? 'Mana-AI కోపైలట్' : language === 'hi' ? 'Mana-AI सलाहकार' : 'Mana-AI Copilot'}
                </Link>
              </li>
              <li>
                <Link to="/shopkeeper/khata" className="hover:text-emerald-400 transition">
                  {t('khataTitle')}
                </Link>
              </li>
              <li>
                <Link to="/shopkeeper/inventory" className="hover:text-emerald-400 transition">
                  {t('inventoryTitle')}
                </Link>
              </li>
              <li>
                <Link to="/shopkeeper/reports" className="hover:text-emerald-400 transition">
                  {t('reportsTitle')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Language Switcher in Footer */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
              భాష / भाषा / Language
            </h4>
            <div className="flex flex-col gap-1.5 text-xs">
              <button
                onClick={() => setLanguage('te')}
                className={`text-left px-3 py-1.5 rounded-xl border transition ${
                  language === 'te'
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold'
                    : 'border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🇮🇳 తెలుగు (Telugu)
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`text-left px-3 py-1.5 rounded-xl border transition ${
                  language === 'hi'
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold'
                    : 'border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🇮🇳 हिंदी (Hindi)
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`text-left px-3 py-1.5 rounded-xl border transition ${
                  language === 'en'
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold'
                    : 'border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {t('brandName')}. Designed & Developed by{' '}
            <strong className="text-slate-300 font-semibold">Akhil Kumar</strong>.
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <Shield className="w-3.5 h-3.5" /> Built for Indian Retailers
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Vijayawada, AP
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
