import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  BookOpen,
  Plus,
  ArrowRight,
  Mic,
  Package,
  DollarSign,
  CheckCircle2,
  PhoneCall,
  Bot,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { Order, InventoryItem, Transaction } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const ShopOverview: React.FC = () => {
  const navigate = useNavigate();
  const shop = storage.getShopById('shop-1') || storage.getShops()[0];
  const { t, language } = useLanguage();

  const [orders, setOrders] = useState<Order[]>(storage.getOrders(shop.id));
  const [inventory, setInventory] = useState<InventoryItem[]>(storage.getInventory(shop.id));
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions(shop.id));
  const [customers, setCustomers] = useState(storage.getCustomers());

  useEffect(() => {
    const update = () => {
      setOrders(storage.getOrders(shop.id));
      setInventory(storage.getInventory(shop.id));
      setTransactions(storage.getTransactions(shop.id));
      setCustomers(storage.getCustomers());
    };
    update();
    const unsub = storage.subscribe(update);
    return () => unsub();
  }, [shop.id]);

  const todaySales = transactions.reduce((acc, t) => acc + t.amount, 0) + 2420;
  const pendingOrders = orders.filter((o) => o.status === 'request_sent' || o.status === 'preparing');
  const lowStockItems = inventory.filter((i) => i.status === 'low_stock' || i.quantity <= i.minStockLevel);
  const outstandingKhata = customers.reduce((acc, c) => acc + c.khataBalance, 0);

  const handleAcceptOrder = (orderId: string) => {
    storage.updateOrderStatus(orderId, 'shop_accepted');
  };

  const handleQuickRestock = (itemId: string) => {
    storage.adjustStock(itemId, 5);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {shop.ownerName} ({shop.name})
            </h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {language === 'te' ? 'దుకాణం తెరిచి ఉంది' : language === 'hi' ? 'दुकान खुली है' : 'Store Active'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {shop.locality}, Vijayawada • {shop.phone}
          </p>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2">
          <Link
            to="/shopkeeper/mana-ai"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950 hover:from-slate-800 hover:to-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition border border-emerald-500/40"
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Mana-AI Copilot</span>
            <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded-full font-black">
              Voice & Brain
            </span>
          </Link>
        </div>
      </div>

      {/* TODAY'S SUMMARY CARDS */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          {t('todaySummary')}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Sales */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">{t('todaySales')}</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                ₹
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">
                ₹{todaySales.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5 font-bold">
                18 transactions
              </span>
            </div>
          </div>

          {/* 2. Customer Khata Udhar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">{t('outstandingKhata')}</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-purple-950">
                ₹{outstandingKhata.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-purple-600 block mt-0.5 font-bold">
                {customers.length} {language === 'te' ? 'ఖాతాదారులు' : language === 'hi' ? 'ग्राहक' : 'accounts'}
              </span>
            </div>
          </div>

          {/* 3. Pending Orders */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">{t('pendingOrders')}</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-amber-600">
                {pendingOrders.length}
              </span>
              <span className="text-[10px] text-amber-700 block mt-0.5 font-bold">
                {language === 'te' ? 'చూడవలసినవి' : language === 'hi' ? 'देखना बाकी है' : 'Action required'}
              </span>
            </div>
          </div>

          {/* 4. Low Stock */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold">{t('lowStock')}</span>
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-red-600">
                {lowStockItems.length || 3}
              </span>
              <span className="text-[10px] text-red-500 block mt-0.5 font-bold">
                {language === 'te' ? 'సరుకు అయిపోతోంది' : language === 'hi' ? 'खत्म होने वाला है' : 'Restock needed'}
              </span>
            </div>
          </div>
        </div>
      </div>

        {/* QUICK ACTIONS ROW */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {t('quickActions')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Link
              to="/shopkeeper/mana-ai"
              className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:bg-emerald-100 border-2 border-emerald-400/60 text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="flex items-center gap-1 text-slate-900">
                  Mana-AI <span className="bg-emerald-600 text-white text-[8px] px-1 rounded font-black">AI</span>
                </span>
                <span className="text-[10px] text-emerald-800 block font-normal">
                  {language === 'te' ? 'వ్యాపార PDF' : language === 'hi' ? 'PDF रिपोर्ट' : 'Ask & PDFs'}
                </span>
              </div>
            </Link>

            <Link
              to="/shopkeeper/mana-ai"
              className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs sm:text-sm flex items-center gap-2 transition"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <span>{language === 'te' ? 'వాయిస్ ఎంట్రీ' : language === 'hi' ? 'बोलकर एंट्री' : 'Voice Entry'}</span>
                <span className="text-[10px] text-emerald-700 block font-normal">
                  {language === 'te' ? 'స్టాక్, ఖాతా, ఖర్చులు' : language === 'hi' ? 'स्टॉक व खाता' : 'Stock, Khata, Bills'}
                </span>
              </div>
            </Link>

          <Link
            to="/shopkeeper/khata"
            className="p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 font-bold text-xs sm:text-sm flex items-center gap-2.5 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span>{t('khataTitle').split(' ')[0]} {t('khataTitle').split(' ')[1]}</span>
              <span className="text-[10px] text-purple-700 block font-normal">
                {language === 'te' ? 'ఉధార్ లెక్కలు' : language === 'hi' ? 'उधार बही' : 'Customer Ledger'}
              </span>
            </div>
          </Link>

          <Link
            to="/shopkeeper/inventory"
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-2.5 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span>{t('actionAddProduct')}</span>
              <span className="text-[10px] text-slate-500 block font-normal">
                {language === 'te' ? 'సరుకు & ధర' : language === 'hi' ? 'सामान और दाम' : 'Stock & Prices'}
              </span>
            </div>
          </Link>

          <Link
            to="/shopkeeper/orders"
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-2.5 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span>{t('actionViewOrders')}</span>
              <span className="text-[10px] text-slate-500 block font-normal">
                {orders.length} {t('totalOrders')}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* TWO COLUMN GRID: RECENT ORDERS & LOW STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders with Quick Accept */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">
              {t('incomingOrders')}
            </h3>
            <Link
              to="/shopkeeper/orders"
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold"
            >
              {language === 'te' ? 'అన్నీ చూడండి' : language === 'hi' ? 'सभी देखें' : 'View All'} ({orders.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => {
              const isPending = order.status === 'request_sent';
              return (
                <div
                  key={order.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    isPending ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs">
                          #{order.orderNumber}
                        </span>
                        <span className="font-bold text-slate-800 text-xs">
                          {order.customerName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded capitalize ${
                            isPending ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {order.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-slate-900 text-xs block">
                        ₹{order.total}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                      </span>
                    </div>
                  </div>

                  {isPending && (
                    <div className="mt-3 pt-2.5 border-t border-amber-200 flex items-center justify-between">
                      <span className="text-[11px] text-amber-900 font-bold">
                        {language === 'te' ? 'కొత్త ఆర్డర్ వచ్చింది' : language === 'hi' ? 'नया ऑर्डर आया है' : 'New request'}
                      </span>
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('acceptOrder')}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Low-Stock Attention */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">
              {t('lowStock')}
            </h3>
            <Link
              to="/shopkeeper/inventory"
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold"
            >
              {language === 'te' ? 'సరుకుల జాబితా' : language === 'hi' ? 'स्टॉक देखें' : 'Inventory'} →
            </Link>
          </div>

          <div className="space-y-2.5">
            {lowStockItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{item.productName}</span>
                  <span className="text-[11px] text-red-600 font-semibold">
                    {language === 'te' ? `కేవలం ${item.quantity} ${item.unit} మాత్రమే ఉంది` : language === 'hi' ? `सिर्फ ${item.quantity} ${item.unit} बचा है` : `Only ${item.quantity} ${item.unit} left`}
                  </span>
                </div>

                <button
                  onClick={() => handleQuickRestock(item.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs transition flex items-center gap-1 shrink-0"
                  title="Restock +5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+5 సరుకు</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
