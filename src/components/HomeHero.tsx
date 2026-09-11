import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  Building2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Layers,
  Clock,
  HelpCircle,
  Factory,
  Truck,
  Hotel,
  GraduationCap,
  Microscope,
  Code2,
  Stethoscope,
  Globe
} from 'lucide-react';
import { LanguageCode } from '../types';

interface HomeHeroProps {
  language: LanguageCode;
  setActiveTab: (tab: 'home' | 'chat' | 'business' | 'document' | 'dashboard' | 'admin') => void;
  onQuickInquiry: (query: string) => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  language,
  setActiveTab,
  onQuickInquiry,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const heroContent = {
    en: {
      eyebrow: 'Universal Indian Legal & Statutory Platform',
      title: 'Understand Indian Law. Complete Government Work. Start With Confidence.',
      description:
        'Empowering citizens, entrepreneurs, and startups to navigate company registrations, licences, tax notices, and statutory compliance with verified official sources — zero prior legal knowledge required.',
      ctaChat: 'Ask Nyaya AI Assistant',
      ctaBusiness: 'Build Business Roadmap',
      ctaDoc: 'Explain Legal Document',
    },
    hi: {
      eyebrow: 'भारतीय कानूनी एवं विनियामक सहायता मंच',
      title: 'भारतीय कानून को समझें। सरकारी कार्य सरलता से पूर्ण करें।',
      description:
        'नागरिकों, नए उद्यमियों और छोटे व्यवसायों के लिए भारत सरकार के नियमों, कंपनी पंजीकरण, ट्रेडमार्क, खाद्य लाइसेंस और जीएसटी प्रक्रियाओं का सरल, सत्यापित एवं विश्वसनीय मंच।',
      ctaChat: 'न्याय AI से पूछें',
      ctaBusiness: 'बिजनेस रोडमैप बनाएं',
      ctaDoc: 'दस्तावेज का विश्लेषण करें',
    },
    gu: {
      eyebrow: 'ભારતીય કાનૂની અને સરકારી પ્રક્રિયા સહાયક',
      title: 'ભારતીય કાયદા સમજો. સરકારી કામ સરળતાથી પૂર્ણ કરો.',
      description:
        'કંપની રજીસ્ટ્રેશન, જીએસટી નોટિસ, ફૂડ લાયસન્સ અને કાનૂની દસ્તાવેજોને સરળ ભાષામાં સમજવા માટેનું વિશ્વસનીય પ્લેટફોર્મ.',
      ctaChat: 'ન્યાય AI સાથે વાત કરો',
      ctaBusiness: 'બિઝનેસ રોડમેપ બનાવો',
      ctaDoc: 'દસ્તાવેજ ચકાસો',
    },
  }[language];

  const popularServices = [
    {
      title: 'Private Limited / LLP (SPICe+)',
      portal: 'mca.gov.in',
      desc: 'Incorporation, DIN, PAN, TAN, EPFO, ESIC, and Bank Account in a single application.',
      query: 'What is the complete process and documents required for Private Limited incorporation via SPICe+ Part B?',
      category: 'MCA V3',
    },
    {
      title: 'Udyam MSME Registration',
      portal: 'udyamregistration.gov.in',
      desc: '100% free lifetime government registration with priority lending & 50% discount on Trademarks.',
      query: 'How to register for Udyam MSME certificate and what are the priority sector lending benefits?',
      category: 'MSME',
    },
    {
      title: 'GST Registration & Return Filing',
      portal: 'gst.gov.in',
      desc: 'Turnover limits, voluntary registration, Form REG-01, and monthly GSTR-1 / GSTR-3B filings.',
      query: 'What are the turnover limits for GST registration in India and what are mandatory monthly returns?',
      category: 'Taxation',
    },
    {
      title: 'FSSAI Food Safety Licence',
      portal: 'foscos.fssai.gov.in',
      desc: 'Registration, State Licence, and Central Licence for food businesses, restaurants, and cloud kitchens.',
      query: 'What are the turnover criteria for FSSAI Basic Registration vs State License vs Central License?',
      category: 'Food Safety',
    },
    {
      title: 'Trademark & IP Protection',
      portal: 'ipindia.gov.in',
      desc: 'Brand name protection under Trade Marks Act 1999 with 50% statutory fee waiver for MSMEs.',
      query: 'How to file Form TM-A for trademark registration and get MSME statutory fee discount?',
      category: 'IPR',
    },
    {
      title: 'Import Export Code (IEC)',
      portal: 'dgft.gov.in',
      desc: 'Mandatory 10-digit code issued by DGFT for cross-border trade, export incentives, and customs clearance.',
      query: 'How to obtain DGFT Import Export Code and what is the annual April-June re-validation rule?',
      category: 'Foreign Trade',
    },
  ];

