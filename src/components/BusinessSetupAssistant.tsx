import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Printer,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  HelpCircle,
  ChevronRight,
  Factory,
  Truck,
  Hotel,
  GraduationCap,
  Microscope,
  Code2,
  Stethoscope,
  ShoppingBag,
  Leaf,
  Layers
} from 'lucide-react';
import { BusinessRoadmap, BusinessSetupRequest, LanguageCode } from '../types';

interface BusinessSetupProps {
  language: LanguageCode;
  onAddTasksToDashboard: (tasks: any[]) => void;
  onAddLicencesToDashboard: (licences: any[]) => void;
}

const PRESET_DOMAINS = [
  { id: 'manufacturing', label: 'Manufacturing & Industrial Production', icon: Factory, desc: 'Heavy machinery, fabrication, textiles, plastics, chemicals' },
  { id: 'transportation', label: 'Transportation, Logistics & Fleet', icon: Truck, desc: 'Freight, trucking, courier, supply chain, aggregators' },
  { id: 'hotels', label: 'Hotels, Hospitality & Food Services', icon: Hotel, desc: 'Restaurants, cloud kitchens, resorts, cafes, lodging' },
  { id: 'study_institutions', label: 'Educational & Study Institutions', icon: GraduationCap, desc: 'Colleges, private institutes, academies, coaching hubs' },
  { id: 'research_development', label: 'Scientific Research & Development', icon: Microscope, desc: 'Biotech, chemical labs, deep tech, testing institutions' },
  { id: 'it_software', label: 'IT, SaaS & Digital Technology', icon: Code2, desc: 'Software development, AI, cloud solutions, apps' },
  { id: 'healthcare', label: 'Healthcare, Clinics & Diagnostics', icon: Stethoscope, desc: 'Hospitals, polyclinics, pathology labs, pharmacies' },
  { id: 'ecommerce_retail', label: 'E-Commerce & Commercial Retail', icon: ShoppingBag, desc: 'Online marketplace sellers, retail trade, wholesale' },
  { id: 'agri_food', label: 'Agriculture & Food Processing', icon: Leaf, desc: 'Organic farming, cold storage, packaging, agro-commodities' },
  { id: 'custom', label: 'Custom / Other Industry Domain', icon: Layers, desc: 'Space-tech, green energy, media, mining, fintech, etc.' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi (NCT)', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'
];

export const BusinessSetupAssistant: React.FC<BusinessSetupProps> = ({
  language,
  onAddTasksToDashboard,
  onAddLicencesToDashboard,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<BusinessSetupRequest>({
    businessName: '',
    domain: 'manufacturing',
    customDomain: '',
    scale: 'small',
    locationState: 'Maharashtra',
    entityType: 'pvt_ltd',
    operatesOnline: true,
    hasPhysicalPremises: true,
    language,
  });

  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<BusinessRoadmap | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleGenerateRoadmap = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/business/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to generate roadmap');
      }

      const data = await res.json();
      setRoadmap(data);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert('Failed to generate business roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportToDashboard = () => {
    if (!roadmap) return;

    // Convert compliance calendar items into tasks
    const tasks = roadmap.complianceCalendar.map((item, idx) => ({
      id: `task-imported-${Date.now()}-${idx}`,
      title: item.event,
      category: 'tax',
      dueDate: new Date(Date.now() + (idx + 1) * 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      priority: 'high',
      authority: item.authority,
      penaltyRisk: item.penaltyWarning,
    }));

    // Convert licences into tracked licences
    const licences = roadmap.licences.map((lic, idx) => ({
      id: `lic-imported-${Date.now()}-${idx}`,
      name: lic.name,
      licenceNumber: `APP-${Math.floor(100000 + Math.random() * 900000)}`,
      authority: lic.authority,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      daysRemaining: 365,
      status: 'active',
      portalUrl: lic.portalUrl,
      renewalFee: 'Statutory Govt Fee',
    }));

    onAddTasksToDashboard(tasks);
    onAddLicencesToDashboard(licences);

    setNotification('Successfully added statutory filings and licences to your Compliance Dashboard!');
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Universal Indian Business Setup Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {language === 'hi'
              ? 'व्यापार स्थापना एवं लाइसेंस रोडमैप'
              : language === 'gu'
              ? 'વ્યવસાય સ્થાપના અને લાયસન્સ રોડમેપ'
              : 'Launch Any Business in India with Zero Confusion'}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            From heavy manufacturing to transport fleets, hotels, study institutes, research labs, or cutting-edge startups.
            Get your exact legal structure, mandatory registrations, required licences, fees, documents, and compliance calendar.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex items-center space-x-2 sm:space-x-8 text-xs font-medium">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-800 border border-slate-700">1</span>
            <span>Business Domain</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-800 border border-slate-700">2</span>
            <span>Scale & Location</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-800 border border-slate-700">3</span>
            <span>Verified Roadmap</span>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* STEP 1: Select Business Domain */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 1: What type of business are you starting?</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select an industry domain or enter your specific niche. Our system supports all sectors across the Indian economy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRESET_DOMAINS.map((domain) => {
              const Icon = domain.icon;
              const isSelected = formData.domain === domain.id;
              return (
                <div
                  key={domain.id}
                  onClick={() => setFormData({ ...formData, domain: domain.id })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-slate-900 text-amber-400' : 'bg-slate-100 text-slate-700'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{domain.label}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{domain.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Domain Input when custom selected */}
          {formData.domain === 'custom' && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <label className="block text-xs font-bold text-amber-950">
                Specify Your Exact Domain / Industry:
              </label>
              <input
                type="text"
                value={formData.customDomain}
                onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                placeholder="e.g. Commercial Drone Pilot Training Institute, Renewable Biofuel Processing, Space-tech Hardware, etc."
                className="w-full px-4 py-2.5 text-sm bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
              <p className="text-[11px] text-amber-800">
                Our RAG engine will research and cross-reference statutory Indian ministry guidelines for this exact industry.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <span>Next: Scale & Location</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Scale, Location, Premises */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 2: Operations, Scale & State Location</h2>
            <p className="text-xs text-slate-500 mt-1">
              Indian state regulations, municipal bylaws, and MSME thresholds vary by location and scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Proposed Business Name (Optional):</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Apex Dynamics, Green Bharat Organics"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* State Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Operating State / Union Territory:</label>
              <select
                value={formData.locationState}
                onChange={(e) => setFormData({ ...formData, locationState: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Scale under MSMED Act */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Initial Scale of Operation:</label>
              <select
                value={formData.scale}
                onChange={(e) => setFormData({ ...formData, scale: e.target.value as any })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="micro">Micro Enterprise (Investment &lt;= 1 Cr, Turnover &lt;= 5 Cr)</option>
                <option value="small">Small Enterprise (Investment &lt;= 10 Cr, Turnover &lt;= 50 Cr)</option>
                <option value="medium">Medium Enterprise (Investment &lt;= 50 Cr, Turnover &lt;= 250 Cr)</option>
                <option value="large">Large / Multi-state Corporate</option>
              </select>
            </div>

            {/* Corporate Entity Preference */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Preferred Corporate Structure:</label>
              <select
                value={formData.entityType}
                onChange={(e) => setFormData({ ...formData, entityType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="pvt_ltd">Private Limited Company (Recommended for Startups & Scale)</option>
                <option value="llp">Limited Liability Partnership (LLP - Low compliance)</option>
                <option value="opc">One Person Company (OPC - Solo founder)</option>
                <option value="section8">Section 8 Non-Profit (Required for Accredited Institutions/Trusts)</option>
                <option value="proprietorship">Sole Proprietorship (Simplest, but unlimited liability)</option>
              </select>
            </div>
          </div>

          {/* Operational Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasPhysicalPremises}
                onChange={(e) => setFormData({ ...formData, hasPhysicalPremises: e.target.checked })}
                className="mt-1 h-4 w-4 rounded text-slate-900 focus:ring-slate-900"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">Physical Premises / Commercial Facility</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Office, factory, warehouse, retail shop, or lab (triggers Shop & Est / Factory / Fire NOC).
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.operatesOnline}
                onChange={(e) => setFormData({ ...formData, operatesOnline: e.target.checked })}
                className="mt-1 h-4 w-4 rounded text-slate-900 focus:ring-slate-900"
              />
              <div>
                <span className="text-xs font-bold text-slate-900">E-Commerce / Online Services</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Selling via website or app (triggers mandatory GST under Sec 24, DPDP 2023, & E-commerce rules).
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Back to Domains
            </button>
            <button
              onClick={handleGenerateRoadmap}
              disabled={loading}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 flex items-center space-x-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{loading ? 'Consulting Statutes & Generating...' : 'Generate Legal Roadmap'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Display Generated Roadmap */}
      {step === 3 && roadmap && (
        <div className="space-y-6 animate-in fade-in">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200"
              >
                ← Edit Parameters
              </button>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs font-bold text-slate-800">
                Setup Plan for: <span className="text-amber-700">{roadmap.businessName}</span> ({roadmap.domain} in {roadmap.state})
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Roadmap</span>
              </button>

              <button
                onClick={handleImportToDashboard}
                className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Add All to Compliance Hub</span>
              </button>
            </div>
          </div>

          {/* Section 1: Recommended Structure */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>Recommended Legal Structure</span>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200">
              <div className="flex items-baseline space-x-2">
                <h3 className="text-base font-bold text-slate-900">{roadmap.recommendedStructure.type}</h3>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  Best Fit for {roadmap.domain}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">{roadmap.recommendedStructure.rationale}</p>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-900">Key Advantages:</span>
                  <ul className="mt-1 space-y-1 text-slate-600 list-disc list-inside">
                    {roadmap.recommendedStructure.keyAdvantages.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Alternatives Considered:</span>
                  <ul className="mt-1 space-y-1 text-slate-600 list-disc list-inside">
                    {roadmap.recommendedStructure.alternativesConsidered.map((alt, i) => (
                      <li key={i}>{alt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Mandatory Registrations */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Stage 1: Foundational Registrations ({roadmap.registrations.length})</span>
              </div>
              <span className="text-xs text-slate-400">Direct portal links included</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.registrations.map((reg) => (
                <div key={reg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        Step {reg.stepNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{reg.name}</h4>
                      <p className="text-xs text-slate-500">{reg.authority}</p>
                    </div>
                    {reg.mandatory ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        Conditional
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-snug">{reg.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200 text-slate-600">
                    <div>
                      <span className="text-slate-400">Timeframe:</span> {reg.timeEstimate}
                    </div>
                    <div>
                      <span className="text-slate-400">Govt Fee:</span> {reg.govtFee}
                    </div>
                  </div>

                  <a
                    href={reg.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 mt-1"
                  >
                    <span>Apply on {reg.portalName}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Sector-Specific Licences */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Stage 2: Sector-Specific Licences & Clearances ({roadmap.licences.length})</span>
            </div>

            <div className="space-y-4">
              {roadmap.licences.map((lic) => (
                <div key={lic.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{lic.name}</h4>
                      <p className="text-xs text-slate-500">{lic.authority}</p>
                    </div>
                    <a
                      href={lic.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 flex items-center space-x-1"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Penalty for operating without this licence: </span>
                      {lic.penaltyForNonCompliance}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-900">Prerequisites / Documents:</span>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside text-slate-600">
                        {lic.prerequisites.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Validity & Renewal Process:</span>
                      <p className="mt-1 text-slate-600">Validity: {lic.validityPeriod}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{lic.renewalProcess}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Required Documents Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Required Documents Checklist</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roadmap.documents.map((doc) => (
                <div key={doc.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <h5 className="text-xs font-bold text-slate-900">{doc.name}</h5>
                  <p className="text-[11px] text-slate-600">{doc.description}</p>
                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                    <span>Format: {doc.acceptableFormats}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Implementation Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Step-by-Step Phased Execution Plan</span>
            </div>

            <div className="space-y-3">
              {roadmap.implementationPlan.map((phase, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center shrink-0 font-bold">
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">{phase.phaseTitle}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-amber-100 text-amber-900">
                        {phase.timeline}
                      </span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      {phase.actionItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Post-Launch Ongoing Compliance Calendar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-red-600" />
              <span>Statutory Compliance Calendar (Post-Incorporation)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Statutory Event</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Authority / Law</th>
                    <th className="p-3">Statutory Due Date</th>
                    <th className="p-3">Delay Penalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {roadmap.complianceCalendar.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{item.event}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-semibold">
                          {item.frequency}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{item.authority}</td>
                      <td className="p-3 font-medium text-amber-700">{item.dueDate}</td>
                      <td className="p-3 text-red-700 text-[11px]">{item.penaltyWarning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
