import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  FileCheck,
  CheckSquare,
  Scale
} from 'lucide-react';
import { DocumentAnalysisResult, LanguageCode } from '../types';

interface DocumentAssistantProps {
  language: LanguageCode;
  onAddTaskToDashboard: (task: any) => void;
}

const SAMPLE_DOCUMENTS = [
  {
    title: 'GST Show Cause Notice (Form GST DRC-01)',
    category: 'Tax Notice',
    fileName: 'GST_DRC01_Notice_FY23-24.txt',
    snippet: `FORM GST DRC-01 [See Rule 142(1)]
Reference No: ZD270224001928K | Date: 15/02/2025
To: M/s SHARMA TRADING CO. (GSTIN: 27AABCS1429B1ZX)
SUBJECT: Show Cause Notice under Section 73 of the CGST Act, 2017 for Tax Period 2023-24.
Brief Facts of the Case:
Upon verification of electronic data available on the GST portal, it has been observed that:
1. Excess ITC Claim: Input Tax Credit availed in Table 4(A) of Form GSTR-3B exceeds ITC reflected in Form GSTR-2B by Rs 4,85,200/- (CGST Rs 2,42,600 + SGST Rs 2,42,600).
2. Outward supplies discrepancy of Rs 1,12,000 between Table 12 HSN summary and Table 3.1(a).
You are hereby directed to show cause within 30 (thirty) days from the date of service of this notice as to why:
a) Tax amounting to Rs 5,97,200/- should not be demanded under Section 73(1);
b) Interest under Section 50 should not be recovered;
c) Penalty under Section 73(9) of the CGST Act 2017 should not be levied.
Please submit your representation in Form GST DRC-06 or deposit the admitted liability through Form GST DRC-03.`,
  },
  {
    title: 'Commercial Office Lease Agreement',
    category: 'Real Estate & Rent',
    fileName: 'Commercial_Office_Lease_Deed.txt',
    snippet: `COMMERCIAL LEASE AGREEMENT
This Lease Agreement is executed on this 1st day of January 2025 between LANDLORD (Lessor) and TENANT (Lessee).
1. PREMISES & TERM: The Lessor hereby demises Unit 402, B-Wing, Express Trade Towers, Mumbai for an initial period of 36 (thirty-six) months.
2. LOCK-IN PERIOD: Both parties agree to a strict Lock-in Period of 36 months. If the Lessee terminates this Lease prior to expiry of 36 months, the Lessee shall forfeit the entire Security Deposit and shall remain liable to pay the agreed monthly rent of Rs 85,000/- for the unexpired balance of the lock-in period.
3. SECURITY DEPOSIT: The Lessee has deposited an interest-free sum of Rs 5,10,000/-. The Lessor shall inspect and refund this deposit within 60 days following handover of vacant possession.
4. RENT ESCALATION: The monthly rent shall escalate by 15% automatically every 12 months.
5. REGISTRATION: This agreement shall be executed on Rs 500 stamp paper and shall not be registered at the Sub-Registrar office to save procedural costs.`,
  },
  {
    title: 'Startup Co-Founder & Equity Vesting Agreement',
    category: 'Startup & Corporate',
    fileName: 'Cofounder_Agreement_Draft.txt',
    snippet: `CO-FOUNDERS EQUITY VESTING AGREEMENT
This Agreement is entered into between Founder A (60% equity) and Founder B (40% equity) for NovaByte Technologies Pvt Ltd.
1. VESTING SCHEDULE: All founder shares shall be subject to a 4-year vesting schedule with a 1-year cliff.
2. IP ASSIGNMENT: All intellectual property, code repositories, algorithms, and trademarks created by either founder prior to or during the tenure of the company shall be irrevocably assigned to the company for a nominal consideration of Rs 100/-.
3. NON-COMPETE & NON-SOLICITATION: Each founder agrees that for a duration of 3 (three) years following departure from the company, they shall not engage in, start, or advise any competing tech business anywhere in India.
4. DISPUTE RESOLUTION: All disputes arising under this agreement shall be settled through sole arbitrator appointed exclusively by Founder A in New Delhi.`,
  },
];

