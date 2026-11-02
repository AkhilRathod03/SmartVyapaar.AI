import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, ArrowRight, Globe, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVoiceQuery: (query: string) => void;
}

const VOICE_PRESETS = [
  {
    langBadge: 'తెలుగు (Telugu)',
    text: 'నాకు ఒక ఆయిల్ ప్యాకెట్, రెండు ట్యూబ్ లైట్లు, ఐదు సబ్బులు కావాలి',
    meaning: '1 oil packet, 2 tube lights and 5 soaps',
  },
  {
    langBadge: 'हिंदी (Hindi)',
    text: '1 तेल पैकेट, 2 ट्यूब लाइट और 5 साबुन चाहिए',
    meaning: '1 oil packet, 2 tube lights and 5 soaps',
  },
  {
    langBadge: 'English',
    text: '1 oil packet, 2 tube lights and 5 soaps',
    meaning: 'Multi-product basket discovery',
  },
  {
    langBadge: 'తెలుగు (Provisions)',
    text: 'రెండు ప్యాకెట్ల పాలు, ఒక బ్రెడ్ మరియు టీ పొడి',
    meaning: '2 milk packets, 1 bread and tea powder',
  },
  {
    langBadge: 'हिंदी (Kirana)',
    text: '2 पैकेट दूध, 1 ब्रेड और चाय पत्ती',
    meaning: '2 milk, 1 bread and tea',
  },
];

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onSelectVoiceQuery,
}) => {
  const { language, setLanguage } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<'te-IN' | 'hi-IN' | 'en-IN'>(
    language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'
  );

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const silenceTimerRef = useRef<any>(null);

  useEffect(() => {
    setSelectedVoiceLang(language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN');
  }, [language]);

  const commitQuery = (textToCommit?: string) => {
    const query = (textToCommit || transcriptRef.current || liveTranscript).trim();
    if (query) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      onSelectVoiceQuery(query);
      onClose();
    }
  };

  const startListening = () => {
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
      setLiveTranscript('');

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedVoiceLang;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
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
          setLiveTranscript(currentText);

          // Reset silence timer on every spoken phrase
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptRef.current.trim().length > 3) {
              commitQuery(transcriptRef.current.trim());
            }
          }, 1100);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
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
    if (transcriptRef.current) {
      commitQuery();
    }
  };

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
      setLiveTranscript('');
      transcriptRef.current = '';
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [isOpen, selectedVoiceLang]);

  if (!isOpen) return null;

  const handleLangDropdownChange = (newLang: 'te-IN' | 'hi-IN' | 'en-IN') => {
    setSelectedVoiceLang(newLang);
    if (newLang === 'te-IN') setLanguage('te');
    else if (newLang === 'hi-IN') setLanguage('hi');
    else setLanguage('en');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header with Language Dropdown */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'te' ? 'వాయిస్ ద్వారా వెతకండి' : language === 'hi' ? 'बोलकर सामान खोजें' : 'Speak to Find Items'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'te' ? 'సరుకుల పేర్లు చెప్పండి, క్షణాల్లో వెతుకుతుంది' : language === 'hi' ? 'सामान बोलें, तुरंत खोजेगा' : 'Voice search with hands-free auto-commit'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Dropdown */}
            <div className="relative inline-flex items-center">
              <Globe className="w-3 h-3 text-emerald-600 absolute left-2 pointer-events-none" />
              <select
                value={selectedVoiceLang}
                onChange={(e) => handleLangDropdownChange(e.target.value as any)}
                className="appearance-none bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-bold pl-6 pr-6 py-1 rounded-xl border border-slate-200 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition shadow-sm"
                aria-label="Select voice language"
              >
                <option value="te-IN">తెలుగు (TE)</option>
                <option value="hi-IN">हिंदी (HI)</option>
                <option value="en-IN">English (EN)</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Mic Button / Listening Visualizer */}
        <div className="p-6 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all ${
              isListening
                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 scale-105 animate-pulse'
                : 'bg-emerald-50 text-emerald-700 border-2 border-emerald-400 hover:scale-105'
            }`}
            title={isListening ? 'Click to stop' : 'Click to speak'}
          >
            {isListening ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10" />}
          </button>

          <h4 className="text-base font-bold text-slate-900 mt-4">
            {isListening
              ? language === 'te' ? 'వినబడుతోంది... మాట్లాడండి' : language === 'hi' ? 'सुन रहे हैं... बोलिए' : 'Listening... Speak now'
              : language === 'te' ? 'మైక్ సిద్ధంగా ఉంది — మళ్లీ నొక్కి మాట్లాడండి' : language === 'hi' ? 'माइक तैयार है — बोलने के लिए क्लिक करें' : 'Microphone ready — tap to speak'}
          </h4>

          {liveTranscript ? (
            <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fadeIn">
              <p className="text-xs text-emerald-800 font-bold mb-1 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{language === 'te' ? 'గుర్తించిన మాటలు (ఆటో-సెర్చ్ అవుతుంది):' : language === 'hi' ? 'पहचाना गया:' : 'Recognized:'}</span>
              </p>
              <p className="text-sm font-extrabold text-emerald-950">"{liveTranscript}"</p>
              <button
                onClick={() => commitQuery(liveTranscript)}
                className="mt-3 inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
              >
                <span>{language === 'te' ? 'ఇప్పుడే వెతకండి' : language === 'hi' ? 'सामान खोजें' : 'Search Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {language === 'te'
                ? 'ఉదా: "ఒక ఆయిల్ ప్యాకెట్ మరియు రెండు సబ్బులు" అని చెప్పండి.'
                : language === 'hi'
                ? 'उदा: "1 तेल पैकेट और 2 साबुन" बोलें।'
                : 'Say products and quantities naturally (e.g., "1 oil packet and 2 soaps").'}
            </p>
          )}
        </div>

        {/* Clickable Voice Samples */}
        <div className="p-5">
          <span className="text-xs font-bold text-slate-700 block mb-2.5">
            {language === 'te' ? 'నమూనా మాటలను నొక్కండి:' : language === 'hi' ? 'नमूना वाक्य (क्लिक करें):' : 'Tap a sample voice query to test:'}
          </span>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {VOICE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => commitQuery(preset.text)}
                className="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition flex items-center justify-between gap-3 group"
              >
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {preset.langBadge}
                  </span>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 mt-1">
                    "{preset.text}"
                  </p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

