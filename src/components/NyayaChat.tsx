import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Volume2,
  RefreshCw,
  HelpCircle,
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, CitationSource, LanguageCode } from '../types';

interface NyayaChatProps {
  language: LanguageCode;
  onNavigateToBusinessSetup: (domain?: string) => void;
  onAddTaskToDashboard: (task: { title: string; category: any; dueDate: string; authority: string }) => void;
}

export const NyayaChat: React.FC<NyayaChatProps> = ({
  language,
  onNavigateToBusinessSetup,
  onAddTaskToDashboard,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<CitationSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = {
    en: [
      { text: 'How do I register a Private Limited Company via SPICe+?', domain: 'Corporate Incorporation' },
      { text: 'Received GST DRC-01 show-cause notice for ITC mismatch. What are my remedies?', domain: 'GST Compliance' },
      { text: 'What licenses are needed for a Cloud Kitchen / Restaurant in India?', domain: 'Hotels & Hospitality' },
      { text: 'How to claim 50% discount on Trademark registration fee using Udyam MSME?', domain: 'Intellectual Property' },
      { text: 'What are the mandatory compliance requirements under DPDP Act 2023?', domain: 'Data Protection' },
      { text: 'What is the 45-day payment rule under Section 15 of MSMED Act?', domain: 'MSME Rights' },
    ],
    hi: [
      { text: 'SPICe+ पोर्टल से प्राइवेट लिमिटेड कंपनी कैसे रजिस्टर करें?', domain: 'कंपनी पंजीकरण' },
      { text: 'GST DRC-01 कारण बताओ नोटिस (Show Cause) का जवाब कैसे दें?', domain: 'जीएसटी अनुपालन' },
      { text: 'क्लाउड किचन या रेस्टोरेंट के लिए FSSAI लाइसेंस कैसे प्राप्त करें?', domain: 'खाद्य लाइसेंस' },
      { text: 'उद्यम (Udyam) MSME रजिस्ट्रेशन के क्या फायदे हैं?', domain: 'एमएसएमई योजनाएं' },
    ],
    gu: [
      { text: 'SPICe+ દ્વારા પ્રાઇવેટ લિમિટેડ કંપની કેવી રીતે શરૂ કરવી?', domain: 'કંપની રજીસ્ટ્રેશન' },
      { text: 'GST DRC-01 નોટિસ આવે ત્યારે શું પગલાં લેવા?', domain: 'જીએસટી નોટિસ' },
      { text: 'ઉદ્યમ MSME સર્ટિફિકેટથી ટ્રેડમાર્કમાં 50% છૂટ કેવી રીતે મળે?', domain: 'MSME લાભ' },
    ],
  }[language];

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcome: ChatMessage = {
        id: 'welcome-1',
        role: 'assistant',
        content:
          language === 'hi'
            ? `नमस्ते! मैं **न्याय AI (Nyaya AI)** हूँ — आपका भारतीय कानूनी और सरकारी कार्य सहायक। 
मैं केवल भारत सरकार के सत्यापित आधिकारिक स्रोतों (MCA, GSTN, FSSAI, MSME Udyam, DGFT, IP India आदि) के आधार पर उत्तर देता हूँ। 

आप किसी भी कंपनी पंजीकरण, लाइसेंस, सरकारी नोटिस, या अनुपालन के बारे में पूछ सकते हैं। आप क्या जानना चाहते हैं?`
            : language === 'gu'
            ? `નમસ્તે! હું **ન્યાય AI (Nyaya AI)** છું — આપનો ભારતીય કાનૂની અને સરકારી પ્રક્રિયા સહાયક. 
હું ભારત સરકારના અધિકૃત પોર્ટલ (MCA, GST, FSSAI, Udyam) ના ચકાસેલા નિયમો મુજબ જ માહિતી આપું છું. 

તમે કઈ કાનૂની કે સરકારી પ્રક્રિયા વિશે જાણવા માગો છો?`
            : `Namaste! I am **Nyaya AI**, your Indian Legal and Government Procedural Assistant.
I provide strictly grounded guidance backed by official statutes, rules, and government portals (mca.gov.in, gst.gov.in, foscos.fssai.gov.in, udyamregistration.gov.in, etc.).

Ask me about company setups, licences, GST notices, trademark registrations, or contract clauses. What are you working on today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        suggestedQuestions: [
          language === 'hi' ? 'प्राइवेट लिमिटेड कंपनी कैसे बनाएं?' : language === 'gu' ? 'કંપની રજીસ્ટ્રેશન માટે શું જોઈએ?' : 'How to register a Private Limited Company?',
          language === 'hi' ? 'Udyam MSME रजिस्ट्रेशन के क्या लाभ हैं?' : language === 'gu' ? 'ઉદ્યમ MSME રજીસ્ટ્રેશન કેવી રીતે કરવું?' : 'What are the benefits of Udyam MSME?',
          language === 'hi' ? 'GST DRC-01 नोटिस क्या है?' : language === 'gu' ? 'GST DRC-01 નોટિસનું સમાધાન શું?' : 'How to respond to GST DRC-01 notice?'
        ],
      };
      setMessages([welcome]);
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.role !== 'system')
        .slice(-6)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch('/api/nyaya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        citations: data.citations || [],
        suggestedQuestions: data.suggestedQuestions || [],
        disclaimer: data.disclaimer,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          language === 'hi'
            ? 'सर्वर से संपर्क करने में कठिनाई हुई। कृपया कुछ क्षण पश्चात पुनः प्रयास करें।'
            : language === 'gu'
            ? 'સર્વર સાથે જોડાણ થઈ શક્યું નથી. કૃપા કરીને થોડીવાર પછી ફરી પ્રયાસ કરો.'
            : 'Unable to reach the legal knowledge server. Please verify your connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`_\[\]()]/g, ' '));
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN';
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-base tracking-tight text-white">Nyaya AI Legal Assistant</h2>
              <span className="flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                <span>RAG Verified</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'hi'
                ? 'भारतीय कानून, पंजीकरण एवं सरकारी प्रक्रियाओं का विश्वसनीय मार्गदर्शक'
                : language === 'gu'
                ? 'ભારતીય કાયદા, રજીસ્ટ્રેશન અને સરકારી નિયમો માટે AI માર્ગદર્શક'
                : 'Zero hallucinations. Grounded in gazette notifications and official portals.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setMessages([]);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-4xl mx-auto ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-900 text-amber-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`space-y-2 max-w-[88%] sm:max-w-[80%]`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.content}
                  </div>

                  {/* Grounded Citation Sources Box */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mb-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Indian Sources & Statutes Cited:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.citations.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => setSelectedCitation(c)}
                            className="flex items-start justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50/60 hover:border-amber-300 transition-all cursor-pointer text-left"
                          >
                            <div className="pr-2">
                              <p className="text-xs font-semibold text-slate-900 line-clamp-1">{c.title}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{c.actOrRegulation}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                                  Verified: {c.verifiedDate}
                                </span>
                                <span className="text-[10px] text-slate-400">v{c.version}</span>
                              </div>
                            </div>
                            <a
                              href={c.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-amber-600 p-1"
                              title="Visit official government portal"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contextual Action Buttons */}
                  {!isUser && msg.id !== 'welcome-1' && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onNavigateToBusinessSetup()}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                      >
                        <span>Build Setup Roadmap</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() =>
                          onAddTaskToDashboard({
                            title: 'Review Legal Filing / Statutory Guidance',
                            category: 'statutory',
                            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            authority: 'Government of India',
                          })
                        }
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Add to Compliance Tasks</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer bar with timestamp, speech, and copy */}
                <div
                  className={`flex items-center space-x-2 text-[11px] text-slate-400 px-1 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <>
                      <span>•</span>
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="hover:text-slate-700 inline-flex items-center space-x-1 transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => handleSpeak(msg.content, msg.id)}
                        className={`hover:text-slate-700 inline-flex items-center space-x-1 transition-colors ${
                          speakingId === msg.id ? 'text-amber-600 font-bold' : ''
                        }`}
                        title="Listen to response"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{speakingId === msg.id ? 'Speaking...' : 'Listen'}</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Suggested follow-up prompt pills */}
                {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
                      <HelpCircle className="w-3 h-3" />
                      <span>Suggested questions to explore:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(q)}
                          className="text-xs text-left px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 transition-colors shadow-2xs"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading typing indicator */}
        {loading && (
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 border border-slate-700 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-xs bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span>Consulting verified Indian statutes & RAG knowledge base...</span>
              </div>
              <div className="flex space-x-1.5 py-1">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts Horizontal Bar (shown on start or scroll) */}
      {messages.length <= 2 && (
        <div className="px-4 py-2.5 bg-slate-100/80 border-t border-slate-200 overflow-x-auto">
          <div className="flex items-center space-x-2 max-w-4xl mx-auto">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 uppercase tracking-wider">Quick Inquiries:</span>
            <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.text)}
                  className="text-xs shrink-0 px-3 py-1 bg-white hover:bg-amber-50 hover:border-amber-300 border border-slate-200 text-slate-800 rounded-full transition-all whitespace-nowrap"
                >
                  <span className="font-semibold text-amber-700 mr-1">[{p.domain}]</span>
                  {p.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Input Field */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'भारतीय कानून, कंपनी रजिस्ट्रेशन, नोटिस या नियमों के बारे में पूछें...'
                  : language === 'gu'
                  ? 'કંપની સ્થાપના, લાયસન્સ અથવા સરકારી નિયમો વિશે પૂછો...'
                  : 'Ask about company registration, FSSAI, GST notices, contracts, or statutory compliance...'
              }
              disabled={loading}
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all disabled:opacity-50 pr-10"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 font-medium text-sm flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Nyaya AI is verified against official gazettes & statutes. Informational guidance only — not formal legal advice.
        </p>
      </div>

      {/* Citation Detail Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedCitation.title}</h3>
                  <p className="text-xs text-slate-500">{selectedCitation.actOrRegulation}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="font-semibold text-slate-900">Ministry / Authority:</span>
                <p className="mt-0.5">{selectedCitation.ministryOrAuthority}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-900">Section / Provision:</span>
                <p className="mt-0.5">{selectedCitation.sectionOrRule || 'General Statutory Code'}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-900">Statutory Summary:</span>
                <p className="mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                  {selectedCitation.summary}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-500">
                <span>Verified Date: {selectedCitation.verifiedDate}</span>
                <span>Version: {selectedCitation.version}</span>
                <span>Citations: {selectedCitation.citationsCount}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedCitation(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <a
                href={selectedCitation.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center space-x-1"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
