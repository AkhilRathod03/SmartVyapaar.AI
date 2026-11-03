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
import { aiService } from '../../services/aiService';
import { Order, OrderStatus } from '../../types';
import { useLanguage, Language } from '../../context/LanguageContext';

// Product name localization for UI pill tags
export const getLocalizedProductName = (
  productName: string,
  lang: 'te-IN' | 'hi-IN' | 'en-IN'
): string => {
  const p = productName.toLowerCase();
  const isTe = lang === 'te-IN';
  const isHi = lang === 'hi-IN';

  if (p.includes('tube light')) {
    if (isTe) return 'ఫిలిప్స్ ట్యూబ్ లైట్ (Philips T5 Tube Light)';
    if (isHi) return 'फिलिप्स ट्यूब लाइट (Philips Tube Light)';
  }
  if (p.includes('led') || p.includes('bulb')) {
    if (isTe) return 'ఫిలిప్స్ ఎల్‌ఈడీ బల్బ్ (Philips LED Bulb 9W)';
    if (isHi) return 'फिलिप्स एलईडी बल्ब (Philips LED Bulb 9W)';
  }
  if (p.includes('surf excel') || p.includes('detergent') || p.includes('quick wash')) {
    if (isTe) return 'సర్ఫ్ ఎక్సెల్ సర్ఫ్ పౌడర్ (Surf Excel 1kg)';
    if (isHi) return 'सर्फ एक्सेल वॉशिंग पाउडर (Surf Excel 1kg)';
  }
  if (p.includes('oil') || p.includes('sunflower')) {
    if (isTe) return 'ఫ్రీడమ్ సన్‌ఫ్లవర్ నూనె (Sunflower Oil 1L)';
    if (isHi) return 'सनफ्लावर तेल (Sunflower Oil 1L)';
  }
  if (p.includes('rice') || p.includes('sona masoori')) {
    if (isTe) return 'సోనా మసూరి బియ్యం (Sona Masoori Rice 25kg)';
    if (isHi) return 'सोना मसूरी चावल (Sona Masoori Rice 25kg)';
  }
  if (p.includes('soap') || p.includes('lifebuoy') || p.includes('lux')) {
    if (p.includes('lux')) {
      if (isTe) return 'లక్స్ సబ్బు (Lux Glow Soap)';
      if (isHi) return 'लक्स साबुन (Lux Soap)';
    }
    if (isTe) return 'లైఫ్‌బాయ్ సబ్బులు (Lifebuoy Soaps)';
    if (isHi) return 'लाइफबॉय साबुन (Lifebuoy Soap)';
  }
  if (p.includes('milk') || p.includes('heritage')) {
    if (isTe) return 'హెరిటేజ్ టోన్డ్ పాలు (Heritage Milk 500ml)';
    if (isHi) return 'दूध पैकेट (Heritage Milk 500ml)';
  }
  if (p.includes('tea') || p.includes('red label') || p.includes('chai')) {
    if (isTe) return 'రెడ్ లేబుల్ టీ పొడి (Red Label Tea 250g)';
    if (isHi) return 'रेड लेबल चाय पत्ती (Red Label Tea 250g)';
  }
  if (p.includes('salt') || p.includes('tata salt')) {
    if (isTe) return 'టాటా ఉప్పు (Tata Salt 1kg)';
    if (isHi) return 'टाटा नमक (Tata Salt 1kg)';
  }
  if (p.includes('biscuit') || p.includes('marie gold') || p.includes('parle')) {
    if (isTe) return 'బ్రిటానియా బిస్కెట్లు (Marie Gold Biscuits)';
    if (isHi) return 'ब्रिटानिया बिस्कुट (Marie Gold Biscuits)';
  }
  return productName;
};

// Conversational product names for natural spoken Telugu/Hindi audio
export const getSpokenProductName = (
  productName: string,
  lang: 'te-IN' | 'hi-IN' | 'en-IN'
): string => {
  const p = productName.toLowerCase();
  if (lang === 'te-IN') {
    if (p.includes('tube light')) return 'ట్యూబ్ లైట్లు';
    if (p.includes('led') || p.includes('bulb')) return 'ఎల్‌ఈడీ బల్బులు';
    if (p.includes('surf excel') || p.includes('detergent') || p.includes('quick wash')) return 'సర్ఫ్ ఎక్సెల్ సర్ఫ్ ప్యాకెట్';
    if (p.includes('oil') || p.includes('sunflower')) return 'సన్‌ఫ్లవర్ నూనె';
    if (p.includes('rice')) return 'బియ్యం బస్తా';
    if (p.includes('lux')) return 'లక్స్ సబ్బులు';
    if (p.includes('soap') || p.includes('lifebuoy')) return 'సబ్బులు';
    if (p.includes('milk')) return 'పాల ప్యాకెట్లు';
    if (p.includes('tea') || p.includes('chai')) return 'టీ పొడి';
    if (p.includes('salt')) return 'ఉప్పు ప్యాకెట్';
    if (p.includes('biscuit')) return 'బిస్కెట్లు';
  }
  if (lang === 'hi-IN') {
    if (p.includes('tube light')) return 'ट्यूब लाइट';
    if (p.includes('led') || p.includes('bulb')) return 'एलईडी बल्ब';
    if (p.includes('surf excel')) return 'सर्फ एक्सेल पैकेट';
    if (p.includes('oil')) return 'तेल पैकेट';
    if (p.includes('rice')) return 'चावल बोरी';
    if (p.includes('soap')) return 'साबुन';
    if (p.includes('milk')) return 'दूध';
    if (p.includes('tea') || p.includes('chai')) return 'चाय पत्ती';
    if (p.includes('salt')) return 'नमक';
    if (p.includes('biscuit')) return 'बिस्कुट';
  }
  return productName;
};

interface Shopkeeper24x7VoiceAssistantProps {
  shopId?: string;
}

