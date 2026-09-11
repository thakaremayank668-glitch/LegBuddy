import React from 'react';
import { Scale, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { LanguageCode } from '../types';

interface FooterProps {
  language: LanguageCode;
  setActiveTab: (tab: 'home' | 'chat' | 'business' | 'document' | 'dashboard' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ language, setActiveTab }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">LegBuddy</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              AI Indian Legal & Government Assistant. Grounded in verified Indian statutes, acts, gazettes, and official ministry portals.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Hallucinations Guarantee</span>
            </div>
          </div>

          {/* Col 2: Core Capabilities */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Features</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => setActiveTab('chat')} className="hover:text-amber-400 transition-colors">
                  Nyaya AI Chatbot (Ground RAG)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('business')} className="hover:text-amber-400 transition-colors">
                  Universal Business Setup Assistant
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('document')} className="hover:text-amber-400 transition-colors">
                  Document Explainer & Notice Analyzer
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-amber-400 transition-colors">
                  Compliance Deadlines & Licence Tracker
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('admin')} className="hover:text-amber-400 transition-colors">
                  Knowledge Base Source Manager
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Government Portals */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Verified Portals</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a href="https://www.mca.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>MCA V3 (Ministry of Corporate Affairs)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://www.gst.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>GST Common Portal (CBIC)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://udyamregistration.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>Udyam MSME Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://foscos.fssai.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>FSSAI FoSCoS Food Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://ipindia.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>IP India (Trade Marks & Patents)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Public Legal Aid & Citizen Redressal */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Public Legal Aid</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>NALSA (Free Legal Aid)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://ecourts.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>eCourts Case Status Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>National Cyber Crime Helpline: 1930</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                  <span>CPGRAMS Public Grievances</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] leading-relaxed text-slate-400 space-y-1">
          <p className="font-bold text-slate-200">
            Statutory Disclaimer under the Advocates Act, 1961:
          </p>
          <p>
            LegBuddy is an artificial intelligence-driven educational and procedural technology platform. The information, checklists, roadmaps, and document explanations provided do not constitute formal legal advice, solicitation, or advocate-client privilege. While every effort is made to maintain verified accuracy with official gazettes and ministry portals, users must consult an enrolled Advocate, Chartered Accountant (CA), or Company Secretary (CS) for formal representation in judicial, quasi-judicial, or appellate proceedings.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-900 text-[11px] text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} LegBuddy — AI Indian Legal & Government Assistant. Dedicated to transparent citizen empowerment.</p>
          <p className="flex items-center space-x-1">
            <span>Built for all Indian citizens & entrepreneurs</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