export const DocumentAssistant: React.FC<DocumentAssistantProps> = ({
  language,
  onAddTaskToDashboard,
}) => {
  const [fileName, setFileName] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setDocumentText(text || `Uploaded: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      alert('Please upload a document or paste legal text to analyze.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/document/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileName || 'Legal_Document.txt',
          rawText: documentText,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze document. Please check the text and try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_DOCUMENTS[0]) => {
    setFileName(sample.fileName);
    setDocumentText(sample.snippet);
    setAnalysis(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-3">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Indian Legal Document & Notice Explainer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {language === 'hi'
              ? 'जटिल कानूनी और सरकारी दस्तावेजों को सरल भाषा में समझें'
              : language === 'gu'
              ? 'જટિલ કાનૂની દસ્તાવેજો અને સરકારી નોટિસને સરળ ભાષામાં સમજો'
              : 'Understand Any Indian Legal Agreement or Government Notice'}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Upload commercial leases, GST show-cause notices (DRC-01), NDAs, partnership deeds, or tender documents.
            Get instant plain-language summaries, clause-by-clause risk ratings, red flag detection, and statutory remedies under Indian law.
          </p>
        </div>
      </div>

      {/* Upload and Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: File Uploader & Text Area */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Upload Document or Paste Legal Text</h2>
            {documentText && (
              <button
                onClick={() => {
                  setDocumentText('');
                  setFileName('');
                  setAnalysis(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx,.png,.jpg"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              Drag and drop your file here, or <span className="text-amber-600 underline">browse</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports PDF, DOCX, TXT, GST Notices, Lease Deeds, Contracts (Max 25MB)
            </p>
            {fileName && (
              <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                <span>Selected: {fileName}</span>
              </div>
            )}
          </div>

          {/* Direct Text Editor */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600">
              Document Text (or Paste Clauses Directly):
            </label>
            <textarea
              rows={8}
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste agreement clauses, tenancy clauses, show cause notice content, or municipal letter text..."
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !documentText.trim()}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-40 flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{loading ? 'Analyzing with Indian Legal RAG Engine...' : 'Explain & Detect Red Flags'}</span>
          </button>
        </div>

        {/* Right 5 Columns: Sample Templates for 1-Click Testing */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Try Sample Indian Legal Documents</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any realistic sample below to test instant AI analysis:
            </p>
          </div>

          <div className="space-y-3">
            {SAMPLE_DOCUMENTS.map((sample, idx) => (
              <div
                key={idx}
                onClick={() => loadSample(sample)}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50/60 hover:border-amber-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                    {sample.category}
                  </span>
                  <span className="text-xs text-amber-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                    Load Sample →
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1.5">{sample.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-mono">
                  {sample.snippet.slice(0, 110)}...
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 flex items-center space-x-1">
              <Scale className="w-3.5 h-3.5 text-slate-700" />
              <span>Governing Statutes Cross-Referenced:</span>
            </span>
            <p>
              Indian Contract Act 1872, CGST Act 2017, Transfer of Property Act 1882, Indian Registration Act 1908, and DPDP Act 2023.
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Output Section */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in">
          {/* Executive Overview Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 uppercase">
                  {analysis.documentType}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{analysis.documentTitle}</h3>
                <p className="text-xs text-slate-500">Governing Law: {analysis.governingLaw}</p>
              </div>

              {/* Risk Badge */}
              <div
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border ${
                  analysis.riskRating === 'Critical' || analysis.riskRating === 'High'
                    ? 'bg-red-50 text-red-800 border-red-200'
                    : analysis.riskRating === 'Moderate'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Overall Risk Rating: {analysis.riskRating}</span>
              </div>
            </div>

            {/* Plain Language Explanation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Plain-Language Explanation (What this actually means for you):
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">{analysis.plainLanguageExplanation}</p>
            </div>
          </div>

          {/* Red Flags & Unfair Clauses */}
          {analysis.redFlags && analysis.redFlags.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-red-800 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Identified Red Flags & Statutory Risks ({analysis.redFlags.length})</span>
              </div>

              <div className="space-y-3">
                {analysis.redFlags.map((flag, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-red-50/40 border border-red-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-red-950 flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{flag.issue}</span>
                      </h5>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-200 text-red-900">
                        {flag.severity} Risk
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                      <div>
                        <span className="font-semibold text-slate-900">Legal Consequence:</span>
                        <p className="text-slate-600 mt-0.5">{flag.legalRisk}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">Ref: {flag.statutoryReference}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">Recommended Remedy / Negotiation:</span>
                        <p className="text-emerald-900 font-medium mt-0.5">{flag.recommendedRemedy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clause-by-Clause Meaning Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-slate-700" />
              <span>Clause-by-Clause Breakdown</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.keyClauses.map((clause, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-900">{clause.clauseTitle}</h5>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        clause.impact === 'risk'
                          ? 'bg-red-100 text-red-800'
                          : clause.impact === 'favorable'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {clause.impact.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-snug">{clause.plainMeaning}</p>

                  {clause.statutoryCaution && (
                    <p className="text-[11px] text-amber-800 pt-1 border-t border-slate-200 font-medium">
                      ⚠️ Caution: {clause.statutoryCaution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>Actionable Checklist ({analysis.actionChecklist.length})</span>
              </div>
              <button
                onClick={() => {
                  analysis.actionChecklist.forEach((item) => {
                    onAddTaskToDashboard({
                      title: item.task,
                      category: 'statutory',
                      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      authority: 'Document Review',
                    });
                  });
                  alert('Action items added to your Compliance Dashboard!');
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-900"
              >
                + Add All to Dashboard
              </button>
            </div>

            <div className="space-y-2">
              {analysis.actionChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                >
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{item.task}</p>
                      <p className="text-[11px] text-slate-500">Responsible: {item.responsibleParty}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                    {item.timelineHint}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Remedies */}
          {analysis.statutoryRemedies && (
            <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-2">
              <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Scale className="w-4 h-4" />
                <span>Available Statutory Remedies under Indian Law:</span>
              </span>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                {analysis.statutoryRemedies.map((rem, i) => (
                  <li key={i}>{rem}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