export const Shopkeeper24x7VoiceAssistant: React.FC<Shopkeeper24x7VoiceAssistantProps> = ({
  shopId = 'shop-1',
}) => {
  const { language, t } = useLanguage();
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

  // Selected Speech recognition language (defaults to Telugu for local Kirana experience)
  const [voiceLang, setVoiceLang] = useState<'te-IN' | 'hi-IN' | 'en-IN'>(() => {
    try {
      const saved = localStorage.getItem('impulx_shopkeeper_voice_lang');
      if (saved === 'te-IN' || saved === 'hi-IN' || saved === 'en-IN') return saved;
    } catch {}
    // Default to Telugu for local Kirana shopkeeper
    return language === 'hi' ? 'hi-IN' : language === 'en' ? 'te-IN' : 'te-IN';
  });

  const recognitionRef = useRef<any>(null);
  const isRecognitionRunningRef = useRef<boolean>(false);
  const announcedOrderIdsRef = useRef<Set<string>>(new Set());
  const transcriptRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);
  const restartTimerRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);

  // Robust references to prevent race conditions on pause/mute
  const isVoiceActiveRef = useRef<boolean>(true);
  const isManuallyPausedRef = useRef<boolean>(false);

  // Persist voice language strictly for Voice Engine without altering navbar/sidebar UI language
  const handleSelectVoiceLang = (newLang: 'te-IN' | 'hi-IN' | 'en-IN') => {
    setVoiceLang(newLang);
    try {
      localStorage.setItem('impulx_shopkeeper_voice_lang', newLang);
    } catch {}
    // IMPORTANT: Do NOT call setLanguage()! Keeps sidebar language independent!

    const greeting =
      newLang === 'te-IN'
        ? 'తెలుగు వాయిస్ అసిస్టెంట్ ఆన్ అయ్యింది'
        : newLang === 'hi-IN'
        ? 'हिंदी वॉइस असिस्टेंट सक्रिय है'
        : 'English voice assistant activated';
    speakAI(greeting, undefined, newLang);
  };

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

  // Text-To-Speech with Dynamic Language Voice and Automatic 2-Way Resume
  const speakAI = (text: string, onEnd?: () => void, targetLangCode?: 'te-IN' | 'hi-IN' | 'en-IN') => {
    if (isSoundMuted || !('speechSynthesis' in window)) {
      onEnd?.();
      if (isVoiceActiveRef.current && !isManuallyPausedRef.current) {
        startListening();
      }
      return;
    }
    try {
      window.speechSynthesis.cancel();
      // Stop recognition while speaking so mic does not pick up its own voice
      if (recognitionRef.current && isRecognitionRunningRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        isRecognitionRunningRef.current = false;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = targetLangCode || voiceLang;
      utterance.lang = targetLang;
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      if (targetLang === 'te-IN') {
        const teluguVoice = voices.find(
          (v) => v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu')
        );
        if (teluguVoice) utterance.voice = teluguVoice;
      } else if (targetLang === 'hi-IN') {
        const hindiVoice = voices.find(
          (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
        );
        if (hindiVoice) utterance.voice = hindiVoice;
      }

      isSpeakingRef.current = true;
      setLastSpokenText(text);

      let isDone = false;
      const handleDone = () => {
        if (isDone) return;
        isDone = true;
        isSpeakingRef.current = false;
        onEnd?.();
        // Immediately resume listening for unbroken 2-way continuous talk
        if (isVoiceActiveRef.current && !isManuallyPausedRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isVoiceActiveRef.current && !isManuallyPausedRef.current && !isSpeakingRef.current) {
              startListening();
            }
          }, 200);
        }
      };

      utterance.onend = handleDone;
      utterance.onerror = handleDone;

      // Safety timer if browser speechSynthesis onend hangs
      const expectedMs = Math.max(2200, (text.length / 8) * 1000);
      setTimeout(handleDone, expectedMs);

      window.speechSynthesis.speak(utterance);
    } catch {
      isSpeakingRef.current = false;
      onEnd?.();
      if (isVoiceActiveRef.current && !isManuallyPausedRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          startListening();
        }, 200);
      }
    }
  };

  // Stop listening cleanly without reviving
  const stopListening = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    isRecognitionRunningRef.current = false;
    setIsListening(false);
  };

  // Start continuous speech recognition
  const startListening = () => {
    // If user has manually paused the mic, or AI is currently speaking, never start listening!
    if (!isVoiceActiveRef.current || isManuallyPausedRef.current || isSpeakingRef.current) {
      setIsListening(false);
      return;
    }

    if (isRecognitionRunningRef.current) {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      transcriptRef.current = '';
      setInterimTranscript('');

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        isRecognitionRunningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        // Ignore speech while AI itself is speaking
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

          // Fast debounce (650ms) to respond promptly
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptRef.current.trim().length > 1) {
              const textToSend = transcriptRef.current.trim();
              transcriptRef.current = '';
              setInterimTranscript('');
              handleProcessShopkeeperVoice(textToSend);
            }
          }, 650);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed') {
          isManuallyPausedRef.current = true;
          setIsListening(false);
          setAssistantStatus('Microphone access blocked');
        }
        isRecognitionRunningRef.current = false;
      };

      recognition.onend = () => {
        isRecognitionRunningRef.current = false;
        setIsListening(false);
        // Unbroken 24/7 continuous listening: always restart as long as mic is not manually paused!
        if (isVoiceActiveRef.current && !isManuallyPausedRef.current && !isSpeakingRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isVoiceActiveRef.current && !isManuallyPausedRef.current && !isSpeakingRef.current) {
              startListening();
            }
          }, 200);
        }
      };

      recognition.start();
      isRecognitionRunningRef.current = true;
      setIsListening(true);
    } catch {
      isRecognitionRunningRef.current = false;
      if (isVoiceActiveRef.current && !isManuallyPausedRef.current && !isSpeakingRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          startListening();
        }, 500);
      }
    }
  };

  // Toggle Mic Button: completely pauses and prevents reactivation
  const handleToggleMic = () => {
    if (isListening || isVoiceActive) {
      isVoiceActiveRef.current = false;
      isManuallyPausedRef.current = true;
      setIsVoiceActive(false);
      stopListening();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      isSpeakingRef.current = false;
      setAssistantStatus('Microphone paused manually (Mic Off)');
    } else {
      isVoiceActiveRef.current = true;
      isManuallyPausedRef.current = false;
      setIsVoiceActive(true);
      setAssistantStatus('24/7 AI Voice Monitoring Active');
      startListening();
    }
  };

  // Subscribe to storage orders
  useEffect(() => {
    const checkOrders = () => {
      const allOrders = storage.getOrders(shop.id);
      setOrders(allOrders);

      // Check for an actionable order (request_sent > shop_accepted > preparing > ready)
      const pendingOrder = allOrders.find(
        (o) =>
          o.status === 'request_sent' ||
          o.status === 'shop_accepted' ||
          o.status === 'preparing' ||
          o.status === 'ready'
      );

      if (pendingOrder) {
        setActiveVoiceOrder(pendingOrder);
        setIsDismissedManual(false);

        // If it's a new incoming order (request_sent) and hasn't been spoken yet
        if (pendingOrder.status === 'request_sent' && !announcedOrderIdsRef.current.has(pendingOrder.id)) {
          announcedOrderIdsRef.current.add(pendingOrder.id);
          playKiranaDoorbellChime();

          const spokenItemsSummary = pendingOrder.items
            .map((i) => {
              const spokenName = getSpokenProductName(i.productName, voiceLang);
              return `${i.quantity} ${spokenName}`;
            })
            .join(', ');

          const promptText =
            voiceLang === 'te-IN'
              ? `నమస్కారం అండి! ${pendingOrder.customerName} నుండి కొత్త ఆర్డర్ వచ్చింది. కావాల్సినవి: ${spokenItemsSummary}. మొత్తం ₹${pendingOrder.total}. మీ దగ్గర ఈ సరుకులు అందుబాటులో ఉన్నాయా? ఆర్డర్ అంగీకరిస్తారా?`
              : voiceLang === 'hi-IN'
              ? `नमस्ते जी! ${pendingOrder.customerName} से नया ऑर्डर आया है: ${spokenItemsSummary}। कुल राशि ₹${pendingOrder.total}। क्या यह सामान उपलब्ध है? क्या आप ऑर्डर स्वीकार करते हैं?`
              : `Hey! You got a new order from ${pendingOrder.customerName} for ${spokenItemsSummary}. Total ₹${pendingOrder.total}. Are these items available with you and ready to accept?`;

          setAssistantStatus(
            voiceLang === 'te-IN'
              ? 'కొత్త ఆర్డర్ వచ్చింది! మీ సమాధానం కోసం వింటున్నాను...'
              : voiceLang === 'hi-IN'
              ? 'नया ऑर्डर आया! आपके जवाब का इंतजार है...'
              : 'New order received! Waiting for your voice confirmation...'
          );

          // Speak prompt aloud, then start listening only if not manually paused
          speakAI(promptText, () => {
            if (isVoiceActiveRef.current && !isManuallyPausedRef.current) {
              startListening();
            }
          }, voiceLang);
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

  // Helper: Detect Dialect / Language of the spoken utterance
  const detectSpokenDialect = (
    text: string
  ): { langCode: 'te-IN' | 'hi-IN' | 'en-IN'; dialect: 'te' | 'tenglish' | 'hi' | 'hinglish' | 'en' } => {
    const lower = text.toLowerCase();

    const hasTeluguScript = /[\u0C00-\u0C7F]/.test(text);
    const hasHindiScript = /[\u0900-\u097F]/.test(text);

    const teluguKeywords = [
      'vachayi',
      'vachadu',
      'vachindu',
      'vachesadu',
      'unnayi',
      'unnaayi',
      'unnai',
      'undi',
      'vundi',
      'cheyi',
      'chestanu',
      'kavali',
      'pampinchanu',
      'pampina',
      'pampinchesa',
      'ayipoyindi',
      'aipoindi',
      'ayindi',
      'babu',
      'anna',
      'avunu',
      'sare',
      'ledu',
      'ivvu',
      'anta',
      'cheppandi',
      'pack chestanu',
      'na items',
      'items unnai',
      'nae gara',
      'na degara',
      'naa daggara',
      'daggara',
      'back cheshna',
      'pack cheshna',
      'back chesina',
      'pack chesina',
      'pak chesina',
      'bag chesna',
      'pack chesesa',
      'pack chesa',
      'chesina',
      'cheshna',
      'chesa',
      'ready undi',
      'ready ga undi',
      'delivery ready',
      'tayaru',
      'ichesanu',
      'icheshna',
      'icheyandi',
      'cherchu',
      'pettu',
      'teeseyi',
      'biyyam',
      'sabbulu',
      'noone',
      'tagginchu',
      'icharu',
      'eeroju',
      'ninna',
      'ammudu',
      'tarvatha',
      'dabbulu',
      'baaki',
    ];

    const hindiKeywords = [
      'karo',
      'kar do',
      'kar',
      'kardo',
      'kijiye',
      'accept karo',
      'order accept karo',
      'hai',
      'hain',
      'aaya',
      'aaye',
      'bhej',
      'bhejo',
      'diya',
      'de diya',
      'de do',
      'kar raha',
      'kar rahe',
      'ho gaya',
      'samaan',
      'theek',
      'nahin',
      'nahi',
      'bhai',
      'dost',
      'pack kar raha',
      'pack kar diya',
      'nikal gaya',
      'rakho',
      'daalo',
      'chahiye',
      'kitna',
      'kitne',
      'kya',
      'dikhao',
      'batao',
      'banao',
      'jodo',
      'hata do',
      'kam karo',
      'udhaar',
      'baad mein',
      'dega',
      'shukriya',
      'dhanyawad',
      'chawal',
      'doodh',
      'cheeni',
      'tel',
      'sabun',
      'chhoot',
    ];

    const englishKeywords = [
      'yes',
      'available',
      'accept',
      'pack',
      'packed',
      'partner',
      'delivery',
      'sent',
      'order',
      'minutes',
      'ready',
      'stock',
      'items',
      'waiting',
      'arrived',
      'shipped',
    ];

    const matchedTelugu = teluguKeywords.filter((k) => lower.includes(k)).length;
    const matchedHindi = hindiKeywords.filter((k) => lower.includes(k)).length;
    const matchedEnglish = englishKeywords.filter((k) => lower.includes(k)).length;

    if (hasTeluguScript || matchedTelugu > 0) {
      if (voiceLang !== 'te-IN') {
        setVoiceLang('te-IN');
        try {
          localStorage.setItem('impulx_shopkeeper_voice_lang', 'te-IN');
        } catch {}
      }
      return {
        langCode: 'te-IN',
        dialect: matchedEnglish > 0 ? 'tenglish' : 'te',
      };
    }

    if (hasHindiScript || matchedHindi > 0) {
      if (voiceLang !== 'hi-IN') {
        setVoiceLang('hi-IN');
        try {
          localStorage.setItem('impulx_shopkeeper_voice_lang', 'hi-IN');
        } catch {}
      }
      return {
        langCode: 'hi-IN',
        dialect: matchedEnglish > 0 ? 'hinglish' : 'hi',
      };
    }

    return {
      langCode: 'en-IN',
      dialect: 'en',
    };
  };

  // Process Shopkeeper Spoken Voice
  const handleProcessShopkeeperVoice = (spokenText: string) => {
    if (!spokenText || !spokenText.trim()) return;
    const lower = spokenText.toLowerCase();

    // 0. Manual pause / simulate by voice
    if (
      lower.includes('pause mic') ||
      lower.includes('stop listening') ||
      lower.includes('మైక్ ఆపు') ||
      lower.includes('ఆపు') ||
      lower.includes('వాయిస్ ఆపు') ||
      lower.includes('माइक बंद') ||
      lower.includes('माइक बंद करो')
    ) {
      handleToggleMic();
      return;
    }

    if (
      lower.includes('simulate order') ||
      lower.includes('new order') ||
      lower.includes('ఆర్డర్ పంపించు') ||
      lower.includes('కొత్త ఆర్డర్') ||
      lower.includes('నయా ఆర్డర్') ||
      lower.includes('नया ऑर्डर')
    ) {
      handleSimulateNewCustomerOrder();
      return;
    }

    const currentOrder = activeVoiceOrder;
    // Detect language of spoken response
    const detected = detectSpokenDialect(spokenText);

    // STAGE 4: DELIVERY PARTNER ARRIVED / SHIPPED / SENT
    // Understands: "shipped", "sent the order", "delivery partner arrived pampinchanu", "bhej diya", "de diya", etc.
    const isShipped =
      // English & Romanized Hinglish / Tenglish
      lower.includes('delivery partner has arrived') ||
      lower.includes('partner has arrived') ||
      lower.includes('delivery partner arrived') ||
      lower.includes('delivery boy arrived') ||
      lower.includes('sent the order') ||
      lower.includes('sent') ||
      lower.includes('shipped') ||
      lower.includes('bhej diya') ||
      lower.includes('bheja') ||
      lower.includes('bhejdiya') ||
      lower.includes('de diya') ||
      lower.includes('dediya') ||
      lower.includes('nikal gaya') ||
      lower.includes('delivery partner ko de diya') ||
      lower.includes('delivery boy ko de diya') ||
      lower.includes('out for delivery') ||
      lower.includes('on the way') ||
      lower.includes('icheshna') ||
      lower.includes('pampina') ||
      lower.includes('pampinchanu') ||
      lower.includes('vachadu') ||
      lower.includes('vachesadu') ||
      lower.includes('vachindu') ||
      // Devanagari Hindi Script
      lower.includes('भेज दिया') ||
      lower.includes('दे दिया') ||
      lower.includes('डिलीवरी पार्टनर आ गया') ||
      lower.includes('डिलीवरी बॉय आ गया') ||
      lower.includes('रवाना हो गया') ||
      lower.includes('निकल गया') ||
      // Telugu Script
      lower.includes('డెలివరీ బాయ్ వచ్చాడు') ||
      lower.includes('డెలివరీ పార్టనర్ వచ్చాడు') ||
      lower.includes('పంపించేశాను') ||
      lower.includes('పంపించాను') ||
      lower.includes('ఇచ్చేశాను') ||
      lower.includes('ఇచ్చాను') ||
      lower.includes('ఆర్డర్ పంపించాను') ||
      lower.includes('రవాణా') ||
      lower.includes('బయలుదేరింది') ||
      lower.includes('డిస్పాచ్');

    // STAGE 3: ORDER READY / PACKED & WAITING FOR PARTNER
    // Understands: "order ready", "ready hai", "ready undi", "pack ho gaya", "ప్యాకింగ్ అయిపోయింది", "back cheshna", etc.
    const isOrderReady =
      // English & Romanized Hinglish / Tenglish
      lower.includes('it has been packed') ||
      lower.includes('already packed') ||
      lower.includes('packed and ready') ||
      lower.includes('order ready') ||
      lower.includes('ready hai') ||
      lower.includes('ready undi') ||
      lower.includes('ready ga undi') ||
      lower.includes('delivery ready') ||
      lower.includes('pack ho gaya') ||
      lower.includes('packing ho gayi') ||
      lower.includes('pack kar diya') ||
      lower.includes('pack aipoindi') ||
      lower.includes('pack ayipoyindi') ||
      lower.includes('back cheshna') ||
      lower.includes('pack cheshna') ||
      lower.includes('back chesina') ||
      lower.includes('pack chesina') ||
      lower.includes('pak chesina') ||
      lower.includes('bag chesna') ||
      lower.includes('pack chesesa') ||
      lower.includes('pack chesa') ||
      lower.includes('waiting for delivery') ||
      lower.includes('waiting for partner') ||
      lower.includes('ready for delivery') ||
      lower.includes('ready') ||
      // Devanagari Hindi Script
      lower.includes('पैक हो गया') ||
      lower.includes('पैकिंग हो गई') ||
      lower.includes('पैक कर दिया') ||
      lower.includes('ऑर्डर तैयार है') ||
      lower.includes('तैयार है') ||
      lower.includes('रेडी है') ||
      lower.includes('रेडी') ||
      // Telugu Script
      lower.includes('ప్యాకింగ్ అయిపోయింది') ||
      lower.includes('ప్యాక్ చేసేశాను') ||
      lower.includes('ప్యాక్ చేశాను') ||
      lower.includes('ప్యాక్ అయిపోయింది') ||
      lower.includes('ఆర్డర్ రెడీ') ||
      lower.includes('రెడీగా ఉంది') ||
      lower.includes('రెడీ ఉంది') ||
      lower.includes('డెలివరీ కోసం రెడీ');

    // STAGE 2: PACKING IN PROGRESS
    // Understands: "packing the order", "pack chestunna", "pack kar raha hoon", "ప్యాకింగ్ చేస్తున్నాను"
    const isPackingOrder =
      // English & Romanized Hinglish / Tenglish
      lower.includes('packing the order') ||
      lower.includes('packing order') ||
      lower.includes('pack chestunna') ||
      lower.includes('packing chestunna') ||
      lower.includes('pack chestanu') ||
      lower.includes('pack kar raha') ||
      lower.includes('pack kar rahe') ||
      lower.includes('packing kar raha') ||
      lower.includes('pack karo') ||
      lower.includes('packing shuru') ||
      lower.includes('start packing') ||
      lower.includes('packing') ||
      lower.includes('pack') ||
      // Devanagari Hindi Script
      lower.includes('पैक कर रहा हूँ') ||
      lower.includes('पैक कर रहा') ||
      lower.includes('पैक कर रहे') ||
      lower.includes('पैकिंग शुरू') ||
      lower.includes('पैकिंग') ||
      lower.includes('पैक करो') ||
      lower.includes('पैक') ||
      // Telugu Script
      lower.includes('ప్యాకింగ్ చేస్తున్నాను') ||
      lower.includes('ప్యాకింగ్ చేస్తున్నా') ||
      lower.includes('ప్యాక్ చేస్తున్నాను') ||
      lower.includes('ప్యాక్ చేస్తున్నా') ||
      lower.includes('ప్యాకింగ్ మొదలైంది') ||
      lower.includes('ప్యాకింగ్ ప్రారంభించాను') ||
      lower.includes('ప్యాక్ చేస్తాను') ||
      lower.includes('ప్యాకింగ్') ||
      lower.includes('ప్యాక్');

    // STAGE 1: ORDER ACCEPTANCE
    // Understands: "order accept karo", "accept karo", "karo", "order ni accept chey", "yes accept", "ऑर्डर एक्सेप्ट करो", etc.
    const isAcceptOrder =
      // English & Romanized Hinglish / Tenglish
      lower.includes('order accept karo') ||
      lower.includes('order accept') ||
      lower.includes('accept karo') ||
      lower.includes('accept kar do') ||
      lower.includes('accept kardo') ||
      lower.includes('accept kijiye') ||
      lower.includes('accept order') ||
      lower.includes('order ni accept chey') ||
      lower.includes('order accept chey') ||
      lower.includes('order accept cheyyi') ||
      lower.includes('accept the order') ||
      lower.includes('yes accept') ||
      lower.includes('haan accept karo') ||
      lower.includes('ha accept karo') ||
      lower.includes('ha accept') ||
      lower.includes('accept kar lo') ||
      lower.includes('accept') ||
      lower.includes('karo') ||
      lower.includes('kar do') ||
      lower.includes('kardo') ||
      lower.includes('le lo') ||
      lower.includes('available') ||
      lower.includes('in stock') ||
      lower.includes('stock hai') ||
      lower.includes('samaan hai') ||
      lower.includes('items unnai') ||
      lower.includes('confirm karo') ||
      lower.includes('confirm') ||
      lower.includes('theek hai') ||
      lower.includes('yes') ||
      lower.includes('ok') ||
      lower.includes('okay') ||
      lower.includes('sare') ||
      lower.includes('avunu') ||
      lower.includes('chey') ||
      lower.includes('cheyyi') ||
      // Devanagari Hindi Script (phonetic output from Chrome speech-to-text)
      lower.includes('एक्सेप्ट') ||
      lower.includes('ऑर्डर एक्सेप्ट') ||
      lower.includes('एक्सेप्ट करो') ||
      lower.includes('स्वीकार') ||
      lower.includes('ऑर्डर स्वीकार') ||
      lower.includes('करो') ||
      lower.includes('कर दो') ||
      lower.includes('करदो') ||
      lower.includes('ले लो') ||
      lower.includes('सामान है') ||
      lower.includes('उपलब्ध है') ||
      lower.includes('हाँ') ||
      lower.includes('हाँजी') ||
      lower.includes('हाँ जी') ||
      lower.includes('कन्फर्म') ||
      lower.includes('ठीक है') ||
      // Telugu Script (phonetic output from Chrome speech-to-text)
      lower.includes('ఆర్డర్ ని యాక్సెప్ట్ చెయ్') ||
      lower.includes('ఆర్డర్ యాక్సెప్ట్ చేయి') ||
      lower.includes('ఆర్డర్ యాక్సెప్ట్ చెయ్యి') ||
      lower.includes('ఆర్డర్ యాక్సెప్ట్ కరో') ||
      lower.includes('ఆర్డర్ ఎక్సెప్ట్ కరో') ||
      lower.includes('ఆర్డర్ యాక్సెప్ట్') ||
      lower.includes('ఆర్డర్ ఎక్సెప్ట్') ||
      lower.includes('ఆర్డర్ ని యాక్సెప్ట్') ||
      lower.includes('యాక్సెప్ట్ చెయ్') ||
      lower.includes('యాక్సెప్ట్ చేయండి') ||
      lower.includes('యాక్సెప్ట్ కరో') ||
      lower.includes('ఎక్సెప్ట్ కరో') ||
      lower.includes('యాక్సెప్ట్') ||
      lower.includes('ఆక్సెప్ట్') ||
      lower.includes('ఎక్సెప్ట్') ||
      lower.includes('అంగీకరించు') ||
      lower.includes('ఆర్డర్ తీసుకో') ||
      lower.includes('తీసుకో') ||
      lower.includes('సరుకులు ఉన్నాయి') ||
      lower.includes('సామాన్ ఉంది') ||
      lower.includes('సరుకు ఉంది') ||
      lower.includes('ఉన్నాయి') ||
      lower.includes('సరే') ||
      lower.includes('అవును') ||
      lower.includes('హా') ||
      lower.includes('కరో') ||
      lower.includes('కన్ఫర్మ్') ||
      lower.includes('ఓకే');

    // REJECTION
    const isReject =
      lower.includes('not available') ||
      lower.includes('reject') ||
      lower.includes('cancel') ||
      lower.includes('no stock') ||
      lower.includes('సరుకు లేదు') ||
      lower.includes('వద్దు') ||
      lower.includes('రద్దు') ||
      lower.includes('సామాన్ లేదు') ||
      lower.includes('सामान नहीं है') ||
      lower.includes('रद्द') ||
      lower.includes('रद्द करो') ||
      lower.includes('कैंसिल');

    // EXECUTE LIFECYCLE PROGRESSION (When active order is awaiting actions):
    if (currentOrder) {
      // 1. STAGE 4: Handed to Delivery Partner -> Shipped
      if (isShipped && (currentOrder.status === 'ready' || currentOrder.status === 'preparing' || currentOrder.status === 'shop_accepted' || currentOrder.status === 'request_sent')) {
        stopListening();
        const statusNote = 'Delivery partner has picked up — on the way for delivery! 🛵';
        storage.updateOrderStatus(
          currentOrder.id,
          'out_for_delivery',
          'On the way for delivery! 🛵',
          statusNote,
          { speaker: 'shopkeeper', text: spokenText }
        );

        let aiReply = '';
        if (detected.dialect === 'te') {
          aiReply = 'చాలా మంచిది! ఆర్డర్ డెలివరీ పార్టనర్‌తో బయలుదేరిందని కస్టమర్ పోర్టల్‌లో లైవ్ ట్రాకింగ్ అప్‌డేట్ చేసేశాను. ధన్యవాదాలు! 🛵';
        } else if (detected.dialect === 'tenglish') {
          aiReply = 'Super! Order dispatch ayindi ani customer ki update pampam. Live tracking modal lo kanipistundi! 🛵';
        } else if (detected.dialect === 'hi' || detected.dialect === 'hinglish') {
          aiReply = 'बहुत बढ़िया! ऑर्डर सफलतापूर्वक डिलीवरी पार्टनर को सौंप दिया गया है। ग्राहक को लाइव ट्रैकिंग दिख रही है। 🛵';
        } else {
          aiReply = 'Order dispatched with delivery partner! Customer notified that delivery is on the way! 🛵';
        }

        setAssistantStatus('Order dispatched for delivery 🛵');
        speakAI(aiReply, undefined, detected.langCode);
        return;
      }

      // 2. STAGE 3: Items Packed & Ready for Partner
      if (isOrderReady) {
        if (currentOrder.status === 'preparing' || currentOrder.status === 'shop_accepted' || currentOrder.status === 'request_sent') {
          stopListening();
          const statusNote = 'Items have been packed and are ready for delivery, waiting for delivery partner.';
          storage.updateOrderStatus(
            currentOrder.id,
            'ready',
            'Packed & ready, waiting for delivery partner',
            statusNote,
            { speaker: 'shopkeeper', text: spokenText }
          );

          let aiReply = '';
          if (detected.dialect === 'te') {
            aiReply = 'ఆర్డర్ ప్యాక్ అయింది, డెలివరీ పార్టనర్ కోసం సిద్ధంగా ఉందని కస్టమర్‌కి అప్‌డేట్ చేశాను. డెలివరీ బాయ్ రాగానే సరుకులు ఇచ్చి "ఆర్డర్ పంపించాను" అని చెప్పండి.';
          } else if (detected.dialect === 'tenglish') {
            aiReply = 'Items pack ayipoyayi ani customer portal lo update chesam. Delivery boy ravagane handover chesi "shipped" or "pampinchanu" ani cheppandi.';
          } else if (detected.dialect === 'hi' || detected.dialect === 'hinglish') {
            aiReply = 'सामान पैक हो चुका है और डिलीवरी पार्टनर के लिए तैयार है, ग्राहक को सूचना दे दी गई है। डिलीवरी बॉय को देने के बाद कहें "सामान भेज दिया"।';
          } else {
            aiReply = 'Got it! Updated customer portal: Items are packed and ready for delivery partner pickup.';
          }

          setAssistantStatus('Items packed. Waiting for delivery partner...');
          speakAI(aiReply, undefined, detected.langCode);
          return;
        } else if (currentOrder.status === 'ready') {
          stopListening();
          let aiReply = '';
          if (detected.dialect === 'te' || detected.dialect === 'tenglish') {
            aiReply = 'ఆర్డర్ ఇప్పటికే ప్యాక్ అయ్యి సిద్ధంగా ఉంది. డెలివరీ బాయ్ తీసుకెళ్లాక "ఆర్డర్ పంపించాను" అని చెప్పండి.';
          } else if (detected.dialect === 'hi' || detected.dialect === 'hinglish') {
            aiReply = 'ऑर्डर पहले ही पैक होकर तैयार है। डिलीवरी बॉय को देने के बाद बोलें "सामान भेज दिया"।';
          } else {
            aiReply = 'Order is already packed and waiting for delivery partner. When handed over, say "Shipped".';
          }
          setAssistantStatus('Items packed. Ready for delivery partner...');
          speakAI(aiReply, undefined, detected.langCode);
          return;
        }
      }

      // 3. STAGE 2: Packaging Order in Progress
      if (isPackingOrder) {
        if (currentOrder.status === 'shop_accepted' || currentOrder.status === 'request_sent') {
          stopListening();
          const statusNote = 'Store is packing the items (Estimated 5 mins).';
          storage.updateOrderStatus(
            currentOrder.id,
            'preparing',
            'Items being packed (5 mins)',
            statusNote,
            { speaker: 'shopkeeper', text: spokenText }
          );

          let aiReply = '';
          if (detected.dialect === 'te') {
            aiReply = 'సరేనండి! సరుకులు ప్యాక్ అవుతున్నట్లు కస్టమర్ పోర్టల్‌లో అప్‌డేట్ చేసేశాను. ప్యాకింగ్ పూర్తయ్యాక "ఆర్డర్ రెడీగా ఉంది" అని చెప్పండి.';
          } else if (detected.dialect === 'tenglish') {
            aiReply = 'Items pack chestunnaru ani customer portal lo update ayindi. Packing avvagane "order ready" ani cheppandi.';
          } else if (detected.dialect === 'hi' || detected.dialect === 'hinglish') {
            aiReply = 'सामान पैक हो रहा है, मैंने ग्राहक को अपडेट कर दिया है। पैकिंग पूरी होने पर कहें "ऑर्डर तैयार है"।';
          } else {
            aiReply = 'Got it! Updated customer portal that items are being packed. When finished, say "Order ready".';
          }

          setAssistantStatus('Packaging in progress (5 mins)...');
          speakAI(aiReply, undefined, detected.langCode);
          return;
        } else if (currentOrder.status === 'preparing') {
          stopListening();
          let aiReply = '';
          if (detected.dialect === 'te' || detected.dialect === 'tenglish') {
            aiReply = 'సరుకులు ప్రస్తుతం ప్యాకింగ్ లో ఉన్నాయి. పూర్తయ్యాక "ఆర్డర్ రెడీగా ఉంది" అని చెప్పండి.';
          } else if (detected.dialect === 'hi' || detected.dialect === 'hinglish') {
            aiReply = 'हाँ जी, सामान की पैकिंग चल रही है। पैकिंग पूरी होने पर बोलें "ऑर्डर तैयार है"।';
          } else {
            aiReply = 'Packaging is currently in progress. When done, say "Order ready".';
          }
          setAssistantStatus('Packaging in progress (5 mins)...');
          speakAI(aiReply, undefined, detected.langCode);
          return;
        }
      }

      // 4. STAGE 1: Order Acceptance ("order accept karo", "accept karo", "ఆర్డర్ యాక్సెప్ట్ కరో")
      if (isAcceptOrder) {
        if (currentOrder.status === 'request_sent') {
          stopListening();
          const statusNote = 'Store accepted the order and confirmed items in stock.';
          storage.updateOrderStatus(
            currentOrder.id,
            'shop_accepted',
            'Order accepted (In Stock)',
            statusNote,
            { speaker: 'shopkeeper', text: spokenText }
          );

          let aiReply = '';
          if (detected.dialect === 'te') {
            aiReply = 'సరేనండి! ఆర్డర్ యాక్సెప్ట్ చేశాను. కస్టమర్‌కి సమాచారం పంపాను. మీరు సరుకులు ప్యాక్ చేయడం ప్రారంభించాక "ప్యాకింగ్ చేస్తున్నాను" అని చెప్పండి.';
          } else if (detected.dialect === 'tenglish') {
            aiReply = 'Order accept chesam! Customer ki update pampam. Pack chestunnappudu "packing the order" or "pack chestunna" ani cheppandi.';
          } else if (detected.dialect === 'hi' || detected.dialect === 'hinglish') {
            aiReply = 'हाँ जी! ऑर्डर स्वीकार कर लिया गया है। ग्राहक को सूचना भेज दी गई है। सामान पैक करना शुरू करने पर कहें "पैक कर रहा हूँ"।';
          } else {
            aiReply = 'Order accepted! Customer notified. When you start packing, say "Packing the order".';
          }

          setAssistantStatus('Order accepted. Waiting for packing confirmation...');
          speakAI(aiReply, undefined, detected.langCode);
          return;
        } else if (currentOrder.status === 'shop_accepted') {
          // If shopkeeper repeats "order accept karo" while already accepted, NEVER ask what to do!
          stopListening();
          let aiReply = '';
          if (detected.dialect === 'te' || detected.dialect === 'tenglish') {
            aiReply = 'ఆర్డర్ ఇప్పటికే యాక్సెప్ట్ చేయబడింది! మీరు సరుకులు ప్యాక్ చేయడం మొదలుపెట్టాక "ప్యాకింగ్ చేస్తున్నాను" అని చెప్పండి.';
          } else if (detected.dialect === 'hi' || detected.dialect === 'hinglish') {
            aiReply = 'हाँ जी! ऑर्डर पहले ही स्वीकार हो चुका है। आप सामान पैक करना शुरू करने पर बोलें "पैक कर रहा हूँ"।';
          } else {
            aiReply = 'Order is already accepted! When you begin packing the items, say "Packing the order".';
          }
          setAssistantStatus('Order already accepted. Ready for packing...');
          speakAI(aiReply, undefined, detected.langCode);
          return;
        } else if (currentOrder.status === 'preparing') {
          stopListening();
          let aiReply = '';
          if (detected.dialect === 'te' || detected.dialect === 'tenglish') {
            aiReply = 'ఆర్డర్ యాక్సెప్ట్ అయ్యి సరుకులు ప్యాక్ అవుతున్నాయి. ప్యాకింగ్ పూర్తయ్యాక "ఆర్డర్ రెడీగా ఉంది" అని చెప్పండి.';
          } else if (detected.dialect === 'hi' || detected.dialect === 'hinglish') {
            aiReply = 'ऑर्डर स्वीकार हो चुका है और सामान पैक हो रहा है। पूरा होने पर कहें "ऑर्डर तैयार है"।';
          } else {
            aiReply = 'Order is accepted and items are being packed. Say "Order ready" when packed.';
          }
          setAssistantStatus('Order accepted. Packaging in progress...');
          speakAI(aiReply, undefined, detected.langCode);
          return;
        }
      }

      // REJECTION
      if (isReject && (currentOrder.status === 'request_sent' || currentOrder.status === 'shop_accepted')) {
        stopListening();
        storage.updateOrderStatus(
          currentOrder.id,
          'rejected',
          'Cancelled: Items out of stock',
          'Store has no stock for requested items',
          { speaker: 'shopkeeper', text: spokenText }
        );
        const aiReply =
          detected.dialect === 'te' || detected.dialect === 'tenglish'
            ? 'ఆర్డర్ తిరస్కరించబడింది. కస్టమర్‌కి సమాచారం పంపాను.'
            : detected.dialect === 'hi' || detected.dialect === 'hinglish'
            ? 'ऑर्डर रद्द कर दिया गया है।'
            : 'Order rejected. Customer notified.';
        speakAI(aiReply, undefined, detected.langCode);
        return;
      }
    }

    // Multilingual Shopkeeper Intent Engine (Trained on AI General Store Dataset v1.0 - 33 intents!)
    const result = aiService.handleMultilingualShopkeeperIntent(spokenText, shop.id, voiceLang);

    if (result.switchLang) {
      setVoiceLang(result.switchLang);
      try {
        localStorage.setItem('impulx_shopkeeper_voice_lang', result.switchLang);
      } catch {}
    }

    setAssistantStatus(result.reply.substring(0, 75));
    speakAI(result.reply, undefined, result.targetLangCode);
  };

  const handleSimulateNewCustomerOrder = () => {
    storage.simulateIncomingCustomerOrder(shop.id);
  };

  const handleManualAction = (action: 'accept' | 'packing' | 'packed' | 'sent') => {
    if (!activeVoiceOrder) return;
    if (action === 'accept') {
      handleProcessShopkeeperVoice('Order ni accept chey');
    } else if (action === 'packing') {
      handleProcessShopkeeperVoice('Packing the order pack chestunna');
    } else if (action === 'packed') {
      handleProcessShopkeeperVoice('Order ready undi packed');
    } else if (action === 'sent') {
      handleProcessShopkeeperVoice('Delivery partner arrived shipped pampinchanu');
    }
  };

  const activeCount = orders.filter(
    (o) =>
      o.status === 'request_sent' ||
      o.status === 'shop_accepted' ||
      o.status === 'preparing' ||
      o.status === 'ready'
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
                <span>impulx.ai 24/7 Voice Dispatcher</span>
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

        {/* Controls: Voice Language, Sound, Mic Pause/Resume, & Simulate Order */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Language Dropdown */}
          <div className="relative inline-flex items-center">
            <Globe className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 pointer-events-none" />
            <select
              value={voiceLang}
              onChange={(e) => handleSelectVoiceLang(e.target.value as any)}
              className="appearance-none bg-slate-800 text-white text-xs font-bold pl-8 pr-7 py-1.5 rounded-xl border border-slate-700 hover:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-sm"
              title="Change 24/7 AI Speech Language"
            >
              <option value="te-IN">తెలుగు (Telugu & Tenglish)</option>
              <option value="hi-IN">हिंदी (Hindi & Hinglish)</option>
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

          {/* Mic Pause / Resume Toggle */}
          <button
            onClick={handleToggleMic}
            className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition ${
              isListening
                ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-md shadow-red-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isListening ? 'Click to Pause Mic' : 'Click to Resume Mic'}
          >
            {isListening ? (
              <>
                <Mic className="w-4 h-4 text-white" />
                <span>Pause Mic</span>
              </>
            ) : (
              <>
                <MicOff className="w-4 h-4 text-slate-400" />
                <span>Resume Mic</span>
              </>
            )}
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

          {/* Ordered items chips with localized language support */}
          <div className="py-3 flex flex-wrap gap-2 border-b border-slate-100">
            {activeVoiceOrder.items.map((it, idx) => {
              const localizedTitle = getLocalizedProductName(it.productName, voiceLang);
              const localizedUnit =
                voiceLang === 'te-IN'
                  ? it.unit === 'piece' ? 'పీసులు' : it.unit === 'packet' ? 'ప్యాకెట్' : it.unit || 'యూనిట్లు'
                  : voiceLang === 'hi-IN'
                  ? it.unit === 'piece' ? 'पीस' : it.unit === 'packet' ? 'पैकेट' : it.unit || 'यूनिट'
                  : `${it.quantity > 1 && it.unit === 'piece' ? 'pieces' : it.unit || 'units'}`;

              return (
                <span
                  key={idx}
                  className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm"
                >
                  {localizedTitle} × {it.quantity} {localizedUnit} (₹{it.totalPrice})
                </span>
              );
            })}
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
                    ? 'impulx.ai లైవ్ వాయిస్ గైడెన్స్ (చెప్పండి):'
                    : voiceLang === 'hi-IN'
                    ? 'impulx.ai लाइव वॉइस मार्गदर्शन (बोलें):'
                    : 'impulx.ai Live Voice Guidance (Just speak):'}
                </span>
              </div>

              {isListening ? (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <Mic className="w-3.5 h-3.5" /> Listening for shopkeeper...
                </span>
              ) : (
                <span className="text-[11px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MicOff className="w-3.5 h-3.5" /> Mic Paused
                </span>
              )}
            </div>

            {/* WHAT TO SAY INSTRUCTIONS FOR EVERY STEP */}
            <div className="text-xs font-medium text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
              {activeVoiceOrder.status === 'request_sent' && (
                <div>
                  <div className="font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="text-emerald-700 text-sm">🗣️</span>
                    <span>
                      {voiceLang === 'te-IN'
                        ? 'ఆర్డర్ అంగీకరించడానికి ఇలా చెప్పండి (తెలుగు, Tenglish లేదా English):'
                        : voiceLang === 'hi-IN'
                        ? 'ऑर्डर स्वीकारने के लिए ऐसे बोलें (हिंदी, Hinglish या English):'
                        : 'To accept, speak naturally in Telugu, Hindi, or English:'}
                    </span>
                  </div>
                  <p className="text-emerald-950 font-bold text-sm bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                    "{voiceLang === 'te-IN'
                      ? 'ఆర్డర్ ని యాక్సెప్ట్ చెయ్ (or: Yes accept, order ni accept chey)'
                      : voiceLang === 'hi-IN'
                      ? 'ऑर्डर स्वीकार करो (or: Yes accept, सामान उपलब्ध है)'
                      : 'Order ni accept chey / Yes accept / In stock'}"
                  </p>
                </div>
              )}

              {activeVoiceOrder.status === 'shop_accepted' && (
                <div>
                  <div className="font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                    <span className="text-emerald-700 text-sm">🗣️</span>
                    <span>
                      {voiceLang === 'te-IN'
                        ? 'ఆర్డర్ యాక్సెప్ట్ అయ్యింది! ప్యాకింగ్ మొదలుపెట్టాక ఇలా చెప్పండి:'
                        : voiceLang === 'hi-IN'
                        ? 'ऑर्डर स्वीकार हो गया! पैकिंग शुरू करने पर ऐसे बोलें:'
                        : 'Order accepted! When you begin packing, say:'}
                    </span>
                  </div>
                  <p className="text-emerald-950 font-bold text-sm bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                    "{voiceLang === 'te-IN'
                      ? 'ప్యాకింగ్ చేస్తున్నాను (or: Packing the order, pack chestunna)'
                      : voiceLang === 'hi-IN'
                      ? 'सामान पैक कर रहा हूँ (or: Packing the order)'
                      : 'Packing the order / pack chestunna'}"
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
                      ? 'ఆర్డర్ రెడీగా ఉంది (or: Order ready, ready undi, packed)'
                      : voiceLang === 'hi-IN'
                      ? 'सामान पैक हो गया है (or: Order ready, ready hai)'
                      : 'Order ready / Pack ayipoyindi / Ready for partner'}"
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
                      ? 'డెలివరీ బాయ్ వచ్చాడు, ఆర్డర్ పంపించేశాను (or: Delivery partner arrived, shipped)'
                      : voiceLang === 'hi-IN'
                      ? 'डिलीवरी पार्टनर आ गया, सामान भेज दिया है (or: Delivery partner arrived, shipped)'
                      : 'Delivery partner has arrived and I have sent the order, shipped'}"
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

            {/* Tap button fallbacks for convenience across all 4 stages */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400">Or Tap:</span>
              {activeVoiceOrder.status === 'request_sent' && (
                <button
                  onClick={() => handleManualAction('accept')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{voiceLang === 'te-IN' ? 'ఆర్డర్ యాక్సెప్ట్ (Accept)' : 'Accept Order (In Stock)'}</span>
                </button>
              )}
              {activeVoiceOrder.status === 'shop_accepted' && (
                <button
                  onClick={() => handleManualAction('packing')}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{voiceLang === 'te-IN' ? 'ప్యాకింగ్ ప్రారంభించు (Start Packing)' : 'Start Packing (5 mins)'}</span>
                </button>
              )}
              {activeVoiceOrder.status === 'preparing' && (
                <button
                  onClick={() => handleManualAction('packed')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>{voiceLang === 'te-IN' ? 'ప్యాక్ అయింది (Mark Packed)' : 'Mark Packed (Waiting for Partner)'}</span>
                </button>
              )}
              {activeVoiceOrder.status === 'ready' && (
                <button
                  onClick={() => handleManualAction('sent')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{voiceLang === 'te-IN' ? 'డెలివరీకి పంపించాను (Sent to Partner)' : 'Handed to Delivery Partner (Out for Delivery)'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
