import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  PhoneCall,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Store,
  DollarSign,
  Calendar,
  CreditCard,
  X,
  Share2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { Customer, KhataTransaction, Shop } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const CustomerKhataPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>(() => storage.getCustomers());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-1'); // Default to Ramesh Kumar
  const [khataRecords, setKhataRecords] = useState<KhataTransaction[]>([]);
  const [shops, setShops] = useState<Shop[]>(() => storage.getShops());

  // Modal states for UPI QR code & Payment Simulation
  const [activeQrShop, setActiveQrShop] = useState<{ shop: Shop; balance: number } | null>(null);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const refreshData = () => {
    setCustomers(storage.getCustomers());
    setShops(storage.getShops());
    if (activeCustomer) {
      setKhataRecords(storage.getKhata(undefined, activeCustomer.id));
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = storage.subscribe(refreshData);
    return () => unsub();
  }, [selectedCustomerId, activeCustomer?.id]);

  // Group khata records by shop
  const recordsByShop: Record<string, KhataTransaction[]> = {};
  khataRecords.forEach((rec) => {
    if (!recordsByShop[rec.shopId]) {
      recordsByShop[rec.shopId] = [];
    }
    recordsByShop[rec.shopId].push(rec);
  });

  // Calculate total owed and total paid
  const totalDebit = khataRecords.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = khataRecords.reduce((sum, r) => sum + r.credit, 0);
  const totalOutstanding = activeCustomer ? activeCustomer.khataBalance : 0;

  // Handle instant payment settlement simulation
  const handleSimulatePayment = (shopId: string, amount: number) => {
    if (!activeCustomer || amount <= 0) return;

    const shop = storage.getShopById(shopId) || shops[0];
    const prevBal = activeCustomer.khataBalance;
    const newBal = Math.max(0, prevBal - amount);

    storage.addKhataTransaction({
      shopId,
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      date: 'Today',
      itemDescription: `Online UPI Settlement Payment (${shop.name})`,
      debit: 0,
      credit: amount,
      previousBalance: prevBal,
      remainingBalance: newBal,
      notes: 'Paid via impulx.ai Customer UPI Portal',
    });

    setActiveQrShop(null);
    setPaymentSuccessMsg(
      language === 'te'
        ? `₹${amount} విజయవంతంగా చెల్లించబడింది! మీ ఖాతా బ్యాలెన్స్ అప్‌డేట్ చేయబడింది.`
        : language === 'hi'
        ? `₹${amount} का भुगतान सफलतापूर्वक हो गया! आपका खाता अपडेट हो गया है।`
        : `Successfully paid ₹${amount} via UPI to ${shop.name}! Balance updated.`
    );

    setTimeout(() => {
      setPaymentSuccessMsg(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {language === 'te' ? 'నా ఖాతా & చెల్లింపుల పోర్టల్' : language === 'hi' ? 'मेरा खाता बही व ऑनलाइन भुगतान' : 'Customer Digital Khata & Pay'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  impulx.ai
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                {language === 'te'
                  ? 'మీరు ఏ ఏ షాపుల్లో సరుకులు కొన్నారో, ఎంత ఉధార్ బాకీ ఉందో పరిశీలించండి. నేరుగా UPI లేదా ఫోన్ నంబర్ ద్వారా చెల్లించండి.'
                  : language === 'hi'
                  ? 'देखें किस दुकान से क्या सामान खरीदा है और कितना उधार बाकी है। UPI या फोन से तुरंत भुगतान करें।'
                  : 'Track all your local store credit purchases, check outstanding balances, and pay directly via UPI QR code or phone.'}
              </p>
            </div>
          </div>

          {/* Active Customer Switcher for Demo */}
          <div className="bg-slate-800/90 border border-slate-700 p-2.5 rounded-2xl self-start md:self-auto min-w-[200px]">
            <span className="text-[10px] text-slate-400 uppercase font-black block mb-1">
              {language === 'te' ? 'కస్టమర్ ప్రొఫైల్ మార్చుకోండి:' : language === 'hi' ? 'ग्राहक प्रोफाइल चुनें:' : 'Viewing Account:'}
            </span>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-900 text-white text-xs font-bold py-1.5 px-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.locality} • ₹{c.khataBalance} Due)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Success Alert */}
        {paymentSuccessMsg && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center gap-3 text-xs text-emerald-950 font-bold shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="flex-1">{paymentSuccessMsg}</span>
          </div>
        )}

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'te' ? 'మొత్తం బాకీ (చెల్లించాల్సినది)' : language === 'hi' ? 'कुल बकाया (भुगतान योग्य)' : 'Total Outstanding Due'}
              </span>
              <div className="text-2xl font-black text-rose-600 mt-1">
                ₹{totalOutstanding.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Across all neighborhood shops</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'te' ? 'మొత్తం కొనుగోళ్లు (ఉధార్)' : language === 'hi' ? 'कुल उधार खरीदारी' : 'Total Credit Purchases'}
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{totalDebit.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Billed to your ledger</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'te' ? 'చెల్లించిన మొత్తం' : language === 'hi' ? 'जमा / चुकाई गई राशि' : 'Total Settled & Paid'}
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                ₹{totalCredit.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Successfully received by stores</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Stores and Product Purchases Breakdown */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {language === 'te' ? 'దుకాణాల వారీగా బాకీ & కొనుగోలు వివరాలు' : language === 'hi' ? 'दुकान अनुसार बकाया व सामान का हिसाब' : 'Store-wise Outstanding Ledgers & Purchases'}
            </h2>
            <Link
              to="/orders"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{t('myOrders')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {Object.keys(recordsByShop).length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-base">No Outstanding Balance!</h3>
              <p className="text-xs text-slate-500 mt-1">
                You have settled all your store ledgers. You have 0 pending dues.
              </p>
            </div>
          ) : (
            Object.entries(recordsByShop).map(([shopId, records]) => {
              const shop = shops.find((s) => s.id === shopId) || shops[0];
              const shopDebit = records.reduce((acc, r) => acc + r.debit, 0);
              const shopCredit = records.reduce((acc, r) => acc + r.credit, 0);
              const shopBalance = records[0]?.remainingBalance ?? Math.max(0, shopDebit - shopCredit);
              const cleanPhone = shop.phone.replace(/[^0-9]/g, '');

              return (
                <div
                  key={shopId}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4"
                >
                  {/* Shop header & Balance row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-base">{shop.name}</h3>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {shop.locality}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Proprietor: <strong>{shop.ownerName}</strong> • Phone: {shop.phone}
                        </p>
                      </div>
                    </div>

                    {/* Balance & Payment buttons */}
                    <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                      <div className="text-right mr-2">
                        <span className="text-[10px] text-slate-400 uppercase font-black block">
                          {language === 'te' ? 'ఈ దుకాణానికి చెల్లించాల్సినది' : language === 'hi' ? 'इस दुकान को देय' : 'Remaining Due'}
                        </span>
                        <span className="text-lg font-black text-rose-600">
                          ₹{shopBalance.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {shopBalance > 0 ? (
                        <>
                          <button
                            onClick={() => {
                              setActiveQrShop({ shop, balance: shopBalance });
                              setSettleAmount(shopBalance);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>{language === 'te' ? 'UPI తో చెల్లించండి' : language === 'hi' ? 'UPI से भुगतान' : 'Pay via UPI'}</span>
                          </button>

                          <a
                            href={`tel:${cleanPhone}`}
                            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{language === 'te' ? 'షాపుకి కాల్' : language === 'hi' ? 'कॉल करें' : 'Call'}</span>
                          </a>
                        </>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Fully Paid
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Itemized Credit Purchases & Settlement History */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      {language === 'te' ? 'కొనుగోలు చేసిన సరుకులు & జమ వివరాలు:' : language === 'hi' ? 'सामान का विवरण व जमा:' : 'Itemized Purchases & Payments:'}
                    </span>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                            <th className="pb-2">Date</th>
                            <th className="pb-2">Items / Transaction Description</th>
                            <th className="pb-2 text-right">Debit (Udhar)</th>
                            <th className="pb-2 text-right">Credit (Paid)</th>
                            <th className="pb-2 text-right">Remaining</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {records.map((entry) => (
                            <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 font-bold text-slate-500 whitespace-nowrap">
                                {entry.date}
                              </td>
                              <td className="py-2.5 font-medium text-slate-900">
                                <div>{entry.itemDescription}</div>
                                {entry.notes && (
                                  <div className="text-[10px] text-slate-400 italic mt-0.5">
                                    "{entry.notes}"
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 text-right font-black text-rose-600">
                                {entry.debit > 0 ? `+₹${entry.debit}` : '—'}
                              </td>
                              <td className="py-2.5 text-right font-black text-emerald-700">
                                {entry.credit > 0 ? `-₹${entry.credit}` : '—'}
                              </td>
                              <td className="py-2.5 text-right font-black text-slate-900">
                                ₹{entry.remainingBalance}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* DYNAMIC UPI QR CODE & PAYMENT MODAL */}
      {activeQrShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {language === 'te' ? 'UPI ద్వారా చెల్లించండి' : language === 'hi' ? 'UPI से ऑनलाइन भुगतान' : 'Pay via UPI QR Code'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {activeQrShop.shop.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveQrShop(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with QR code */}
            <div className="p-6 text-center space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 inline-block mx-auto shadow-sm">
                {/* Dynamically generated SVG / QR for the shopkeeper UPI payment */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${activeQrShop.shop.phone.replace(/[^0-9]/g, '')}@upi&pn=${encodeURIComponent(activeQrShop.shop.name)}&am=${settleAmount || activeQrShop.balance}&cu=INR`}
                  alt="UPI QR Code"
                  className="w-44 h-44 mx-auto rounded-xl border border-white shadow-inner bg-white p-1"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase block">
                  Store UPI ID / Phone:
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  {activeQrShop.shop.phone.replace(/[^0-9]/g, '')}@upi ({activeQrShop.shop.phone})
                </span>
              </div>

              {/* Supported payment apps badges */}
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200">
                <span>Google Pay</span>
                <span>•</span>
                <span>PhonePe</span>
                <span>•</span>
                <span>Paytm</span>
                <span>•</span>
                <span>BHIM UPI</span>
              </div>

              {/* Amount to pay input */}
              <div className="text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Amount to Pay (₹):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(Number(e.target.value))}
                    min={1}
                    max={activeQrShop.balance}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setSettleAmount(activeQrShop.balance)}
                    className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
                  >
                    Full Due
                  </button>
                </div>
              </div>

              {/* Confirm / Simulate settlement button */}
              <button
                onClick={() => handleSimulatePayment(activeQrShop.shop.id, settleAmount || activeQrShop.balance)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Payment (₹{settleAmount || activeQrShop.balance})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