  const domainsPreview = [
    { label: 'Manufacturing', icon: Factory, note: 'Factories Act, SPCB CTE/CTO, Fire NOC' },
    { label: 'Transportation & Logistics', icon: Truck, note: 'Common Carrier Act, RTO, E-Way Bill' },
    { label: 'Hotels & Hospitality', icon: Hotel, note: 'FSSAI, Eating House, Bar/Liquor, Police NOC' },
    { label: 'Study & Educational Institutes', icon: GraduationCap, note: 'AICTE / UGC, Trust / Sec 8, S&E' },
    { label: 'Research & Labs (R&D)', icon: Microscope, note: 'DSIR Recognition, Bio-safety, IP India' },
    { label: 'IT, SaaS & Software', icon: Code2, note: 'DPDP Act 2023, STPI, Software Export' },
    { label: 'Healthcare & Clinics', icon: Stethoscope, note: 'Clinical Est. Act, Pharmacy Council, Bio-waste' },
    { label: 'Any Custom Industry', icon: Layers, note: 'Space-tech, Green Energy, Fintech, Defense' },
  ];

  const faqs = [
    {
      q: 'Does LegBuddy invent or hallucinate statutory fees, sections, or rules?',
      a: 'Never. LegBuddy uses a strict Retrieval-Augmented Generation (RAG) architecture grounded in authentic Indian Acts (Companies Act 2013, CGST Act 2017, MSMED Act 2006, FSSAI Act 2006, Trade Marks Act 1999, DPDP Act 2023) and official .gov.in ministry portals. Every response includes direct citations and verification timestamps.',
    },
    {
      q: 'Is this guidance valid across all Indian states and Union Territories?',
      a: 'Yes. LegBuddy accounts for both Central legislation (like MCA, GST, DGFT) and state-specific laws such as State Shops & Establishments Acts (Gumasta in Maharashtra, Karnataka S&E), State Professional Tax, and State Pollution Control Boards (SPCBs).',
    },
    {
      q: 'Can I use LegBuddy to respond to government show cause notices like GST DRC-01?',
      a: 'Yes. Upload your notice into the Document Assistant. LegBuddy analyzes the notice reference, identifies the statutory section (e.g. Section 73 vs 74), pinpoints the discrepancy (such as GSTR-2B vs 3B ITC mismatch), explains the exact timeline to respond (typically 30 days), and outlines remedies in Form GST DRC-06.',
    },
    {
      q: 'Does LegBuddy replace my enrolled lawyer or Chartered Accountant?',
      a: 'LegBuddy provides verified educational and procedural guidance so you understand the law and procedures with zero prior knowledge. It does not provide formal legal representation before judicial courts or tribunals. For formal court appearances, always consult an enrolled Advocate under the Advocates Act, 1961.',
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-14 border border-slate-800 shadow-lg">
        {/* Subtle decorative background pattern */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4" />
            <span>{heroContent.eyebrow}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
            {heroContent.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            {heroContent.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('chat')}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shadow-md hover:shadow-amber-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{heroContent.ctaChat}</span>
            </button>

            <button
              onClick={() => setActiveTab('business')}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-semibold text-sm flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>{heroContent.ctaBusiness}</span>
            </button>

            <button
              onClick={() => setActiveTab('document')}
              className="px-5 py-3.5 text-slate-300 hover:text-white rounded-xl font-medium text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{heroContent.ctaDoc} →</span>
            </button>
          </div>

          {/* Trust points bar */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300 font-medium">100% Grounded Statutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300 font-medium">16+ Official .gov.in Portals</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300 font-medium">English, हिंदी, ગુજરાતી</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300 font-medium">Zero Hallucinations Policy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Universal Sectors Supported */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Universal Sector Coverage: Any Domain, Any Scale
            </h2>
            <p className="text-xs text-slate-500">
              Not limited to generic businesses — tailored legal requirements for factories, logistics, labs, institutes, and tech.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('business')}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center space-x-1"
          >
            <span>Launch Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {domainsPreview.map((d, i) => {
            const Icon = d.icon;
            return (
              <div
                key={i}
                onClick={() => setActiveTab('business')}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-amber-400 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 mt-2.5">{d.label}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{d.note}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Indian Government Services */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Popular Indian Government Services & Procedures
          </h2>
          <p className="text-xs text-slate-500">
            Click any procedure to ask Nyaya AI for immediate step-by-step guidance, fees, and documents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularServices.map((srv, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {srv.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{srv.portal}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{srv.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{srv.desc}</p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onQuickInquiry(srv.query)}
                  className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center space-x-1"
                >
                  <span>Ask Nyaya AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`https://${srv.portal}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-700 text-xs"
                  title="Official portal"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl font-bold text-slate-900">How LegBuddy Works</h2>
          <p className="text-xs text-slate-500">
            Translating complex legal terminology into simple, actionable steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-extrabold text-sm flex items-center justify-center">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-900">Ask or Upload in Plain Language</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Describe your business or paste your government notice in English, Hindi, or Gujarati. Zero prior knowledge needed.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-extrabold text-sm flex items-center justify-center">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-900">RAG Grounds Official Statutes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our verified knowledge engine retrieves exact provisions under Companies Act, CGST Act, FSSAI, or MSMED Act without hallucinations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-extrabold text-sm flex items-center justify-center">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900">Take Action & Track Deadlines</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive step-by-step roadmaps, official government portal links, exact fees, and automatically track filing deadlines in your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Legal grounding, state jurisdictions, and accuracy standards
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
