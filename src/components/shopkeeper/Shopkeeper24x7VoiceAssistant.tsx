import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Package,
  Truck,
  Clock,
  ArrowRight,
  Globe,
  ChevronDown,
  X,
  Play,
  RotateCw,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { Order, OrderStatus } from '../../types';
import { useLanguage, Language } from '../../context/LanguageContext';

interface Shopkeeper24x7VoiceAssistantProps {
  shopId?: string;
}

export const Shopkeeper24x7VoiceAssistant: React.FC<Shopkeeper24x7VoiceAssistantProps> = ({
  shopId = 'shop-1',
}) => {
  const { language, setLanguage, t } = useLanguage();
  const shop = storage.getShopById(shopId) || storage.getShops()[0];

  const [orders, setOrders] = useState<Order[]>(() => storage.getOrders(shop.id));
  const [activeVoiceOrder, setActiveVoiceOrder] = useState<Order | null>(null);

  // Voice Engine States
  const [isListening, setIsListening] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [assistantStatus, setAssistantStatus] = useState<string>('24/7 AI Voice Monitoring Active');
  const [lastSpokenText, setLastSpokenText] = useState<string>('');
  const [isDismissedManual, setIsDismissedManual] = useState(false);

  // Selected Speech recognition language
  const [voiceLang, setVoiceLang] = useState<'te-IN' | 'hi-IN' | 'en-IN'>(
    language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'
  );

  const recognitionRef = useRef<any>(null);
  const announcedOrderIdsRef = useRef<Set<string>>(new Set());
  const transcriptRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);

  // Keep voiceLang synced with global language
  useEffect(() => {
    setVoiceLang(language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN');
  }, [language]);

  // Sound Chime using Web Audio API
  const playKiranaDoorbellChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.35); // D6

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime + 0.15);
      osc1.stop(ctx.currentTime + 0.8);
      osc2.stop(ctx.currentTime + 0.8);
    } catch {}
  };

  // Text-To-Speech Speech Synthesis
  const speakAI = (text: string, onEnd?: () => void) => {
    if (isSoundMuted || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLang;
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      isSpeakingRef.current = true;
      setLastSpokenText(text);

      utterance.onend = () => {
        isSpeakingRef.current = false;
        onEnd?.();
      };
      utterance.onerror = () => {
        isSpeakingRef.current = false;
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      isSpeakingRef.current = false;
      onEnd?.();
    }
  };

  // Start continuous speech recognition
  const startListening = () => {
    if (!isVoiceActive) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      transcriptRef.current = '';
      setInterimTranscript('');

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        // Ignore speech while AI itself is talking
        if (isSpeakingRef.current) return;

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = (final || interim).trim();
        if (currentText) {
          transcriptRef.current = currentText;
          setInterimTranscript(currentText);

          // Auto-commit debounce: after 900ms silence, process spoken voice command
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptRef.current.trim().length > 1) {
              handleProcessShopkeeperVoice(transcriptRef.current.trim());
            }
          }, 900);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('Speech recognition status:', e.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically restart listening if still on active order & not muted
        if (isVoiceActive && activeVoiceOrder && !isDismissedManual) {
          setTimeout(() => {
            try {
              if (activeVoiceOrder) startListening();
            } catch {}
          }, 300);
        }
      };

      recognition.start();
    } catch {}
  };

  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  // Subscribe to storage orders
  useEffect(() => {
    const checkOrders = () => {
      const allOrders = storage.getOrders(shop.id);
      setOrders(allOrders);

      // Check for an actionable order (request_sent > preparing > ready)
      const pendingOrder = allOrders.find(
        (o) => o.status === 'request_sent' || o.status === 'preparing' || o.status === 'ready'
      );

      if (pendingOrder) {
        setActiveVoiceOrder(pendingOrder);
        setIsDismissedManual(false);

        // If it's a new incoming order (request_sent) and hasn't been spoken yet
        if (pendingOrder.status === 'request_sent' && !announcedOrderIdsRef.current.has(pendingOrder.id)) {
          announcedOrderIdsRef.current.add(pendingOrder.id);
          playKiranaDoorbellChime();

          const itemsSummary = pendingOrder.items.map((i) => `${i.quantity} ${i.productName}`).join(', ');

          const promptText =
            voiceLang === 'te-IN'
              ? `నమస్కారం! మీకు ${pendingOrder.customerName} నుండి కొత్త ఆర్డర్ వచ్చింది: ${itemsSummary}. ఈ సరుకులు మీ దగ్గర ఉన్నాయా? మీరు ఆర్డర్ అంగీకరిస్తారా?`
              : voiceLang === 'hi-IN'
              ? `नमस्ते! आपको ${pendingOrder.customerName} से नया ऑर्डर मिला है: ${itemsSummary}। क्या यह सामान आपकी दुकान में है? क्या आप ऑर्डर स्वीकार करते हैं?`
              : `Hey! You got a new order from ${pendingOrder.customerName} for ${itemsSummary}. Are these items available with you? Do you want to accept?`;

          setAssistantStatus(
            voiceLang === 'te-IN'
              ? 'కొత్త ఆర్డర్ వచ్చింది! మీ సమాధానం కోసం వింటున్నాను...'
              : voiceLang === 'hi-IN'
              ? 'नया ऑर्डर आया! आपके जवाब का इंतजार है...'
              : 'New order received! Waiting for your voice confirmation...'
          );

          // Speak prompt aloud, then immediately start listening for shopkeeper voice
          speakAI(promptText, () => {
            startListening();
          });
        }
      } else {
        setActiveVoiceOrder(null);
      }
    };

    checkOrders();
    const unsub = storage.subscribe(checkOrders);
    return () => unsub();
  }, [shop.id, voiceLang]);

  // Clean up timers & speech on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Process Shopkeeper Spoken Voice
  const handleProcessShopkeeperVoice = (spokenText: string) => {
    if (!activeVoiceOrder) return;
    const lower = spokenText.toLowerCase();
    const currentOrder = activeVoiceOrder;

    // STAGE 1: ORDER ACCEPTANCE / AVAILABILITY
    // "Yeah these items are available in my stock and I am ready for the package / 5 minutes packaging time"
    const isAcceptAvailable =
      lower.includes('available') ||
      lower.includes('accept') ||
      lower.includes('yes') ||
      lower.includes('pack') ||
      lower.includes('ready for package') ||
      lower.includes('ready') ||
      lower.includes('5 minutes') ||
      lower.includes('10 minutes') ||
      lower.includes('ఉన్నాయి') ||
      lower.includes('సరుకు ఉంది') ||
      lower.includes('అంగీకరించు') ||
      lower.includes('తీసుకో') ||
      lower.includes('ప్యాక్') ||
      lower.includes('సరే') ||
      lower.includes('అవును') ||
      lower.includes('హా') ||
      lower.includes('सामान है') ||
      lower.includes('स्वीकार') ||
      lower.includes('हाँ') ||
      lower.includes('पैक कर रहा हूँ') ||
      lower.includes('पैक');

    // STAGE 2: PACKING COMPLETE / WAITING FOR DELIVERY PARTNER
    // "Hey I have packed the items and it's ready for delivery / waiting for delivery partner"
    const isPackedReadyForPartner =
      (lower.includes('packed') || lower.includes('packing') || lower.includes('ప్యాకింగ్ అయిపోయింది') || lower.includes('ప్యాక్ చేసేశాను') || lower.includes('पैक हो गया')) &&
      (lower.includes('ready') || lower.includes('partner') || lower.includes('waiting') || lower.includes('రెడీ') || lower.includes('తయార్') || lower.includes('delivery'));

    // STAGE 3: DELIVERY PARTNER ARRIVED / SENT
    // "Yeah I have packed and the delivery partner has arrived and I have sent the order / out for delivery"
    const isPartnerArrivedSent =
      lower.includes('delivery partner has arrived') ||
      lower.includes('partner has arrived') ||
      lower.includes('delivery partner arrived') ||
      lower.includes('sent the order') ||
      lower.includes('sent') ||
      lower.includes('out for delivery') ||
      lower.includes('on the way') ||
      lower.includes('డెలివరీ బాయ్ వచ్చాడు') ||
      lower.includes('డెలివరీ పార్టనర్ వచ్చాడు') ||
      lower.includes('పంపించేశాను') ||
      lower.includes('రవాణా') ||
      lower.includes('బయలుదేరింది') ||
      lower.includes('डिलीवरी पार्टनर आ गया') ||
      lower.includes('भेज दिया') ||
      lower.includes('रवाना हो गया') ||
      lower.includes('निकल गया');

    // REJECTION
    const isReject =
      lower.includes('not available') ||
      lower.includes('reject') ||
      lower.includes('cancel') ||
      lower.includes('no stock') ||
      lower.includes('సరుకు లేదు') ||
      lower.includes('వద్దు') ||
      lower.includes('రద్దు') ||
      lower.includes('सामान नहीं है') ||
      lower.includes('रद्द');

    // EXECUTE LIFECYCLE TRANSITIONS:
    if (isPartnerArrivedSent && (currentOrder.status === 'ready' || currentOrder.status === 'preparing')) {
      // 3. Mark OUT_FOR_DELIVERY
      stopListening();
      const statusNote = 'Delivery partner has picked up — yeah it is on the way for delivery! 🛵';
      storage.updateOrderStatus(
        currentOrder.id,
        'out_for_delivery',
        'On the way for delivery! 🛵',
        statusNote,
        { speaker: 'shopkeeper', text: spokenText }
      );

      const aiReply =
        voiceLang === 'te-IN'
          ? 'చాలా బాగుంది! ఆర్డర్ డెలివరీకి బయలుదేరింది అని కస్టమర్ స్క్రీన్‌లో వెంటనే అప్‌డేట్ చేశాను.'
          : voiceLang === 'hi-IN'
          ? 'बहुत बढ़िया! ऑर्डर डिलीवरी के लिए निकल गया है, ग्राहक को सूचना दे दी गई है।'
          : 'Awesome! Notified customer that order is on the way for delivery! 🛵';

      setAssistantStatus('Order dispatched for delivery 🛵');
      speakAI(aiReply, () => {
        startListening();
      });
      return;
    }

    if (isPackedReadyForPartner && (currentOrder.status === 'preparing' || currentOrder.status === 'shop_accepted')) {
      // 2. Mark READY (Waiting for Delivery Partner)
      stopListening();
      const statusNote = 'Items have been packed and are ready for delivery, waiting for delivery partner.';
      storage.updateOrderStatus(
        currentOrder.id,
        'ready',
        'Packed & ready, waiting for delivery partner',
        statusNote,
        { speaker: 'shopkeeper', text: spokenText }
      );

      const aiReply =
        voiceLang === 'te-IN'
          ? 'సరే! సరుకులు ప్యాక్ అయిపోయాయి, డెలివరీ పార్టనర్ కోసం సిద్ధంగా ఉన్నట్లు కస్టమర్‌కి అప్‌డేట్ చేశాను. డెలివరీ బాయ్ రాగానే "డెలివరీ బాయ్ వచ్చాడు, పంపించేశాను" అని చెప్పండి.'
          : voiceLang === 'hi-IN'
          ? 'ठीक है! सामान पैक हो गया और डिलीवरी पार्टनर की प्रतीक्षा है। डिलीवरी पार्टनर आते ही "सामान भेज दिया" बोलें।'
          : 'Items packed and ready for delivery partner! Customer portal updated. When delivery partner arrives, just say "Sent the order".';

      setAssistantStatus('Items packed. Waiting for delivery partner...');
      speakAI(aiReply, () => {
        startListening();
      });
      return;
    }

    if (isAcceptAvailable && (currentOrder.status === 'request_sent' || currentOrder.status === 'shop_accepted')) {
      // 1. Mark PREPARING (In-Stock & Packing)
      stopListening();
      const statusNote = 'Yeah your items are there in stock and store is packing them up (Estimated 5 mins).';
      storage.updateOrderStatus(
        currentOrder.id,
        'preparing',
        'Items being packed (5 mins)',
        statusNote,
        { speaker: 'shopkeeper', text: spokenText }
      );

      const aiReply =
        voiceLang === 'te-IN'
          ? 'అద్భుతం! సరుకులు ఉన్నాయని మరియు 5 నిమిషాల్లో ప్యాక్ చేస్తున్నారని కస్టమర్ పోర్టల్‌లో అప్‌డేట్ చేశాను. ప్యాకింగ్ పూర్తయ్యాక "ప్యాకింగ్ అయిపోయింది" అని చెప్పండి.'
          : voiceLang === 'hi-IN'
          ? 'बढ़िया! ग्राहक को सूचित कर दिया गया है कि सामान उपलब्ध है और पैक हो रहा है। पैकिंग पूरी होने पर "पैक हो गया" बोलें।'
          : 'Great! Updated customer portal: Items are available and being packed (5 mins). When packed, say "Items are packed".';

      setAssistantStatus('Order accepted. Packaging in progress (5 mins)...');
      speakAI(aiReply, () => {
        startListening();
      });
      return;
    }

    if (isReject && currentOrder.status === 'request_sent') {
      stopListening();
      storage.updateOrderStatus(
        currentOrder.id,
        'rejected',
        'Cancelled: Items out of stock',
        'Store has no stock for requested items',
        { speaker: 'shopkeeper', text: spokenText }
      );
      const aiReply =
        voiceLang === 'te-IN'
          ? 'ఆర్డర్ తిరస్కరించబడింది. కస్టమర్‌కి సమాచారం పంపాను.'
          : voiceLang === 'hi-IN'
          ? 'ऑर्डर रद्द कर दिया गया है।'
          : 'Order rejected. Customer notified.';
      speakAI(aiReply);
      return;
    }

    // Fallback guidance if command wasn't recognized
    const guidance =
      voiceLang === 'te-IN'
        ? 'చెప్పండి: "అవును సరుకులు ఉన్నాయి, 5 నిమిషాల్లో ప్యాక్ చేస్తాను" లేదా "ప్యాకింగ్ అయిపోయింది" లేదా "డెలివరీ బాయ్ వచ్చాడు, పంపించాను".'
        : voiceLang === 'hi-IN'
        ? 'बोलिए: "हाँ सामान है, 5 मिनट में पैक कर रहा हूँ" या "पैक हो गया" या "सामान भेज दिया"।'
        : 'Say: "Yes, items available, 5 mins packing" or "Items are packed" or "Delivery partner arrived, sent the order".';
    speakAI(guidance, () => startListening());
  };

  const handleSimulateNewCustomerOrder = () => {
    storage.simulateIncomingCustomerOrder(shop.id);
  };

  const handleManualAction = (action: 'accept' | 'packed' | 'sent') => {
    if (!activeVoiceOrder) return;
    if (action === 'accept') {
      handleProcessShopkeeperVoice('Yes items are available and I am packing 5 minutes');
    } else if (action === 'packed') {
      handleProcessShopkeeperVoice('Hey I have packed the items and it is ready for delivery waiting for delivery partner');
    } else if (action === 'sent') {
      handleProcessShopkeeperVoice('Delivery partner has arrived and I have sent the order');
    }
  };

  const activeCount = orders.filter(
    (o) => o.status === 'request_sent' || o.status === 'preparing' || o.status === 'ready'
  ).length;

  return (
    <>
      {/* 24/7 AI Persistent Voice Dock at Top of Merchant Screen */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-3 sm:p-4 mb-5 border border-emerald-500/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5 animate-pulse text-emerald-400" />
            </span>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-tight flex items-center gap-1.5">
                <span>24/7 AI Voice Dispatcher</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold px-2 py-0.5 rounded-full uppercase">
                  Always Active
                </span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span>{assistantStatus}</span>
              {activeCount > 0 && (
                <span className="font-bold text-amber-300">
                  • {activeCount} active order(s)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Controls: Voice Language, Sound, Mic, & Simulate Order */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Language Dropdown */}
          <div className="relative inline-flex items-center">
            <Globe className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 pointer-events-none" />
            <select
              value={voiceLang}
              onChange={(e) => {
                const newLang = e.target.value as any;
                setVoiceLang(newLang);
                if (newLang === 'te-IN') setLanguage('te');
                else if (newLang === 'hi-IN') setLanguage('hi');
                else setLanguage('en');
              }}
              className="appearance-none bg-slate-800 text-white text-xs font-bold pl-8 pr-7 py-1.5 rounded-xl border border-slate-700 hover:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-sm"
              title="Change 24/7 AI Speech Language"
            >
              <option value="te-IN">తెలుగు (Telugu)</option>
              <option value="hi-IN">हिंदी (Hindi)</option>
              <option value="en-IN">English (EN)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setIsSoundMuted(!isSoundMuted);
              if (!isSoundMuted && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`p-2 rounded-xl border transition ${
              isSoundMuted
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
            }`}
            title={isSoundMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Mic Toggle */}
          <button
            onClick={() => {
              if (isListening) {
                stopListening();
                setIsVoiceActive(false);
              } else {
                setIsVoiceActive(true);
                startListening();
              }
            }}
            className={`p-2 rounded-xl border transition ${
              isListening
                ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-md shadow-red-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Start microphone listening'}
          >
            {isListening ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Simulate Customer Order Button */}
          <button
            onClick={handleSimulateNewCustomerOrder}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-sm shrink-0"
            title="Simulate a customer placing an order to test the 24/7 AI voice lifecycle immediately"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Order</span>
          </button>
        </div>
      </div>

      {/* ACTIVE ORDER LIVE CONVERSATION MODAL / BANNER */}
      {activeVoiceOrder && !isDismissedManual && (
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500 shadow-xl mb-6 relative animate-fadeIn overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-pulse"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">
                    Order #{activeVoiceOrder.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      activeVoiceOrder.status === 'request_sent'
                        ? 'bg-amber-100 text-amber-900'
                        : activeVoiceOrder.status === 'preparing'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {activeVoiceOrder.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Customer: <strong>{activeVoiceOrder.customerName}</strong> ({activeVoiceOrder.customerPhone}) • {activeVoiceOrder.deliveryAddress}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-base font-black text-emerald-700">₹{activeVoiceOrder.total}</span>
              <button
                onClick={() => setIsDismissedManual(true)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ordered items chips */}
          <div className="py-3 flex flex-wrap gap-2 border-b border-slate-100">
            {activeVoiceOrder.items.map((it, idx) => (
              <span
                key={idx}
                className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-xl border border-slate-200"
              >
                {it.productName} × {it.quantity} {it.unit || 'units'} (₹{it.totalPrice})
              </span>
            ))}
          </div>

          {/* Live Voice Status Card & Microphone Prompt */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                </span>
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  {voiceLang === 'te-IN'
                    ? '24/7 AI లైవ్ వాయిస్ గైడెన్స్ (చెప్పండి):'
                    : voiceLang === 'hi-IN'
                    ? '24/7 AI लाइव वॉइस मार्गदर्शन (बोलें):'
                    : '24/7 AI Live Voice Guidance (Just speak):'}
                </span>
              </div>

              {isListening && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <Mic className="w-3.5 h-3.5" /> Listening for shopkeeper...
                </span>
              )}
            </div>

            {/* WHAT TO SAY INSTRUCTIONS */}
            <div className="text-xs font-medium text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
              {activeVoiceOrder.status === 'request_sent' && (
                <div>
                  <div className="font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="text-emerald-700 text-sm">🗣️</span>
                    <span>
                      {voiceLang === 'te-IN'
                        ? 'ఆర్డర్ అంగీకరించడానికి ఇలా చెప్పండి:'
                        : voiceLang === 'hi-IN'
                        ? 'ऑर्डर स्वीकारने के लिए ऐसे बोलें:'
                        : 'To accept, speak naturally:'}
                    </span>
                  </div>
                  <p className="text-emerald-950 font-bold text-sm bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                    "{voiceLang === 'te-IN'
                      ? 'అవును, సరుకులు ఉన్నాయి, 5 నిమిషాల్లో ప్యాక్ చేస్తాను'
                      : voiceLang === 'hi-IN'
                      ? 'हाँ, सामान उपलब्ध है और 5 मिनट में पैक कर रहा हूँ'
                      : 'Yeah, these items are available in my stock and I am ready for packaging (5 mins)'}"
                  </p>
                </div>
              )}

              {activeVoiceOrder.status === 'preparing' && (
                <div>
                  <div className="font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="text-emerald-700 text-sm">🗣️</span>
                    <span>
                      {voiceLang === 'te-IN'
                        ? 'ప్యాకింగ్ పూర్తయ్యాక ఇలా చెప్పండి:'
                        : voiceLang === 'hi-IN'
                        ? 'पैकिंग पूरी होने पर ऐसे बोलें:'
                        : 'When packed, say:'}
                    </span>
                  </div>
                  <p className="text-emerald-950 font-bold text-sm bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                    "{voiceLang === 'te-IN'
                      ? 'ప్యాకింగ్ అయిపోయింది, డెలివరీ కోసం రెడీగా ఉంది'
                      : voiceLang === 'hi-IN'
                      ? 'सामान पैक हो गया है और डिलीवरी के लिए तैयार है'
                      : 'Hey I have packed the items and it is ready for delivery, waiting for delivery partner'}"
                  </p>
                </div>
              )}

              {activeVoiceOrder.status === 'ready' && (
                <div>
                  <div className="font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="text-emerald-700 text-sm">🗣️</span>
                    <span>
                      {voiceLang === 'te-IN'
                        ? 'డెలివరీ బాయ్ తీసుకెళ్లాక ఇలా చెప్పండి:'
                        : voiceLang === 'hi-IN'
                        ? 'डिलीवरी पार्टनर को देने के बाद बोलें:'
                        : 'When handed to delivery partner, say:'}
                    </span>
                  </div>
                  <p className="text-emerald-950 font-bold text-sm bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                    "{voiceLang === 'te-IN'
                      ? 'డెలివరీ బాయ్ వచ్చాడు, ఆర్డర్ పంపించేశాను'
                      : voiceLang === 'hi-IN'
                      ? 'डिलीवरी पार्टनर आ गया, सामान भेज दिया है'
                      : 'Delivery partner has arrived and I have sent the order, out for delivery'}"
                  </p>
                </div>
              )}
            </div>

            {/* Interim live voice transcript indicator */}
            {interimTranscript && (
              <div className="p-2.5 bg-emerald-100/90 rounded-xl border border-emerald-300 text-xs text-emerald-950 font-bold flex items-center gap-2 animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                <span>Recognized: "{interimTranscript}"</span>
              </div>
            )}

            {/* Tap button fallbacks for convenience */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400">Or Tap:</span>
              {activeVoiceOrder.status === 'request_sent' && (
                <button
                  onClick={() => handleManualAction('accept')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept (In Stock & Pack 5 mins)</span>
                </button>
              )}
              {activeVoiceOrder.status === 'preparing' && (
                <button
                  onClick={() => handleManualAction('packed')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Mark Packed (Waiting for Partner)</span>
                </button>
              )}
              {activeVoiceOrder.status === 'ready' && (
                <button
                  onClick={() => handleManualAction('sent')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Handed to Delivery Partner (Out for Delivery)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
