import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Bot,
  FileDown,
  Volume2,
  VolumeX,
  Sparkles,
  Settings,
  HelpCircle,
  AlertCircle,
  Database,
  ArrowRight,
  TrendingUp,
  Package,
  BookOpen,
  DollarSign,
  Key,
  Check,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { manaAiService, ManaAIMessage, ManaAIConfig } from '../../services/manaAiService';
import { storage } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';

export const ManaAiPage: React.FC = () => {
  const shop = storage.getShopById('shop-1') || storage.getShops()[0];
  const { t, language, setLanguage } = useLanguage();

  const getWelcomeMessage = (lang: 'en' | 'te' | 'hi' = language): ManaAIMessage => ({
    id: 'welcome-1',
    sender: 'assistant',
    text:
      lang === 'te'
        ? `నమస్కారం! నేను మీ దుకాణం వ్యక్తిగత సలహాదారు **Mana-AI** (మన-AI).
మీ దుకాణం లైవ్ డేటా (సరుకుల నిల్వ, నిన్నటి/నేటి అమ్మకాలు, కస్టమర్ల ఖాతా ఉధార్) నాతో అనుసంధానించబడి ఉంది.

మీరు నన్ను ఏమైనా అడగవచ్చు:
• *"నిన్న ఏ సరుకులు వచ్చాయి లేదా ఏవి అయిపోతున్నాయి? నాకు PDF నివేదిక కావాలి."*
• *"రమేష్ కుమార్ ఈ నెల ఎంత ఖర్చు చేశాడు? స్టేట్‌మెంట్ PDF ఇవ్వు."*
• *"నిన్నటి అమ్మకాలు మరియు ఖర్చుల పూర్తి PDF తయారు చేయి."*`
        : lang === 'hi'
        ? `नमस्ते! मैं आपकी दुकान का **Mana-AI** (हमारा-AI) बिजनेस सलाहकार हूँ।
आपकी दुकान का लाइव स्टॉक, कल और आज की बिक्री, और ग्राहकों का खाता बही मेरे पास उपलब्ध है।

आप मुझसे कुछ भी पूछ सकते हैं:
• *"कल कौन सा सामान आया या कौन सा स्टॉक कम है? मुझे PDF रिपोर्ट दो।"*
• *"रमेश कुमार का इस महीने का खर्च कितना है? स्टेटमेंट PDF दो।"*
• *"कल की बिक्री और खर्च का पूरा PDF हिसाब दो।"*`
        : `Namaste! I am **Mana-AI**, your Generative Business Advisor & PDF Engine.
Connected to **${shop.name}** live database (Inventory, yesterday/today sales, customer ledgers, and orders).

Ask me anything about your shop:
• *"What all stock arrived yesterday or is running low? Give me a PDF."*
• *"How much has Ramesh Kumar ordered this month? I need a PDF statement."*
• *"Show yesterday's sales and operating expenses with a PDF report."*`,
    timestamp: 'Just now',
    actionCard: {
      type: 'pdf_download',
      title:
        lang === 'te'
          ? 'స్టోర్ ఆడిట్ & స్టాక్ PDF'
          : lang === 'hi'
          ? 'दुकान का स्टॉक ऑडिट PDF'
          : 'Store Performance & Stock Audit PDF',
      description:
        lang === 'te'
          ? 'ప్రస్తుత సరుకుల నిల్వ మరియు అమ్మకాల పూర్తి నివేదిక'
          : lang === 'hi'
          ? 'दुकान के वर्तमान स्टॉक और बिक्री की समीक्षा'
          : 'Instant overview of current inventory and sales health',
      buttonLabel:
        lang === 'te'
          ? 'స్టాక్ ఆడిట్ PDF డౌన్‌లోడ్'
          : lang === 'hi'
          ? 'स्टॉक ऑडिट PDF डाउनलोड'
          : 'Download Sample PDF Audit',
      pdfAction: 'stock_audit',
      pdfPayload: {
        inventory: storage.getInventory(shop.id),
        shop,
        title: `${shop.name} Stock Audit & Restock Report`,
        options: {
          periodSubtitle: 'Yesterday (31 Oct 2026) & Today (1 Nov 2026)',
        },
      },
    },
  });

  const [messages, setMessages] = useState<ManaAIMessage[]>([getWelcomeMessage(language)]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [config, setConfig] = useState<ManaAIConfig>(manaAiService.getConfig());
  const [savedConfigNotice, setSavedConfigNotice] = useState(false);

  // Speech Recognition & TTS State
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<'te-IN' | 'hi-IN' | 'en-IN'>(
    language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'
  );
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);

  const transcriptRef = useRef<string>('');
  const hasSubmittedRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (newLang: 'en' | 'te' | 'hi') => {
    setLanguage(newLang);
    setSelectedVoiceLang(newLang === 'te' ? 'te-IN' : newLang === 'hi' ? 'hi-IN' : 'en-IN');
    if (messages.length <= 1) {
      setMessages([getWelcomeMessage(newLang)]);
    }
  };

  useEffect(() => {
    setSelectedVoiceLang(language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN');
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, interimTranscript]);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
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

  const handleConfirmAction = (msgId: string, structuredData: any) => {
    storage.executeStructuredAction(structuredData, shop.id);

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.actionCard?.structuredData) {
          return {
            ...m,
            actionCard: {
              ...m.actionCard,
              structuredData: {
                ...m.actionCard.structuredData,
                status: 'confirmed',
              },
            },
          };
        }
        return m;
      })
    );

    const successVoice =
      language === 'te'
        ? 'విజయవంతంగా రికార్డులలో సేవ్ చేయబడింది!'
        : language === 'hi'
        ? 'सफलतापूर्वक सुरक्षित कर लिया गया!'
        : 'Successfully saved to store records!';

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(successVoice);
        u.lang = selectedVoiceLang;
        window.speechSynthesis.speak(u);
      } catch {}
    }
  };

  const handleCancelAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.actionCard?.structuredData) {
          return {
            ...m,
            actionCard: {
              ...m.actionCard,
              structuredData: {
                ...m.actionCard.structuredData,
                status: 'cancelled',
              },
            },
          };
        }
        return m;
      })
    );
  };

  const handleSend = async (textToSend?: string) => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    transcriptRef.current = '';
    hasSubmittedRef.current = true;

    const raw = (textToSend || input).trim();
    if (!raw) return;

    const userMsg: ManaAIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: raw,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setInterimTranscript('');
    setIsProcessing(true);

    // Hands-Free Confirmation Voice Command Check
    const isConfirmVoice = /^(confirm|save|yes|okay|ok|proceed|సరే|సేవ్\s*చేయి|సేవ్|ఖరారు\s*చేయి|ఖరారు|చేసేయి|అవును|హా|हाँ|सेव\s*करो|सेव|कन्फर्म|ठीक\s*है|दर्ज\s*करో)$/i.test(raw);
    const isCancelVoice = /^(cancel|discard|no|stop|రద్దు\s*చేయి|రద్దు|వద్దు|కాన్సిల్|रद्द\s*करो|रद्द|नहीं|कैंसिल)$/i.test(raw);

    const pendingMsg = [...messages].reverse().find(
      (m) => m.actionCard?.type === 'structured_action' && m.actionCard?.structuredData?.status === 'pending'
    );

    if (isConfirmVoice && pendingMsg) {
      setTimeout(() => {
        setIsProcessing(false);
        handleConfirmAction(pendingMsg.id, pendingMsg.actionCard?.structuredData);
      }, 300);
      return;
    }

    if (isCancelVoice && pendingMsg) {
      setTimeout(() => {
        setIsProcessing(false);
        handleCancelAction(pendingMsg.id);
        const cancelReply =
          language === 'te'
            ? 'రద్దు చేయబడింది.'
            : language === 'hi'
            ? 'रद्द कर दिया गया।'
            : 'Pending action cancelled.';
        const cancelAiMsg: ManaAIMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: cancelReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, cancelAiMsg]);
      }, 300);
      return;
    }

    try {
      const response = await manaAiService.askShopkeeperCopilot(raw, shop.id, language);
      setMessages((prev) => [...prev, response]);

      // Automatically speak the response text if user interacted by voice
      if (response && response.text && ('speechSynthesis' in window)) {
        try {
          window.speechSynthesis.cancel();
          const cleanText = response.text.replace(/[*#•-]/g, '').substring(0, 180);
          const u = new SpeechSynthesisUtterance(cleanText);
          u.lang = selectedVoiceLang;
          window.speechSynthesis.speak(u);
        } catch {}
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text:
            language === 'te'
              ? 'AI బ్రెయిన్ కనెక్ట్ కావడంలో సమస్య వచ్చింది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
              : language === 'hi'
              ? 'AI से संपर्क करने में समस्या आई। कृपया पुनः प्रयास करें।'
              : 'I ran into an issue connecting to the AI brain. Please try again or ask with different wording.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Commit Speech Handler (Called when pause detected, final event fired, or user clicks Stop/Send)
  const commitSpeech = (forcedText?: string) => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (hasSubmittedRef.current) return;

    const toSend = (forcedText || transcriptRef.current || input).trim();
    if (!toSend) {
      setIsListening(false);
      return;
    }

    hasSubmittedRef.current = true;
    setIsListening(false);
    setInterimTranscript('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    handleSend(toSend);
  };

  // Web Speech API Voice Recognition
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        language === 'te'
          ? 'మీ బ్రౌజర్ లో వాయిస్ సపోర్ట్ లేదు. దయచేసి Google Chrome లేదా Edge వాడండి.'
          : language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस सपोर्ट नहीं है। कृपया Google Chrome उपयोग करें।'
          : 'Voice input requires Google Chrome or Microsoft Edge.'
      );
      return;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    transcriptRef.current = '';
    hasSubmittedRef.current = false;
    setInterimTranscript('');
    setSpeechError(null);

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedVoiceLang;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        let hasFinalResult = false;

        for (let i = 0; i < event.results.length; ++i) {
          const part = event.results[i][0].transcript;
          fullTranscript += part;
          if (event.results[i].isFinal) {
            hasFinalResult = true;
          }
        }

        const trimmed = fullTranscript.trim();
        if (trimmed) {
          transcriptRef.current = trimmed;
          setInterimTranscript(trimmed);
          setInput(trimmed); // Real-time feedback into input box!
        }

        // Auto-commit timer after natural pause in speech
        if (trimmed) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(
            () => {
              commitSpeech();
            },
            hasFinalResult ? 900 : 1800
          );
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setIsListening(false);
          setSpeechError(
            language === 'te'
              ? 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. బ్రౌజర్ లో మైక్ పర్మిషన్ Allow చేయండి.'
              : language === 'hi'
              ? 'माइक्रोफ़ोन अनुमति नहीं मिली। कृपया ब्राउज़र में अनुमति दें।'
              : 'Microphone permission denied. Please allow microphone access in your browser.'
          );
        } else if (event.error === 'no-speech') {
          if (!transcriptRef.current && !input) {
            setIsListening(false);
            setSpeechError(
              language === 'te'
                ? 'ఏమీ వినబడలేదు. దయచేసి మైక్ దగ్గర స్పష్టంగా మాట్లాడండి.'
                : language === 'hi'
                ? 'कोई आवाज़ सुनाई नहीं दी। कृपया माइक के पास साफ़ बोलें।'
                : 'No speech detected. Please speak clearly into your microphone.'
            );
          }
        } else if (event.error !== 'aborted') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcriptRef.current && !hasSubmittedRef.current) {
          commitSpeech();
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (transcriptRef.current && !hasSubmittedRef.current) {
      commitSpeech();
    }
  };

  // Text-To-Speech (TTS)
  const toggleTTS = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#•-]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = selectedVoiceLang;
      utterance.rate = 0.95;
      setIsSpeakingId(msgId);
      utterance.onend = () => setIsSpeakingId(null);
      utterance.onerror = () => setIsSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveConfig = () => {
    manaAiService.saveConfig(config);
    setSavedConfigNotice(true);
    setTimeout(() => {
      setSavedConfigNotice(false);
      setShowConfigModal(false);
    }, 1000);
  };

  const samplePrompts = [
    {
      category:
        language === 'te'
          ? 'సరుకులు చేర్చండి (వాయిస్)'
          : language === 'hi'
          ? 'सामान जोड़ें (आवाज)'
          : 'Stock Add (Voice)',
      icon: Package,
      textEn: '8 soaps, chai, order lo stock lo, add to the inventory',
      textTe: '8 soaps, chai, stock lo add cheyi',
      textHi: '8 साबुन और चाय पत्ती स्टॉक में जोड़ो',
    },
    {
      category:
        language === 'te'
          ? 'సేల్స్ & PDF రిపోర్ట్'
          : language === 'hi'
          ? 'बिक्री और PDF रिपोर्ट'
          : 'Sales & PDF Report',
      icon: DollarSign,
      textEn: 'How much sales happened yesterday and today? Give me a PDF.',
      textTe: 'ఎంత సేల్స్ అయింది పిడిఎఫ్ కావాలి',
      textHi: 'कल और आज की कितनी बिक्री हुई? मुझे PDF चाहिए',
    },
    {
      category:
        language === 'te'
          ? 'కస్టమర్ ఖాతా రాయండి'
          : language === 'hi'
          ? 'ग्राहक खाता एंट्री'
          : 'Khata Credit Entry',
      icon: BookOpen,
      textEn: 'Ramesh ki 3 soaps 120 rupees khata record',
      textTe: 'రమేష్ కి 3 సబ్బులు 120 రూపాయలు ఖాతా',
      textHi: 'रमेश को 3 साबुन 120 रुपये खाता में लिखो',
    },
    {
      category:
        language === 'te'
          ? 'స్టాక్ ఆడిట్ PDF'
          : language === 'hi'
          ? 'स्टॉक ऑडिट PDF'
          : 'Stock Audit PDF',
      icon: TrendingUp,
      textEn: 'Stock PDF of yesterday and today',
      textTe: 'నిన్నటి మరియు నేటి స్టాక్ PDF ఇవ్వు',
      textHi: 'कल और आज का स्टॉक ऑडिट PDF दो',
    },
  ];

  const getPromptText = (p: (typeof samplePrompts)[0]) => {
    if (language === 'te') return p.textTe;
    if (language === 'hi') return p.textHi;
    return p.textEn;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Banner with Language Dropdown at Top Right */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 rounded-3xl shadow-md border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Mana-AI</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                {language === 'te' ? 'మన బిజినెస్ AI' : language === 'hi' ? 'हमारा बिजनेस AI' : 'Business Copilot'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {language === 'te'
                ? 'స్టాక్, కస్టమర్ల బాకీ, సేల్స్ గురించి అడగండి & క్షణాల్లో PDF రిపోర్ట్ పొందండి.'
                : language === 'hi'
                ? 'स्टॉक, ग्राहकों के उधार, बिक्री की जानकारी पूछें और तुरंत PDF रिपोर्ट पाएं।'
                : 'Ask questions about stock, customers, or sales & generate instant PDF reports.'}
            </p>
          </div>
        </div>

        {/* Action Controls & Top-Right Language Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap sm:flex-nowrap">
          {/* Language Dropdown Inside Card */}
          <div className="relative inline-flex items-center">
            <Globe className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 pointer-events-none" />
            <select
              id="mana-ai-lang-select"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'te' | 'hi')}
              className="appearance-none bg-slate-800/95 hover:bg-slate-700/90 text-white text-xs font-bold pl-8 pr-7 py-2 rounded-xl border border-slate-700 hover:border-emerald-500/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition shadow-sm"
              title="Select AI Language"
            >
              <option value="en" className="bg-slate-900 text-white">English (EN)</option>
              <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
              <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-semibold">
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-none">{shop.name} (Live DB)</span>
          </div>

          <button
            onClick={() => setShowConfigModal(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition shrink-0"
            title="AI Model & API Key Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QUICK SUGGESTED PROMPTS */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          {language === 'te'
            ? 'ఇలా అడగండి (క్లిక్ చేయండి):'
            : language === 'hi'
            ? 'सुझावित प्रश्न (क्लिक करें):'
            : 'Suggested Questions (Tap to ask):'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {samplePrompts.map((p, idx) => {
            const Icon = p.icon;
            const promptText = getPromptText(p);
            return (
              <button
                key={idx}
                onClick={() => handleSend(promptText)}
                className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      {p.category}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-950 truncate">
                      "{promptText}"
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-1" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Speech Error Banner */}
      {speechError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button onClick={() => setSpeechError(null)} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* CHAT CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-sm font-semibold'
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm font-medium'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="whitespace-pre-line flex-1 space-y-1">
                    {msg.text}
                  </div>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => toggleTTS(msg.id, msg.text)}
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition shrink-0"
                      title={isSpeakingId === msg.id ? 'Stop audio' : 'Listen aloud'}
                    >
                      {isSpeakingId === msg.id ? (
                        <VolumeX className="w-4 h-4 text-emerald-600 animate-pulse" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* STRUCTURED ACTION CARD (Merged Voice Entry) */}
                {msg.actionCard && msg.actionCard.type === 'structured_action' && msg.actionCard.structuredData && (
                  <div className="mt-3.5 p-3.5 sm:p-4 bg-slate-50 border-2 border-emerald-500/40 rounded-2xl shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${
                            msg.actionCard.structuredData.type === 'inventory_add'
                              ? 'bg-emerald-600'
                              : msg.actionCard.structuredData.type === 'credit_sale'
                              ? 'bg-indigo-600'
                              : 'bg-amber-600'
                          }`}
                        >
                          {msg.actionCard.structuredData.type === 'inventory_add' ? (
                            <Package className="w-4 h-4" />
                          ) : msg.actionCard.structuredData.type === 'credit_sale' ? (
                            <BookOpen className="w-4 h-4" />
                          ) : (
                            <DollarSign className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 block">
                            {msg.actionCard.structuredData.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                            {msg.actionCard.structuredData.type === 'inventory_add'
                              ? (language === 'te' ? 'సరుకుల నిల్వ మార్పు' : language === 'hi' ? 'स्टॉक जोड़ें' : 'Inventory Restock')
                              : msg.actionCard.structuredData.type === 'credit_sale'
                              ? (language === 'te' ? 'కస్టమర్ ఖాతా ఉధార్' : language === 'hi' ? 'खाता उधारी' : 'Customer Khata Credit')
                              : (language === 'te' ? 'దుకాణ ఖర్చు' : language === 'hi' ? 'दुकान खर्च' : 'Store Expense')}
                          </span>
                        </div>
                      </div>

                      {msg.actionCard.structuredData.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          {language === 'te' ? 'సేవ్ అయ్యింది' : language === 'hi' ? 'सुरक्षित' : 'Saved'}
                        </span>
                      ) : msg.actionCard.structuredData.status === 'cancelled' ? (
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full shrink-0">
                          {language === 'te' ? 'రద్దు చేయబడింది' : language === 'hi' ? 'रद्द' : 'Cancelled'}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full animate-pulse shrink-0">
                          {language === 'te' ? 'ఖరారు కోసం సిద్ధం' : language === 'hi' ? 'पुष्टि शेष' : 'Pending Confirmation'}
                        </span>
                      )}
                    </div>

                    {/* Fields Summary */}
                    <div className="bg-white rounded-xl p-2.5 border border-slate-200 space-y-1.5 text-xs">
                      {msg.actionCard.structuredData.fields?.map((f: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center py-0.5">
                          <span className="text-slate-600 font-medium">{f.label}:</span>
                          <span className="font-bold text-slate-900">{f.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Interactive Action Buttons */}
                    {msg.actionCard.structuredData.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleConfirmAction(msg.id, msg.actionCard?.structuredData)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {msg.actionCard.buttonLabel ||
                              (language === 'te' ? 'సేవ్ చేయండి' : language === 'hi' ? 'सुरक्षित करें' : 'Confirm & Save')}
                          </span>
                        </button>
                        <button
                          onClick={() => handleCancelAction(msg.id)}
                          className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition"
                        >
                          {language === 'te' ? 'రద్దు' : language === 'hi' ? 'रद्द' : 'Cancel'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* INTERACTIVE PDF ACTION CARD */}
                {msg.actionCard && msg.actionCard.type === 'pdf_download' && (
                  <div className="mt-3.5 p-3.5 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <FileDown className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">
                          {msg.actionCard.title}
                        </span>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {msg.actionCard.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (msg.actionCard?.pdfAction && msg.actionCard?.pdfPayload) {
                          manaAiService.executePDFDownload(
                            msg.actionCard.pdfAction,
                            msg.actionCard.pdfPayload
                          );
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm shrink-0"
                    >
                      <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{msg.actionCard.buttonLabel}</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {/* Real-time speech transcript feedback */}
          {isListening && (
            <div className="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-2xl max-w-[85%] text-xs text-emerald-950 font-bold flex items-center gap-2 animate-pulse shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
              <span>
                {interimTranscript
                  ? `"${interimTranscript}..."`
                  : language === 'te'
                  ? 'చెప్పండి, వింటున్నాము...'
                  : 'Listening... Speak your question now'}
              </span>
            </div>
          )}

          {isProcessing && (
            <div className="text-xs text-slate-500 bg-white p-3 rounded-2xl w-fit border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              <span>Mana-AI is analyzing store data and preparing report...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT BAR */}
        <div className="p-3 bg-white border-t border-slate-200 space-y-2">
          {/* Active Recording Banner with Live Spoken Words */}
          {isListening && (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                <div className="truncate">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span>
                      {language === 'te'
                        ? 'వింటోంది... మాట్లాడండి'
                        : language === 'hi'
                        ? 'सुन रहा हूँ... बोलिए'
                        : 'Listening... Speak now'}
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-extrabold uppercase">
                      {selectedVoiceLang}
                    </span>
                  </div>
                  {interimTranscript && (
                    <p className="text-xs font-semibold text-emerald-800 truncate mt-0.5">
                      "{interimTranscript}"
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => commitSpeech()}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold shadow-sm transition flex items-center gap-1"
                >
                  <span>{language === 'te' ? 'పంపు' : language === 'hi' ? 'भेजें' : 'Send'}</span>
                  <Send className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                    setIsListening(false);
                    transcriptRef.current = '';
                    setInput('');
                    setInterimTranscript('');
                    if (recognitionRef.current) {
                      try {
                        recognitionRef.current.abort();
                      } catch {}
                    }
                  }}
                  className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1.5 rounded-xl font-semibold transition"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
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
                  ? 'Mana-AI ని అడగండి (ఉదా: "నిన్నటి అమ్మకాల వివరాలు చూపి PDF రాయి")...'
                  : language === 'hi'
                  ? 'Mana-AI से पूछें (जैसे: "कल और आज की बिक्री का PDF दो" या "स्टॉक रिपोर्ट")...'
                  : 'Ask Mana-AI (e.g. "What stock is low? Give me a PDF" or "How much did Ramesh spend?")...'
              }
              className="flex-1 min-w-0 bg-slate-100 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
            />

            {/* Voice Language Dropdown */}
            <div className="relative hidden sm:inline-flex items-center">
              <Globe className="w-3 h-3 text-emerald-600 absolute left-2 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'te' | 'hi')}
                className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold pl-6 pr-6 py-2 rounded-xl border border-slate-200 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition shadow-sm"
                aria-label="Select Voice Language"
              >
                <option value="te">తెలుగు (TE)</option>
                <option value="hi">हिंदी (HI)</option>
                <option value="en">English (EN)</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
            </div>

            {/* MIC BUTTON */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-2.5 sm:p-3 rounded-2xl transition shrink-0 ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-md'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
              }`}
              title="Voice Prompt"
            >
              {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* SEND BUTTON */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2.5 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <span className="hidden sm:inline">Ask AI</span>
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* MODEL / API CONFIGURATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Mana-AI Brain Settings</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Choose AI Intelligence Engine:
              </label>

              {/* Engine 1: Mana-AI Smart Deterministic (Default) */}
              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                  config.provider === 'local_smart'
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  value="local_smart"
                  checked={config.provider === 'local_smart'}
                  onChange={() => setConfig({ ...config, provider: 'local_smart' })}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    ⚡ Mana-AI Smart Brain (Recommended)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    100% Free, Zero-latency, works offline with live store data and instant PDF generators.
                  </p>
                </div>
              </label>

              {/* Engine 2: Google Gemini API */}
              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                  config.provider === 'gemini'
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  value="gemini"
                  checked={config.provider === 'gemini'}
                  onChange={() => setConfig({ ...config, provider: 'gemini' })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="font-bold text-xs text-slate-900 block">
                    🚀 Google Gemini 1.5 Flash (Cloud LLM)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5 mb-2">
                    Connects directly to Google Generative AI for open-ended conversation.
                  </p>
                  {config.provider === 'gemini' && (
                    <input
                      type="password"
                      placeholder="Paste your Gemini API Key..."
                      value={config.geminiApiKey}
                      onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                      className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  )}
                </div>
              </label>
            </div>

            {savedConfigNotice && (
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 justify-center">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>AI Configuration Saved!</span>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

