import React, { useState } from 'react';
import { Scale, Globe, ShieldCheck, ExternalLink, Menu, X, BookOpen, Building2, FileText, CheckSquare, Sparkles } from 'lucide-react';
import { LanguageCode } from '../types';

interface NavbarProps {
  activeTab: 'home' | 'chat' | 'business' | 'document' | 'dashboard' | 'admin';
  setActiveTab: (tab: 'home' | 'chat' | 'business' | 'document' | 'dashboard' | 'admin') => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

interface NavItem {
  id: 'home' | 'chat' | 'business' | 'document' | 'dashboard' | 'admin';
  label: string;
  icon: any;
  badge?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'home', label: language === 'hi' ? 'होम' : language === 'gu' ? 'મુખ્ય પૃષ્ઠ' : 'Home', icon: Scale },
    { id: 'chat', label: language === 'hi' ? 'न्याय AI चैट' : language === 'gu' ? 'ન્યાય AI ચેટ' : 'Nyaya AI', badge: 'Verified RAG', icon: Sparkles },
    { id: 'business', label: language === 'hi' ? 'बिजनेस सेटअप' : language === 'gu' ? 'બિઝનેસ સેટઅપ' : 'Business Setup', icon: Building2 },
    { id: 'document', label: language === 'hi' ? 'दस्तावेज विश्लेषक' : language === 'gu' ? 'દસ્તાવેજ સહાયક' : 'Doc Explainer', icon: FileText },
    { id: 'dashboard', label: language === 'hi' ? 'अनुपालन डैशबोर्ड' : language === 'gu' ? 'ડેશબોર્ડ' : 'Compliance Hub', icon: CheckSquare },
    { id: 'admin', label: language === 'hi' ? 'ज्ञान भंडार' : language === 'gu' ? 'જ્ઞાન ભંડાર' : 'Knowledge Base', icon: BookOpen },
  ];

  const officialPortals = [
    { name: 'MCA V3 (Companies & LLP)', url: 'https://www.mca.gov.in', authority: 'Ministry of Corporate Affairs' },
    { name: 'Udyam Portal (Free MSME)', url: 'https://udyamregistration.gov.in', authority: 'Ministry of MSME' },
    { name: 'GST Common Portal', url: 'https://www.gst.gov.in', authority: 'CBIC / GSTN' },
    { name: 'FoSCoS (Food Safety Licence)', url: 'https://foscos.fssai.gov.in', authority: 'FSSAI' },
    { name: 'IP India (Trademark & Patent)', url: 'https://ipindia.gov.in', authority: 'CGPDTM' },
    { name: 'DGFT (Import Export Code)', url: 'https://www.dgft.gov.in', authority: 'Ministry of Commerce' },
    { name: 'Shram Suvidha (Labour EPF/ESI)', url: 'https://shramsuvidha.gov.in', authority: 'Ministry of Labour' },
    { name: 'National Portal of India', url: 'https://www.india.gov.in', authority: 'Government of India' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 text-left group transition-transform focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-md border border-slate-700 group-hover:scale-105 transition-transform">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-xl text-slate-900 tracking-tight">Leg<span className="text-amber-600">Buddy</span></span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  RAG Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                AI Indian Legal & Government Assistant
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Official Portals & Language Switcher */}
          <div className="hidden sm:flex items-center space-x-2.5">
            {/* Portals Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                title="Official Indian Government Portals"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gov Portals</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>

              {portalDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setPortalDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Verified Official Portals</p>
                    <p className="text-[10px] text-slate-500">Direct access to Government of India portals</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {officialPortals.map((p) => (
                      <a
                        key={p.name}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start justify-between px-3 py-2 text-xs hover:bg-slate-50 transition-colors group"
                      >
                        <div>
                          <p className="font-semibold text-slate-800 group-hover:text-amber-600">{p.name}</p>
                          <p className="text-[10px] text-slate-500">{p.authority}</p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-600 mt-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
              <Globe className="w-3.5 h-3.5 ml-2 text-slate-400 mr-1" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md transition-all ${
                  language === 'en' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded-md transition-all ${
                  language === 'hi' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('gu')}
                className={`px-2 py-1 rounded-md transition-all ${
                  language === 'gu' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ગુજરાતી
              </button>
            </div>
          </div>

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 space-y-1">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">Language / भाषा:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-xs rounded ${language === 'en' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-1 text-xs rounded ${language === 'hi' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => setLanguage('gu')}
                  className={`px-2 py-1 text-xs rounded ${language === 'gu' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}
                >
                  ગુજરાતી
                </button>
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
