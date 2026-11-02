import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Check,
  Edit2,
  CheckCircle2,
  Volume2,
  VolumeX,
  AlertCircle,
  Globe,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { storage } from '../../services/storageService';
import { AIMessage } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const ShopAIAssistant: React.FC = () => {
  const shop = storage.getShopById('shop-1') || storage.getShops()[0];
  const { t, language } = useLanguage();

  const getInitialMessage = () => {
    if (language === 'te') {
      return 'నమస్కారం! మీ దుకాణంలో ఏం జరిగిందో మైక్ లో చెప్పండి లేదా ఇక్కడ రాయండి — కొత్త సరుకులు రావడం, కస్టమర్ల ఖాతా ఉధార్, లేదా ఖర్చులు నేరుగా సేవ్ అవుతాయి.\n\nవాయిస్ ద్వారానే "సేవ్ చేయి" లేదా "ఖరారు చేయి" అని చెప్పి నిర్ధారించవచ్చు!';
    }
    if (language === 'hi') {
      return 'नमस्ते! दुकान में जो हुआ बोलकर बताएं या लिखें — नया माल आना, उधारी बिक्री (खाता) या रोज़ का खर्चा सीधे दर्ज हो जाएगा।\n\nआवाज से "कन्फर्म" या "सेव करो" बोलकर हाथों के बिना भी रिकॉर्ड सेव कर सकते हैं!';
    }
    return 'Namaste! Tell me what happened in your shop in English, Telugu, or Hindi — stock arrival, Khata credit sale, or expenses.\n\nYou can even say "Confirm" or "Save" hands-free to commit records!';
  };

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: getInitialMessage(),
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // REAL VOICE STATES & REFS
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<'te-IN' | 'hi-IN' | 'en-IN'>(
    language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'
  );
  const [isSpeakingTts, setIsSpeakingTts] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);

  useEffect(() => {
    setSelectedVoiceLang(language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN');
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, interimTranscript]);

  // Clean up speech recognition & synthesis on unmount
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

  const samplePrompts = [
    {
      lang: 'తెలుగు (సరుకు & సేవ్)',
      text: '10 సబ్బులు వచ్చాయి సేవ్ చేయి',
    },
    {
      lang: 'తెలుగు (ఖాతా ఉధార్)',
      text: 'రమేష్ కి 3 సబ్బులు 120 రూపాయలు',
    },
    {
      lang: 'हिंदी (नया सामान)',
      text: '10 साबुन, 5 तेल पैकेट आए सेव करो',
    },
    {
      lang: 'हिंदी (दुकान खर्चा)',
      text: 'बिजली का बिल 450 रुपये दिया',
    },
    {
      lang: 'English (Stock Restock)',
      text: '10 soaps, 5 oil packets, 3 tube lights',
    },
  ];

  const executeStorageRecord = (structuredData: any) => {
    const { type, payload } = structuredData;

    if (type === 'inventory_add') {
      const existing = storage.getInventory(shop.id);
      payload.items.forEach((newItem: any) => {
        const found = existing.find((inv) =>
          inv.productName.toLowerCase().includes(newItem.productName.toLowerCase())
        );
        if (found) {
          storage.adjustStock(found.id, newItem.quantity);
        } else {
          storage.addInventoryItem({
            shopId: shop.id,
            productName: newItem.productName,
            category: 'Groceries',
            price: newItem.price,
            quantity: newItem.quantity,
            unit: newItem.unit,
            minStockLevel: 5,
            status: 'in_stock',
          });
        }
      });
    } else if (type === 'credit_sale') {
      storage.addKhataTransaction({
        shopId: payload.shopId,
        customerId: payload.customerId,
        customerName: payload.customerName,
        date: 'Today',
        itemDescription: payload.itemDescription,
        debit: payload.debit,
        credit: 0,
        previousBalance: payload.previousBalance,
        remainingBalance: payload.remainingBalance,
        notes: payload.notes,
      });
    } else if (type === 'expense') {
      storage.addExpense({
        shopId: payload.shopId,
        date: payload.date,
        category: payload.category,
        amount: payload.amount,
        notes: payload.notes,
      });
    }
  };

  const handleConfirmRecord = (msgId: string, structuredData: any) => {
    executeStorageRecord(structuredData);

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.structuredConfirmation) {
          return {
            ...m,
            structuredConfirmation: {
              ...m.structuredConfirmation,
              status: 'confirmed',
            },
          };
        }
        return m;
      })
    );

    const successVoice =
      language === 'te'
        ? 'విజయవంతంగా సేవ్ చేయబడింది!'
        : language === 'hi'
        ? 'सफलतापूर्वक सुरक्षित हो गया!'
        : 'Successfully saved!';
    speakUtterance(successVoice);
  };

  const handleSend = (textToSend?: string) => {
    const raw = (textToSend || input).trim();
    if (!raw) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: raw,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setInterimTranscript('');
    transcriptRef.current = '';
    setIsProcessing(true);

    // 1. Hands-Free Voice Confirmation Command
    const isConfirmVoice = /^(confirm|save|yes|okay|ok|proceed|సరే|సేవ్\s*చేయి|సేవ్|ఖరారు\s*చేయి|ఖరారు|చేసేయి|అవును|హా|हाँ|सेव\s*करो|सेव|कन्फर्म|ठीक\s*है|दर्ज\s*करो)$/i.test(raw);
    const isCancelVoice = /^(cancel|discard|no|stop|రద్దు\s*చేయి|రద్దు|వద్దు|కాన్సిల్|रद्द\s*करो|रद्द|नहीं|कैंसिल)$/i.test(raw);

    const pendingMsg = [...messages].reverse().find(
      (m) => m.structuredConfirmation && m.structuredConfirmation.status === 'pending'
    );

    if (isConfirmVoice && pendingMsg) {
      setTimeout(() => {
        setIsProcessing(false);
        handleConfirmRecord(pendingMsg.id, pendingMsg.structuredConfirmation);
      }, 300);
      return;
    }

    if (isCancelVoice && pendingMsg) {
      setTimeout(() => {
        setIsProcessing(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingMsg.id && m.structuredConfirmation
              ? { ...m, structuredConfirmation: { ...m.structuredConfirmation, status: 'cancelled' } }
              : m
          )
        );
        const cancelReply =
          language === 'te'
            ? 'రద్దు చేయబడింది.'
            : language === 'hi'
            ? 'रद्द कर दिया गया।'
            : 'Pending action cancelled.';
        const cancelAiMsg: AIMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: cancelReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, cancelAiMsg]);
        speakUtterance(cancelReply);
      }, 300);
      return;
    }

    setTimeout(() => {
      const parsed = aiService.parseShopkeeperInput(raw, shop.id);

      // Auto-commit if user spoke "save" / "confirm" in the utterance
      const lowerRaw = raw.toLowerCase();
      const shouldAutoConfirm =
        lowerRaw.includes('save') ||
        lowerRaw.includes('confirm') ||
        raw.includes('సేవ్') ||
        raw.includes('ఖరారు') ||
        raw.includes('सेव') ||
        raw.includes('दर्ज');

      if (shouldAutoConfirm && parsed.structuredData && parsed.structuredData.status === 'pending') {
        executeStorageRecord(parsed.structuredData);
        parsed.structuredData.status = 'confirmed';
        parsed.reply +=
          language === 'te'
            ? ' (వాయిస్ కమాండ్ ద్వారా వెంటనే సేవ్ చేయబడింది!)'
            : language === 'hi'
            ? ' (वॉइस कमांड द्वारा तुरंत दर्ज कर लिया गया!)'
            : ' (Automatically saved via Voice Command!)';
      }

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: parsed.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredConfirmation: parsed.structuredData,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsProcessing(false);

      // Spoken voice feedback
      speakUtterance(parsed.reply);
    }, 350);
  };

  // Web Speech API Voice Recognition with Continuous Mode & Auto-commit
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        language === 'te'
          ? 'మీ బ్రౌజర్ లో వాయిస్ సపోర్ట్ లేదు. దయచేసి Google Chrome లేదా Microsoft Edge వాడండి.'
          : language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस सपोर्ट नहीं है। कृपया Google Chrome या Edge का उपयोग करें।'
          : 'Voice input is not supported in this browser. Please use Google Chrome or Edge.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      transcriptRef.current = '';
      setInterimTranscript('');

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedVoiceLang;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
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
          setInput(currentText);

          // Reset silence timer: when shopkeeper pauses for 900ms, auto-commit
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptRef.current.trim().length > 1) {
              const toSend = transcriptRef.current.trim();
              stopListening();
              handleSend(toSend);
            }
          }, 950);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setIsListening(false);
          setSpeechError(
            language === 'te'
              ? 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. బ్రౌజర్ లో మైక్ పర్మిషన్ ఆన్ చేయండి.'
              : language === 'hi'
              ? 'माइक्रोफ़ोन अनुमति नहीं मिली। कृपया ब्राउज़र में अनुमति दें।'
              : 'Microphone permission denied. Please allow microphone access in your browser.'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error(err);
      setIsListening(false);
      setSpeechError('Microphone could not be started.');
    }
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

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      if (transcriptRef.current.trim()) {
        handleSend(transcriptRef.current.trim());
      }
    } else {
      startListening();
    }
  };

  // Text to Speech
  const speakUtterance = (textToSpeak: string, msgId?: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = selectedVoiceLang;
      utterance.rate = 0.95;

      if (msgId) {
        setIsSpeakingTts(msgId);
        utterance.onend = () => setIsSpeakingTts(null);
        utterance.onerror = () => setIsSpeakingTts(null);
      }
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const handleToggleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingTts === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeakingTts(null);
    } else {
      speakUtterance(text, msgId);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 px-2 sm:px-0">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">{t('voiceEntryTitle')}</h1>
            <p className="text-xs text-slate-500">{t('voiceEntrySubtitle')}</p>
          </div>
        </div>

        {/* Voice Input Language Dropdown */}
        <div className="relative inline-flex items-center">
          <Globe className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 pointer-events-none" />
          <select
            id="voice-lang-select"
            value={selectedVoiceLang}
            onChange={(e) => setSelectedVoiceLang(e.target.value as 'te-IN' | 'hi-IN' | 'en-IN')}
            className="appearance-none bg-slate-100 hover:bg-slate-200/80 text-slate-900 text-xs font-bold pl-8 pr-7 py-2 rounded-2xl border border-slate-200 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition shadow-sm"
            aria-label="Select Voice Recognition Language"
          >
            <option value="te-IN">తెలుగు (Telugu)</option>
            <option value="hi-IN">हिंदी (Hindi)</option>
            <option value="en-IN">English (EN)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
        </div>
      </div>

      {/* SAMPLE CHIPS */}
      <div className="bg-white p-3 sm:p-3.5 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-none">
        <span className="text-[11px] text-slate-400 font-bold block mb-2">
          {language === 'te'
            ? 'నమూనాను నొక్కి లేదా మైక్ లో చెప్పి పరీక్షించండి (చేతుల్లేకుండా వాయిస్ ద్వారానే ఆర్డర్ / సేవ్):'
            : language === 'hi'
            ? 'नमूना वाक्य क्लिक करें या बोलें (वॉइस से ही ऑटो-कन्फर्म करें):'
            : 'Tap sample or speak naturally (Voice-only add, save & confirm):'}
        </span>
        <div className="flex gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text)}
              className="px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 text-left transition shrink-0"
            >
              <div className="text-[10px] font-bold text-emerald-800">{p.lang}</div>
              <div className="text-xs font-bold text-slate-900">"{p.text}"</div>
            </button>
          ))}
        </div>
      </div>

      {/* Speech error notification */}
      {speechError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-xs font-bold underline ml-2 text-red-900 hover:text-red-950"
          >
            {language === 'te' ? 'మూసివేయి' : language === 'hi' ? 'बंद करें' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* CHAT THREAD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[56vh] min-h-[420px] max-h-[620px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-3xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-sm font-semibold'
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm font-medium'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="whitespace-pre-line flex-1">{msg.text}</p>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => handleToggleSpeak(msg.id, msg.text)}
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition shrink-0"
                      title={isSpeakingTts === msg.id ? 'Stop audio' : 'Listen aloud'}
                    >
                      {isSpeakingTts === msg.id ? (
                        <VolumeX className="w-4 h-4 text-emerald-600 animate-pulse" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Structured confirmation card */}
                {msg.structuredConfirmation && (
                  <div className="mt-3 p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-slate-800">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 gap-2">
                      <span className="font-extrabold text-xs text-slate-900 uppercase">
                        {msg.structuredConfirmation.title}
                      </span>
                      {msg.structuredConfirmation.status === 'confirmed' ? (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t('savedSuccess')}
                        </span>
                      ) : msg.structuredConfirmation.status === 'cancelled' ? (
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full shrink-0">
                          {language === 'te' ? 'రద్దు చేయబడింది' : language === 'hi' ? 'रद्द' : 'Cancelled'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                          {language === 'te'
                            ? 'వాయిస్ ద్వారా "సేవ్ చేయి" లేదా నొక్కండి'
                            : language === 'hi'
                            ? 'बोलें "सेव करो" या क्लिक करें'
                            : 'Say "Save" or click confirm'}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {msg.structuredConfirmation.fields.map((f: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-slate-700 gap-2">
                          <span className="text-slate-500 font-medium shrink-0">{f.label}:</span>
                          <span className="font-black text-slate-900 text-right break-words">{f.value}</span>
                        </div>
                      ))}
                    </div>

                    {msg.structuredConfirmation.status === 'pending' ? (
                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 border-t border-slate-200">
                        <button
                          onClick={() => handleConfirmRecord(msg.id, msg.structuredConfirmation)}
                          className="w-full sm:flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('confirmRecord')}</span>
                        </button>
                        <button
                          onClick={() => setInput(`Edit: ${msg.structuredConfirmation?.title}`)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
                        >
                          {t('editRecord')}
                        </button>
                      </div>
                    ) : msg.structuredConfirmation.status === 'cancelled' ? (
                      <div className="pt-1.5 text-[11px] text-slate-500 font-bold flex items-center gap-1">
                        <span>{language === 'te' ? 'ఈ రికార్డు రద్దు చేయబడింది' : language === 'hi' ? 'यह रिकॉर्ड रद्द किया गया' : 'Record cancelled'}</span>
                      </div>
                    ) : (
                      <div className="pt-1.5 text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('savedSuccess')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {/* Real-time interim voice recognition feedback */}
          {isListening && (
            <div className="flex flex-col items-start space-y-1 animate-pulse">
              <div className="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-2xl max-w-[85%] text-xs text-emerald-950 font-bold flex items-center gap-2 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
                <span>
                  {interimTranscript
                    ? `"${interimTranscript}..."`
                    : language === 'te'
                    ? 'చెప్పండి, వింటున్నాము... ("సేవ్ చేయి" అని కూడా అనవచ్చు)'
                    : language === 'hi'
                    ? 'बोलिए, सुन रहे हैं... ("सेव करो" भी बोल सकते हैं)'
                    : 'Listening... Speak now (You can also say "Save" / "Confirm")'}
                </span>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="text-xs text-slate-500 bg-white p-3 rounded-2xl w-fit border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              <span>
                {language === 'te'
                  ? 'లెక్క చూస్తున్నాము...'
                  : language === 'hi'
                  ? 'विवरण दर्ज कर रहे हैं...'
                  : 'Processing statement...'}
              </span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar with Real Voice Toggle Button */}
        <div className="p-3 bg-white border-t border-slate-200 space-y-2">
          {/* Active Listening indicator pill */}
          {isListening && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-xs font-bold animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <span>
                  {language === 'te'
                    ? 'వాయిస్ లైవ్: మాట్లాడిన వెంటనే ఆటో-ఎంట్రీ అవుతుంది'
                    : language === 'hi'
                    ? 'वॉइस लाइव: बोलते ही तुरंत एंट्री हो जाएगी'
                    : 'Hands-Free Voice Active: Auto-commits on speech'}
                </span>
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="text-[11px] bg-emerald-700 text-white px-2 py-0.5 rounded-lg hover:bg-emerald-800"
              >
                {language === 'te' ? 'ఆపండి' : language === 'hi' ? 'रोकें' : 'Stop'}
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === 'te'
                  ? 'మైక్ నొక్కి మాట్లాడండి లేదా ఇక్కడ టైప్ చేయండి...'
                  : language === 'hi'
                  ? 'माइक दबाकर बोलें या यहाँ लिखें...'
                  : 'Tap mic to speak or type here...'
              }
              className="flex-1 min-w-0 bg-slate-100 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
            />

            {/* REAL MIC TOGGLE BUTTON */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 sm:p-3 rounded-2xl transition-all shrink-0 flex items-center justify-center ${
                isListening
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/30 scale-105 animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
              }`}
              title={
                isListening
                  ? 'Stop listening'
                  : language === 'te'
                  ? 'మైక్ లో చెప్పండి'
                  : language === 'hi'
                  ? 'माइक दबाएं'
                  : 'Speak now'
              }
            >
              {isListening ? (
                <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-800" />
              )}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <span className="hidden sm:inline">{t('findButton')}</span>
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};