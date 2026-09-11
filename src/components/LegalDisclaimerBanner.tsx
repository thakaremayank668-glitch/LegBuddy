import React, { useState } from 'react';
import { AlertCircle, X, ExternalLink } from 'lucide-react';
import { LanguageCode } from '../types';

interface DisclaimerBannerProps {
  language: LanguageCode;
}

export const LegalDisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ language }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const content = {
    en: {
      tag: 'Statutory Notice & AI Guidance',
      text: 'LegBuddy provides informational and procedural guidance based on official Indian laws and regulations. It is not a legal practice and does not replace qualified counsel (Advocate, CA, or CS) or official Government of India authorities.',
      action: 'Read Terms',
    },
    hi: {
      tag: 'वैधानिक सूचना एवं एआई मार्गदर्शन',
      text: 'लेगबडी (LegBuddy) आधिकारिक भारतीय कानूनों और नियमों के आधार पर केवल सूचनात्मक और प्रक्रियात्मक मार्गदर्शन प्रदान करता है। यह किसी नामांकित अधिवक्ता (वकील) या सरकारी प्राधिकरण की औपचारिक विधिक सलाह का विकल्प नहीं है।',
      action: 'विधिक नियम',
    },
    gu: {
      tag: 'કાનૂની સૂચના અને AI માર્ગદર્શન',
      text: 'LegBuddy અધિકૃત ભારતીય કાયદાઓ અને નિયમોના આધારે માત્ર માહિતી અને પ્રક્રિયાત્મક માર્ગદર્શન આપે છે. આ કોઈ નોંધાયેલા વકીલ અથવા સરકારી કચેરીની કાનૂની સલાહનું સ્થાન લેતું નથી.',
      action: 'નિયમો',
    },
  }[language];

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <p className="leading-snug">
            <span className="font-bold underline decoration-amber-400 mr-1.5">{content.tag}:</span>
            {content.text}
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <a
            href="https://nalsa.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center space-x-1 text-amber-800 hover:text-amber-950 font-semibold underline text-[11px]"
          >
            <span>Free Legal Aid (NALSA)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-700 hover:text-amber-950 p-1 rounded-md hover:bg-amber-100 transition-colors"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
