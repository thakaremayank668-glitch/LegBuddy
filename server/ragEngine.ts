import { GoogleGenAI } from '@google/genai';
import { CitationSource, LanguageCode, BusinessRoadmap, BusinessSetupRequest, DocumentAnalysisResult } from '../src/types';
import { VERIFIED_LEGAL_KNOWLEDGE_BASE, KnowledgeItem } from './data/knowledgeBase';

// Shared server-side Gemini client with recommended User-Agent
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory knowledge store allowing admin updates during runtime
export const knowledgeStore: KnowledgeItem[] = [...VERIFIED_LEGAL_KNOWLEDGE_BASE];

/**
 * RAG Keyword & Lexical Matcher with BM25-style scoring
 */
export function retrieveRelevantSources(query: string, limit: number = 4): KnowledgeItem[] {
  const normalizedQuery = query.toLowerCase();
  const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 2);

  const scored = knowledgeStore.map(item => {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const actLower = item.actOrRegulation.toLowerCase();
    const summaryLower = item.summary.toLowerCase();
    const contentLower = item.fullContent.toLowerCase();

    // Exact title or act match
    if (titleLower.includes(normalizedQuery)) score += 20;
    if (actLower.includes(normalizedQuery)) score += 15;

    // Keyword matching
    for (const kw of item.keywords) {
      if (normalizedQuery.includes(kw.toLowerCase())) {
        score += 12;
      }
    }

    // Token occurrences
    for (const token of queryTokens) {
      if (titleLower.includes(token)) score += 5;
      if (actLower.includes(token)) score += 4;
      if (summaryLower.includes(token)) score += 3;
      if (contentLower.includes(token)) score += 1;
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top matches with at least some relevance, or fallback to default top verified sources
  const results = scored.filter(s => s.score > 0).slice(0, limit).map(s => s.item);
  if (results.length === 0) {
    return knowledgeStore.slice(0, limit);
  }
  return results;
}

/**
 * Format RAG context for Gemini prompt injection
 */
function buildRagContextString(sources: KnowledgeItem[]): string {
  return sources.map((src, idx) => `
[SOURCE ${idx + 1}]
- Title: ${src.title}
- Act/Regulation: ${src.actOrRegulation}
- Section/Rule: ${src.sectionOrRule || 'General'}
- Authority/Ministry: ${src.ministryOrAuthority}
- Official Portal: ${src.officialUrl}
- Verified As Of: ${src.verifiedDate}
- Content Summary: ${src.summary}
- Official Statutory Content: ${src.fullContent}
`).join('\n\n');
}

const LANGUAGE_PROMPTS: Record<LanguageCode, string> = {
  en: 'Respond in clear, professional English. Simplify complex legalese into accessible terms while keeping statutory section numbers and government forms accurate.',
  hi: 'उत्तर सरल, स्पष्ट और सम्मानजनक हिंदी (Hindi) में दें। कानूनी धाराओं और पोर्टल नामों (जैसे SPICe+, Form GST REG-01, Udyam) को सही रखें ताकि नागरिक आसानी से समझ सकें।',
  gu: 'ઉત્તર સરળ, સ્પષ્ટ અને વ્યવહારુ ગુજરાતી (Gujarati) માં આપો. કાનૂની કલમો અને સરકારી પોર્ટલના નામ (જેમ કે Udyam, FSSAI, GST) સ્પષ્ટ રાખો જેથી નાગરિકો સરળતાથી સમજી શકે.'
};

/**
 * Nyaya AI Legal Chatbot Response Generator
 */
export async function generateNyayaChatResponse(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  language: LanguageCode = 'en'
): Promise<{
  content: string;
  citations: CitationSource[];
  suggestedQuestions: string[];
  disclaimer: string;
}> {
  const sources = retrieveRelevantSources(userMessage, 4);

  // Increment citation counters for RAG tracking
  sources.forEach(src => {
    src.citationsCount = (src.citationsCount || 0) + 1;
  });

  const ragContext = buildRagContextString(sources);
  const client = getGeminiClient();

  const disclaimerText = language === 'hi'
    ? 'सूचना: यह एआई-जनरेटेड कानूनी जानकारी केवल सहायता और मार्गदर्शन के लिए है। यह किसी नामांकित अधिवक्ता (Advocate) या सरकारी प्राधिकरण की औपचारिक विधिक सलाह का विकल्प नहीं है।'
    : language === 'gu'
    ? 'સૂચના: આ AI સહાયક માત્ર માહિતી અને માર્ગદર્શન માટે છે. આ કોઈ નોંધાયેલા વકીલ અથવા સરકારી કચેરીની કાનૂની સલાહનું સ્થાન લેતું નથી.'
    : 'Legal Disclaimer: LegBuddy provides informational guidance based on verified Indian legal knowledge bases. This does not constitute an attorney-client relationship or replace qualified counsel.';

  if (client) {
    try {
      const systemInstruction = `You are "Nyaya AI" (न्याय AI), the Indian Legal and Government Procedural Assistant inside the "LegBuddy" platform.
Your core mission is to help Indian citizens, first-time entrepreneurs, startups, and small business owners understand Indian laws, regulations, licences, registrations, and procedures with zero confusion.

CRITICAL OPERATING RULES:
1. Grounding in Official Sources: You MUST strictly rely on the provided verified Indian legal sources.
2. No Hallucinations: NEVER invent laws, sections, government fee amounts, or procedures. If a specific section or fee is not known or state-dependent, explicitly state that it varies by state or requires confirmation on the official portal.
3. Citations: Reference the Act name, Section/Rule, and Official Portal (e.g., mca.gov.in, gst.gov.in, udyamregistration.gov.in, foscos.fssai.gov.in).
4. Tone & Style: Empowering, practical, crystal-clear, structured (use bullet points, step-by-step numbers, bold key terms).
5. Language: ${LANGUAGE_PROMPTS[language]}
6. Clarifying Questions: At the end of your response, ask 1 or 2 relevant follow-up questions to help the user build their legal roadmap.`;

      const prompt = `VERIFIED OFFICIAL SOURCES AVAILABLE:
${ragContext}

CONVERSATION HISTORY:
${history.map(h => `${h.role === 'user' ? 'User' : 'Nyaya AI'}: ${h.content}`).join('\n')}

USER QUERY:
${userMessage}

Respond helpfully according to your system instructions in ${language.toUpperCase()}. Include structured steps, applicable forms/portals, and relevant follow-up questions.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const responseText = response.text || '';

      // Generate context-aware follow-up suggested queries
      const suggestedQuestions = generateSuggestedQuestions(userMessage, language);

      return {
        content: responseText,
        citations: sources,
        suggestedQuestions,
        disclaimer: disclaimerText,
      };
    } catch (err) {
      console.error('Gemini API chat error, falling back to deterministic RAG generator:', err);
    }
  }

  // Deterministic high-quality RAG fallback if API key is not present or rate limited
  return generateDeterministicRagChat(userMessage, sources, language, disclaimerText);
}

function generateSuggestedQuestions(query: string, language: LanguageCode): string[] {
  const qLower = query.toLowerCase();
  if (language === 'hi') {
    if (qLower.includes('company') || qLower.includes('pvt') || qLower.includes('रजिस्ट्रेशन')) {
      return [
        'प्राइवेट लिमिटेड कंपनी के लिए क्या न्यूनतम पूंजी आवश्यक है?',
        'क्या मैं अकेले वन पर्सन कंपनी (OPC) शुरू कर सकता हूँ?',
        'SPICe+ फॉर्म में कौन-से दस्तावेज अपलोड करने होते हैं?'
      ];
    }
    if (qLower.includes('gst') || qLower.includes('टैक्स')) {
      return [
        'ई-कॉमर्स विक्रेताओं के लिए GST अनिवार्य कब होता है?',
        'GST में कंपोजिशन स्कीम का क्या फायदा है?',
        'DRC-01 नोटिस का उत्तर कितने दिनों में देना होता है?'
      ];
    }
    return [
      'उद्यम (Udyam) MSME रजिस्ट्रेशन के क्या लाभ हैं?',
      'खाद्य व्यवसाय (Food Business) के लिए FSSAI लाइसेंस कैसे लें?',
      'ट्रेडमार्क रजिस्टर कराने में कितना सरकारी शुल्क लगता है?'
    ];
  } else if (language === 'gu') {
    return [
      'પ્રાઇવેટ લિમિટેડ કંપની શરૂ કરવા કયા દસ્તાવેજો જોઈએ?',
      'ઉદ્યમ MSME રજીસ્ટ્રેશન કરવાથી કયા લાભ મળે?',
      'ગુજરાતમાં શોપ એક્ટ (ગુમાસ્તા ધારો) કેવી રીતે મેળવવો?'
    ];
  }

  // English suggestions
  if (qLower.includes('company') || qLower.includes('startup') || qLower.includes('incorporat')) {
    return [
      'What is the difference between LLP and Private Limited in India?',
      'Do I need a commercial address to incorporate via SPICe+?',
      'What are the mandatory post-incorporation compliances within 180 days?'
    ];
  }
  if (qLower.includes('gst') || qLower.includes('tax') || qLower.includes('notice')) {
    return [
      'How to resolve GSTR-2B vs GSTR-3B input tax credit mismatch?',
      'What is the threshold for voluntary GST registration?',
      'What are the penalty provisions under Section 73 vs 74 of CGST Act?'
    ];
  }
  return [
    'What licenses are required to start my specific business?',
    'How do I claim 50% discount on Trademark fees using Udyam?',
    'What are the mandatory clauses in a commercial rental agreement?'
  ];
}

function generateDeterministicRagChat(
  query: string,
  sources: KnowledgeItem[],
  language: LanguageCode,
  disclaimer: string
) {
  const primarySource = sources[0] || VERIFIED_LEGAL_KNOWLEDGE_BASE[0];

  let text = '';
  if (language === 'hi') {
    text = `### आधिकारिक कानूनी मार्गदर्शन (Official Legal Guidance)

आपके प्रश्न के संदर्भ में **${primarySource.actOrRegulation}** (प्राधिकरण: ${primarySource.ministryOrAuthority}) के अंतर्गत निम्नलिखित मुख्य प्रावधान लागू होते हैं:

1. **प्रासंगिक धारा / नियम:** ${primarySource.sectionOrRule || 'विहित प्रावधान'}
2. **आधिकारिक प्रक्रिया:**
   - ${primarySource.summary}
   - विस्तृत नियम: ${primarySource.fullContent}
3. **सत्यापित सरकारी पोर्टल:** [${primarySource.officialUrl}](${primarySource.officialUrl})
4. **अंतिम सत्यापन तिथि:** ${primarySource.verifiedDate} (संस्करण: ${primarySource.version})

**व्यावहारिक कदम:**
- सबसे पहले आधिकारिक सरकारी पोर्टल पर आधार एवं पैन से विवरण सत्यापित करें।
- किसी भी शुल्क भुगतान से पूर्व सरकारी पोर्टल (gov.in या nic.in) की सत्यता जांचें।`;
  } else if (language === 'gu') {
    text = `### અધિકૃત કાનૂની માર્ગદર્શન (Official Legal Guidance)

તમારા પ્રશ્ન માટે **${primarySource.actOrRegulation}** (સત્તામંડળ: ${primarySource.ministryOrAuthority}) હેઠળ નીચે મુજબના નિયમો લાગુ પડે છે:

1. **સંબંધિત કલમ / નિયમ:** ${primarySource.sectionOrRule || 'સામાન્ય જોગવાઈઓ'}
2. **સરકારી પ્રક્રિયા:**
   - ${primarySource.summary}
   - નિયમો: ${primarySource.fullContent}
3. **અધિકૃત સરકારી પોર્ટલ:** [${primarySource.officialUrl}](${primarySource.officialUrl})
4. **ચકાસણી તારીખ:** ${primarySource.verifiedDate}`;
  } else {
    text = `### Verified Statutory Guidance

Based on verified Indian legal repositories for your query, the governing framework is under **${primarySource.actOrRegulation}** administered by the **${primarySource.ministryOrAuthority}**.

#### 1. Core Statutory Provision (${primarySource.sectionOrRule || 'General Norms'})
${primarySource.summary}

#### 2. Key Operational Details
${primarySource.fullContent}

#### 3. Verified Portal & Filing Links
- **Official Government Portal:** [${primarySource.officialUrl}](${primarySource.officialUrl})
- **Repository Verification Date:** ${primarySource.verifiedDate} (Version ${primarySource.version})

#### 4. Actionable Next Steps
1. Verify eligibility criteria using valid PAN and Aadhaar.
2. Complete digital KYC on the designated Ministry portal.
3. Maintain compliance records for statutory audit and timely renewals.`;
  }

  return {
    content: text,
    citations: sources,
    suggestedQuestions: generateSuggestedQuestions(query, language),
    disclaimer,
  };
}

/**
 * Universal Business Setup Assistant Roadmap Generator
 * Covers ANY domain: Manufacturing, Transportation, Hotels/Hospitality, Educational/Study Institutions,
 * Research & Development, IT/Software, Healthcare, E-Commerce, Agriculture, etc.
 */
export async function generateBusinessSetupRoadmap(
  req: BusinessSetupRequest
): Promise<BusinessRoadmap> {
  const domainLower = (req.customDomain || req.domain).toLowerCase();

  // Find relevant domain knowledge sources
  const relevantSources = retrieveRelevantSources(`${req.domain} ${req.customDomain || ''} business license registration`, 5);

  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `Generate an exhaustive, highly accurate, verified Indian business setup roadmap for:
- Business Name: "${req.businessName || 'New Venture'}"
- Domain/Industry: "${req.domain}" ${req.customDomain ? `(${req.customDomain})` : ''}
- Scale: ${req.scale.toUpperCase()}
- State/UT: ${req.locationState}
- Online Operations: ${req.operatesOnline}
- Physical Premises: ${req.hasPhysicalPremises}
- Entity Preference: ${req.entityType || 'Recommended by you'}

CRITICAL INSTRUCTIONS:
- You MUST provide genuine Indian legal forms, portals (.gov.in), acts, timeframes, and statutory compliance.
- Support ANY domain from manufacturing, logistics, hotels, study institutes, research labs, to tech.
- Return ONLY valid JSON matching this schema:
{
  "recommendedStructure": {
    "type": "Private Limited Company | LLP | Sole Proprietorship | OPC | Section 8 Company",
    "rationale": "...",
    "keyAdvantages": ["...", "..."],
    "alternativesConsidered": ["...", "..."]
  },
  "registrations": [
    {
      "id": "reg-1",
      "name": "e.g. SPICe+ MCA Company Registration",
      "authority": "Ministry of Corporate Affairs",
      "portalUrl": "https://www.mca.gov.in",
      "portalName": "MCA V3 Portal",
      "timeEstimate": "3-7 Days",
      "govtFee": "Rs 0 (up to 15L capital) + State Stamp Duty",
      "mandatory": true,
      "description": "...",
      "applicableLaw": "Companies Act, 2013",
      "stepNumber": 1
    }
  ],
  "licences": [
    {
      "id": "lic-1",
      "name": "...",
      "authority": "...",
      "portalUrl": "https://...",
      "validityPeriod": "1-5 Years",
      "penaltyForNonCompliance": "...",
      "prerequisites": ["..."],
      "checklist": ["..."],
      "renewalProcess": "..."
    }
  ],
  "documents": [
    {
      "id": "doc-1",
      "name": "PAN & Aadhaar of Promoters",
      "description": "...",
      "acceptableFormats": "Self-attested PDF/JPG",
      "issuingAuthority": "Income Tax / UIDAI",
      "purpose": "..."
    }
  ],
  "implementationPlan": [
    {
      "stage": "Phase 1",
      "phaseTitle": "Entity Structuring & Name Reservation",
      "timeline": "Week 1",
      "actionItems": ["...", "..."]
    }
  ],
  "complianceCalendar": [
    {
      "id": "comp-1",
      "event": "GSTR-3B Monthly Return",
      "frequency": "Monthly",
      "authority": "CBIC / GSTN",
      "dueDate": "20th of every month",
      "applicableLaw": "CGST Act 2017",
      "penaltyWarning": "Rs 50/day (Rs 20 for Nil return)"
    }
  ]
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.recommendedStructure && parsed.registrations && parsed.licences) {
        return {
          businessName: req.businessName || 'New Venture',
          domain: req.customDomain || req.domain,
          state: req.locationState,
          recommendedStructure: parsed.recommendedStructure,
          registrations: parsed.registrations,
          licences: parsed.licences,
          documents: parsed.documents || [],
          implementationPlan: parsed.implementationPlan || [],
          complianceCalendar: parsed.complianceCalendar || [],
          verifiedSources: relevantSources,
        };
      }
    } catch (err) {
      console.error('Gemini error generating business roadmap:', err);
    }
  }

  // Deterministic robust domain roadmap fallback
  return getDeterministicRoadmap(req, relevantSources);
}

function getDeterministicRoadmap(req: BusinessSetupRequest, sources: CitationSource[]): BusinessRoadmap {
  const domain = (req.customDomain || req.domain).toLowerCase();
  const isMfg = domain.includes('manufactur') || domain.includes('factory') || domain.includes('industry');
  const isTransport = domain.includes('transport') || domain.includes('logistic') || domain.includes('freight') || domain.includes('courier');
  const isHotel = domain.includes('hotel') || domain.includes('restaurant') || domain.includes('hospitality') || domain.includes('cafe');
  const isEdu = domain.includes('study') || domain.includes('education') || domain.includes('institution') || domain.includes('college') || domain.includes('school');
  const isResearch = domain.includes('research') || domain.includes('r&d') || domain.includes('science') || domain.includes('biotech');

  const defaultStructure = isEdu
    ? {
        type: 'Section 8 Non-Profit Company or Registered Public Trust',
        rationale: 'Recognized educational colleges and universities require non-profit status under UGC and State Education Department norms to obtain AISHE and affiliation codes.',
        keyAdvantages: ['Eligibility for 12AB/80G tax exemptions', 'Eligible for Government research grants', 'Full institutional credibility'],
        alternativesConsidered: ['Private Limited (applicable only for non-accredited private coaching/edtech bootcamps)', 'Society under Societies Registration Act 1860']
      }
    : {
        type: req.scale === 'micro' ? 'Limited Liability Partnership (LLP)' : 'Private Limited Company (Pvt Ltd)',
        rationale: 'Provides limited liability protection, distinct corporate identity, separate PAN, and high investor credibility under Companies Act 2013.',
        keyAdvantages: ['100% limited liability protection', 'Separate legal entity', 'Easy equity allocation and bank financing'],
        alternativesConsidered: ['Sole Proprietorship (Unlimited liability risk)', 'One Person Company (OPC)']
      };

  const registrations = [
    {
      id: 'reg-mca-spice',
      name: 'SPICe+ Part A & B Company / LLP Incorporation',
      authority: 'Ministry of Corporate Affairs (MCA)',
      portalUrl: 'https://www.mca.gov.in',
      portalName: 'MCA V3 Portal',
      timeEstimate: '3-5 Working Days',
      govtFee: 'Rs 0 for capital up to Rs 15L (State stamp duty applies)',
      mandatory: true,
      description: 'Unified incorporation form bundling name reservation, DIN, PAN, TAN, EPFO, ESIC, and corporate bank account.',
      applicableLaw: 'Companies Act, 2013',
      stepNumber: 1
    },
    {
      id: 'reg-udyam-msme',
      name: 'Udyam MSME Registration',
      authority: 'Ministry of MSME',
      portalUrl: 'https://udyamregistration.gov.in',
      portalName: 'Udyam Portal',
      timeEstimate: '1 Day (Instant Certificate)',
      govtFee: 'Rs 0 (Completely Free of cost)',
      mandatory: true,
      description: 'Statutory registration for priority sector lending, 45-day payment protection under Sec 15 of MSMED Act, and 50% discount on Trademark filings.',
      applicableLaw: 'MSMED Act, 2006',
      stepNumber: 2
    },
    {
      id: 'reg-gst-reg01',
      name: 'GST Registration (Form GST REG-01)',
      authority: 'Central Board of Indirect Taxes & Customs (CBIC)',
      portalUrl: 'https://www.gst.gov.in',
      portalName: 'GST Common Portal',
      timeEstimate: '3-7 Working Days',
      govtFee: 'Rs 0 Government Fee',
      mandatory: req.operatesOnline || req.scale !== 'micro',
      description: 'Compulsory 15-digit GSTIN for billing clients, collecting indirect taxes, claiming Input Tax Credit, and interstate commerce.',
      applicableLaw: 'CGST Act, 2017 Section 22/24',
      stepNumber: 3
    },
    {
      id: 'reg-shop-gumasta',
      name: `${req.locationState} Shop & Commercial Establishment Registration`,
      authority: `${req.locationState} Labour Department / Municipal Corporation`,
      portalUrl: 'https://labour.gov.in',
      portalName: 'State Labour e-Services Portal',
      timeEstimate: '2-4 Working Days',
      govtFee: 'Rs 500 - 2,500 (Varies by employee count)',
      mandatory: req.hasPhysicalPremises,
      description: 'Mandatory municipal licence for physical registered office premises within 30 days of starting business.',
      applicableLaw: 'State Shops & Commercial Establishments Act',
      stepNumber: 4
    }
  ];

  const licences = [];
  if (isMfg) {
    licences.push({
      id: 'lic-factory-spcb',
      name: 'Pollution Control Board Consent (CTE & CTO)',
      authority: 'State Pollution Control Board (SPCB) / CPCB',
      portalUrl: 'https://cpcb.nic.in',
      validityPeriod: '1 to 5 Years (Renewable)',
      penaltyForNonCompliance: 'Closure notice and fines under Sec 41-44 of Water & Air Acts',
      prerequisites: ['Site layout plan', 'Effluent/Emission details', 'Machinery project report'],
      checklist: ['Environmental impact declaration', 'Noise level adherence', 'Hazardous waste authorization'],
      renewalProcess: 'Apply online 90 days prior to expiry on State SPCB single window.'
    });
    licences.push({
      id: 'lic-factory-act',
      name: 'Factory Licence under Factories Act 1948',
      authority: 'Directorate of Industrial Safety & Health (DISH)',
      portalUrl: 'https://labour.gov.in',
      validityPeriod: '1 to 5 Years',
      penaltyForNonCompliance: 'Penal action under Section 92 of Factories Act',
      prerequisites: ['Building plan approval', 'DISH drawing clearance', 'Installed power proof'],
      checklist: ['Worker safety protocols', 'Ventilation & canteen norms', 'First aid boxes'],
      renewalProcess: 'Annual return and fee submission before October 31st.'
    });
  } else if (isHotel) {
    licences.push({
      id: 'lic-fssai-state',
      name: 'FSSAI State / Central Food Licence',
      authority: 'Food Safety and Standards Authority of India (FSSAI)',
      portalUrl: 'https://foscos.fssai.gov.in',
      validityPeriod: '1 to 5 Years',
      penaltyForNonCompliance: 'Fine up to Rs 5 Lakhs and up to 6 months imprisonment under Sec 63',
      prerequisites: ['Kitchen layout', 'Water potability test report', 'Food handler medical certificates'],
      checklist: ['FSMS food safety plan', 'Pest control contract', 'Food allergen display'],
      renewalProcess: 'File Form B online via FoSCoS portal at least 30 days before expiry.'
    });
    licences.push({
      id: 'lic-police-eating',
      name: 'Police Eating House / Lodging Licence & Sarais Act Registration',
      authority: 'City Police Commissionerate & District Magistrate',
      portalUrl: 'https://tourism.gov.in',
      validityPeriod: '1 Year (Annual)',
      penaltyForNonCompliance: 'Seal and closure order under Police Act',
      prerequisites: ['Fire NOC', 'Municipal Health Trade Licence', 'Police verification of owner'],
      checklist: ['CCTV surveillance setup', 'Guest identity register (Form C for foreigners)', 'Night security guard'],
      renewalProcess: 'Submit renewal application 60 days before expiry with updated Fire NOC.'
    });
  } else if (isTransport) {
    licences.push({
      id: 'lic-common-carrier',
      name: 'Common Carrier Certificate & Goods Carriage Permit',
      authority: 'State Transport Authority (RTO / MoRTH)',
      portalUrl: 'https://parivahan.gov.in',
      validityPeriod: '5 Years',
      penaltyForNonCompliance: 'Vehicle impoundment and cancellation of transit permits',
      prerequisites: ['Vehicle RC', 'Valid commercial vehicle insurance', 'Pollution Under Control (PUC)'],
      checklist: ['GPS/VLTD tracking unit compliance', 'Driver commercial badge verification', 'E-Way Bill integration'],
      renewalProcess: 'Renewable on Parivahan Vahan portal before expiry date.'
    });
  } else if (isEdu) {
    licences.push({
      id: 'lic-edu-aicte-fire',
      name: 'Institutional Building Fire Safety & Municipal Occupancy NOC',
      authority: 'State Fire Service Directorate & Local Municipal Body',
      portalUrl: 'https://ugc.gov.in',
      validityPeriod: '1 Year / 3 Years',
      penaltyForNonCompliance: 'Immediate building evacuation and revocation of affiliation',
      prerequisites: ['Architectural egress plan', 'Fire hydrant system certification', 'Smoke detector audit'],
      checklist: ['Dual emergency staircases', 'Fire drill logbook', 'Refuge area clearance'],
      renewalProcess: 'Annual third-party audit by certified fire officer.'
    });
  } else if (isResearch) {
    licences.push({
      id: 'lic-dsir-recog',
      name: 'DSIR In-house R&D Recognition',
      authority: 'Department of Scientific and Industrial Research (DSIR)',
      portalUrl: 'https://www.dsir.gov.in',
      validityPeriod: '3 Years (Renewable)',
      penaltyForNonCompliance: 'Loss of customs duty exemption and research incentives',
      prerequisites: ['Dedicated laboratory space', 'Qualified full-time scientists', 'R&D budget line items'],
      checklist: ['Bio-safety / hazardous waste disposal protocol', 'Equipment calibration logs', 'IP patent portfolio'],
      renewalProcess: 'Online renewal report via DSIR portal 6 months prior to expiry.'
    });
  } else {
    licences.push({
      id: 'lic-tm-brand',
      name: 'Trademark Registration (Form TM-A)',
      authority: 'Controller General of Patents, Designs and Trade Marks (IP India)',
      portalUrl: 'https://ipindia.gov.in',
      validityPeriod: '10 Years (Indefinitely Renewable)',
      penaltyForNonCompliance: 'Loss of exclusive brand rights; trademark infringement litigation',
      prerequisites: ['Proposed logo/name', 'User affidavit with date of first use', 'Udyam Certificate for 50% discount'],
      checklist: ['Prior public search in relevant class', 'Power of Attorney (Form TM-48) if using agent'],
      renewalProcess: 'File Form TM-R every 10 years on IP India portal.'
    });
  }

  const documents = [
    {
      id: 'doc-id-proof',
      name: 'PAN & Aadhaar of all Directors / Partners',
      description: 'Self-attested identity proof with matching demographic details.',
      acceptableFormats: 'PDF or JPG under 5MB',
      issuingAuthority: 'Income Tax Dept / UIDAI',
      purpose: 'KYC for SPICe+ and Bank account opening.'
    },
    {
      id: 'doc-address-proof',
      name: 'Proof of Registered Office Address',
      description: 'Electricity bill, Gas bill or Telephone bill not older than 2 months, along with Notarized Rent Agreement and NOC from owner.',
      acceptableFormats: 'PDF (Clear scan)',
      issuingAuthority: 'Utility Company & Property Owner',
      purpose: 'Address verification for MCA and GST registration.'
    },
    {
      id: 'doc-moa-aoa',
      name: 'Draft MOA & AOA (e-MOA INC-33 / e-AOA INC-34)',
      description: 'Charter documents specifying primary objects of business in the chosen domain.',
      acceptableFormats: 'Digitally Signed Form on MCA portal',
      issuingAuthority: 'Promoters & MCA Registrar',
      purpose: 'Defining corporate constitution and internal governance rules.'
    }
  ];

  const implementationPlan = [
    {
      stage: 'Phase 1',
      phaseTitle: 'Entity Structuring & Name Reservation',
      timeline: 'Days 1 - 3',
      actionItems: [
        'Obtain Class 3 Digital Signature Certificates (DSC) for all promoters.',
        'Submit SPICe+ Part A on MCA portal for unique corporate name approval.',
        'Draft domain-specific main object clauses for Memorandum of Association (MOA).'
      ]
    },
    {
      stage: 'Phase 2',
      phaseTitle: 'Formal Incorporation & Statutory Registrations',
      timeline: 'Days 4 - 8',
      actionItems: [
        'File SPICe+ Part B with MCA for Certificate of Incorporation (CIN), PAN & TAN.',
        'Simultaneously register for free Udyam MSME certification online.',
        'Apply for GST registration (Form GST REG-01) with Aadhaar authentication.'
      ]
    },
    {
      stage: 'Phase 3',
      phaseTitle: 'Sectoral Licences & Operations Launch',
      timeline: 'Days 9 - 21',
      actionItems: [
        'Apply for domain-specific licences (e.g. SPCB/FSSAI/Shop Act/RTO).',
        'Open current bank account using Certificate of Incorporation and board resolution.',
        'File Form INC-20A (Declaration of Commencement of Business) within 180 days on MCA.'
      ]
    }
  ];

  const complianceCalendar: any[] = [
    {
      id: 'comp-gstr3b',
      event: 'GSTR-3B Monthly Return Filing',
      frequency: 'Monthly',
      authority: 'GSTN / CBIC',
      dueDate: '20th of every month',
      applicableLaw: 'CGST Act, 2017',
      penaltyWarning: 'Late fee Rs 50/day (Rs 20 for NIL return) plus 18% p.a. interest.'
    },
    {
      id: 'comp-tds',
      event: 'TDS Payment Deposit (Challan ITNS 281)',
      frequency: 'Monthly',
      authority: 'Income Tax Department',
      dueDate: '7th of every month',
      applicableLaw: 'Income Tax Act, 1961',
      penaltyWarning: '1.5% interest per month from date of deduction.'
    },
    {
      id: 'comp-roc-annual',
      event: 'ROC Annual Filing (AOC-4 Financials & MGT-7 Annual Return)',
      frequency: 'Annual',
      authority: 'Ministry of Corporate Affairs (MCA)',
      dueDate: 'Within 30/60 days of AGM (typically Oct/Nov)',
      applicableLaw: 'Companies Act, 2013 Section 92 & 137',
      penaltyWarning: 'Rs 100 per day of continuous delay without cap.'
    }
  ];

  return {
    businessName: req.businessName || 'New Venture',
    domain: req.customDomain || req.domain,
    state: req.locationState,
    recommendedStructure: defaultStructure,
    registrations,
    licences,
    documents,
    implementationPlan,
    complianceCalendar,
    verifiedSources: sources,
  };
}

/**
 * Legal Document Analyzer & Plain-Language Explainer
 */
export async function analyzeLegalDocument(
  fileName: string,
  rawText: string,
  language: LanguageCode = 'en'
): Promise<DocumentAnalysisResult> {
  const sources = retrieveRelevantSources(`${fileName} ${rawText.slice(0, 300)}`, 4);
  const client = getGeminiClient();

  if (client && rawText.trim().length > 20) {
    try {
      const prompt = `You are a Senior Indian Legal Advocate and Document Specialist on "LegBuddy".
Analyze this uploaded Indian legal/government document:
- File Name: "${fileName}"
- Content:
${rawText.slice(0, 8000)}

INSTRUCTIONS:
1. Simplify complex legalese into plain language that a first-time citizen or small business owner can easily understand in ${language.toUpperCase()}.
2. Identify the governing Indian law (e.g. Indian Contract Act 1872, CGST Act 2017, Companies Act 2013, Registration Act 1908, etc.).
3. Identify all RED FLAGS, unusual clauses, high-risk penalties, one-sided indemnity, or missing statutory safeguards.
4. Provide an actionable step-by-step checklist.
5. Return ONLY a JSON object matching this schema:
{
  "documentTitle": "...",
  "documentType": "Commercial Lease | GST Notice | Non-Disclosure Agreement | Employment Contract | Government Order | Other",
  "governingLaw": "e.g. Transfer of Property Act 1882 & Registration Act 1908",
  "executiveSummary": "2-3 concise sentences summarizing what this document is.",
  "plainLanguageExplanation": "Detailed plain explanation in accessible language.",
  "riskRating": "Low | Moderate | High | Critical",
  "keyClauses": [
    {
      "clauseTitle": "...",
      "clauseNumber": "Clause 4.1",
      "plainMeaning": "...",
      "impact": "favorable | neutral | risk",
      "statutoryCaution": "..."
    }
  ],
  "redFlags": [
    {
      "severity": "high | medium | low",
      "issue": "...",
      "legalRisk": "...",
      "statutoryReference": "...",
      "recommendedRemedy": "..."
    }
  ],
  "actionChecklist": [
    {
      "id": "chk-1",
      "task": "...",
      "timelineHint": "Within 15 days",
      "responsibleParty": "...",
      "completed": false
    }
  ],
  "statutoryRemedies": [
    "..."
  ]
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.executiveSummary && parsed.keyClauses) {
        return {
          ...parsed,
          verifiedSources: sources,
        };
      }
    } catch (err) {
      console.error('Gemini error analyzing document:', err);
    }
  }

  // Fallback deterministic analysis
  return getDeterministicDocumentAnalysis(fileName, rawText, sources);
}

function getDeterministicDocumentAnalysis(
  fileName: string,
  rawText: string,
  sources: CitationSource[]
): DocumentAnalysisResult {
  const textLower = (fileName + ' ' + rawText).toLowerCase();
  const isGstNotice = textLower.includes('drc') || textLower.includes('notice') || textLower.includes('gst');
  const isLease = textLower.includes('lease') || textLower.includes('rent') || textLower.includes('tenant') || textLower.includes('landlord');
  const isCofounder = textLower.includes('founder') || textLower.includes('shareholder') || textLower.includes('equity') || textLower.includes('vesting');

  if (isGstNotice) {
    return {
      documentTitle: fileName || 'GST Show Cause Notice (Form GST DRC-01/01A)',
      documentType: 'Tax Demand & Show Cause Notice',
      governingLaw: 'Central Goods and Services Tax Act, 2017 (Section 73 & Section 74)',
      executiveSummary: 'This document represents a formal tax demand or inquiry from the GST Department alleging a mismatch between returns (such as GSTR-1 vs 3B or 3B vs 2B ITC) or short payment of tax.',
      plainLanguageExplanation: 'The GST authorities are formally asking you to explain why a specified sum of tax, interest, or penalty should not be demanded from you. You have a statutory window (typically 30 days) to respond in Form GST DRC-06 or pay through DRC-03.',
      riskRating: 'High',
      keyClauses: [
        {
          clauseTitle: 'Grounds of Demand & Tax Differential',
          clauseNumber: 'Para 2',
          plainMeaning: 'Specifies the exact difference in tax liability or Input Tax Credit claimed compared to supplier filings in GSTR-2B.',
          impact: 'risk',
          statutoryCaution: 'Failure to contest within 30 days leads to an ex-parte assessment order under Section 73(9).'
        },
        {
          clauseTitle: 'Option for Voluntary Payment & Penalty Waiver',
          clauseNumber: 'Para 4',
          plainMeaning: 'If paid before order or within 30 days for Section 73 notices, penalty is completely waived.',
          impact: 'favorable',
          statutoryCaution: 'Applicable only under Section 73 (non-fraud cases).'
        }
      ],
      redFlags: [
        {
          severity: 'high',
          issue: 'Strict 30-day statutory limitation period for filing reply',
          legalRisk: 'If unreplied, proper officer will confirm entire demand along with interest and 10% penalty.',
          statutoryReference: 'CGST Act Section 73(8) / 73(9)',
          recommendedRemedy: 'Submit a factual reconciliation statement and detailed reply in Form GST DRC-06 immediately.'
        }
      ],
      actionChecklist: [
        {
          id: 'act-gst-1',
          task: 'Download GSTR-2B and GSTR-3B monthly excel reconciliations for the disputed tax periods.',
          timelineHint: 'Day 1 - 3',
          responsibleParty: 'Accountant / Tax Consultant',
          completed: false
        },
        {
          id: 'act-gst-2',
          task: 'Draft para-wise factual reply highlighting bona fide purchases and bank payment proofs.',
          timelineHint: 'Within 15 days',
          responsibleParty: 'Authorized Representative',
          completed: false
        },
        {
          id: 'act-gst-3',
          task: 'File Form GST DRC-06 on the GST Portal under Services > User Services > View Additional Notices.',
          timelineHint: 'Before 30 days deadline',
          responsibleParty: 'Taxpayer',
          completed: false
        }
      ],
      statutoryRemedies: [
        'Pay admitted amount via Form DRC-03 to halt interest accumulation.',
        'File appeal to Appellate Authority within 3 months under Section 107 if an adverse order is passed.'
      ],
      verifiedSources: sources
    };
  }

  if (isLease) {
    return {
      documentTitle: fileName || 'Commercial Lease & Tenancy Agreement',
      documentType: 'Commercial Property Lease',
      governingLaw: 'Transfer of Property Act 1882 & Indian Registration Act 1908',
      executiveSummary: 'Agreement granting leasehold rights over commercial premises for business operations with rent, lock-in, and maintenance provisions.',
      plainLanguageExplanation: 'This contract defines your rights to occupy commercial premises. Crucial parts to check are the lock-in period (during which you cannot exit without paying rent for the entire term), security deposit return timeline, and property registration.',
      riskRating: 'Moderate',
      keyClauses: [
        {
          clauseTitle: 'Lock-in Period & Early Termination Penalties',
          clauseNumber: 'Clause 6',
          plainMeaning: 'Prevents either party from terminating the lease during the first 12-36 months without forfeiting rent.',
          impact: 'risk',
          statutoryCaution: 'Ensure mutually symmetric lock-in terms or negotiate exit for business exigencies.'
        },
        {
          clauseTitle: 'Security Deposit Refund Timeline',
          clauseNumber: 'Clause 4',
          plainMeaning: 'Landlord must refund deposit upon physical handover of vacant possession.',
          impact: 'neutral',
          statutoryCaution: 'Demand interest penalty (e.g. 12% p.a.) if landlord delays deposit refund past 15 days.'
        }
      ],
      redFlags: [
        {
          severity: 'medium',
          issue: 'Lease exceeding 11 months without mandatory sub-registrar registration',
          legalRisk: 'Under Section 49 of Registration Act 1908, unregistered leases are inadmissible as primary evidence of tenancy in court.',
          statutoryReference: 'Registration Act 1908 Section 17(1)(d)',
          recommendedRemedy: 'Execute registered lease deed paying appropriate state stamp duty.'
        }
      ],
      actionChecklist: [
        {
          id: 'act-lease-1',
          task: 'Verify Landlord title deeds, electricity bill, and property tax receipt for commercial zoning clearance.',
          timelineHint: 'Prior to signing',
          responsibleParty: 'Tenant',
          completed: false
        },
        {
          id: 'act-lease-2',
          task: 'Obtain No Objection Certificate (NOC) from landlord for GST and Shop Act registration.',
          timelineHint: 'At signing',
          responsibleParty: 'Landlord',
          completed: false
        }
      ],
      statutoryRemedies: [
        'Notice of specific performance under Specific Relief Act 1963.',
        'Deposit recovery suit under Order 37 of Code of Civil Procedure (Summary Suit).'
      ],
      verifiedSources: sources
    };
  }

  // General default document analysis
  return {
    documentTitle: fileName || 'Indian Legal Agreement / Document',
    documentType: 'Commercial Legal Instrument',
    governingLaw: 'Indian Contract Act, 1872',
    executiveSummary: 'This document sets out reciprocal promises, rights, duties, and statutory obligations between the signing parties.',
    plainLanguageExplanation: 'A legally binding agreement enforceable under Section 10 of the Indian Contract Act 1872, requiring free consent, lawful consideration, and lawful object.',
    riskRating: 'Moderate',
    keyClauses: [
      {
        clauseTitle: 'Governing Law and Dispute Resolution',
        clauseNumber: 'Jurisdiction',
        plainMeaning: 'Specifies which city courts or arbitration tribunal has exclusive jurisdiction.',
        impact: 'neutral',
        statutoryCaution: 'Ensure seat of arbitration is in your home city to avoid travelling costs.'
      },
      {
        clauseTitle: 'Limitation of Liability & Indemnity',
        clauseNumber: 'Liability',
        plainMeaning: 'Caps the financial damages either party can claim in case of breach.',
        impact: 'favorable',
        statutoryCaution: 'Never agree to uncapped unilateral indemnity.'
      }
    ],
    redFlags: [
      {
        severity: 'low',
        issue: 'Check proper stamp duty payment under State Stamp Act',
        legalRisk: 'Inadequately stamped agreements are liable to impounding under Section 33 of Indian Stamp Act 1899.',
        statutoryReference: 'Indian Stamp Act, 1899',
        recommendedRemedy: 'Ensure e-stamping of requisite state value prior to execution.'
      }
    ],
    actionChecklist: [
      {
        id: 'act-gen-1',
        task: 'Confirm legal capacity and board resolution of signatories.',
        timelineHint: 'Immediate',
        responsibleParty: 'Legal Counsel',
        completed: false
      }
    ],
    statutoryRemedies: [
      'Arbitration under Arbitration and Conciliation Act 1996 if dispute clause is present.',
      'Civil suit for injunction or damages.'
    ],
    verifiedSources: sources
  };
}
