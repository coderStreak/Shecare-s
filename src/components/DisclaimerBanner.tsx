import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DisclaimerBannerProps {
  language?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ language = 'en' }) => {
  const disclaimerText = {
    en: "SheCare's provides educational information and care navigation. It does not diagnose conditions or replace professional medical advice.",
    kn: "ಶಿ ಕೇರ್ಸ್ (SheCare's) ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿ ಮತ್ತು ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ. ಇದು ರೋಗನಿರ್ಣಯ ಮಾಡುವುದಿಲ್ಲ ಅಥವಾ ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಸಲಹೆಗೆ ಬದಲಿಯಾಗಿರುವುದಿಲ್ಲ.",
    hi: "शीकेयर्स (SheCare's) केवल शैक्षिक जानकारी और स्वास्थ्य मार्गदर्शन प्रदान करता है। यह किसी बीमारी का निदान नहीं करता है और न ही डॉक्टर की सलाह का विकल्प है।"
  };

  const text = disclaimerText[language as keyof typeof disclaimerText] || disclaimerText.en;

  return (
    <aside aria-label="Medical Educational Disclaimer" className="bg-rose-50/90 border-b border-rose-200/80 px-4 py-2 text-xs text-rose-800 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
          <p className="font-medium leading-snug">{text}</p>
        </div>
        <div className="shrink-0 hidden sm:flex items-center gap-3 text-[11px] font-semibold text-rose-700">
          <span>Emergency: <a href="tel:112" className="underline hover:text-rose-900 font-bold">112</a> / <a href="tel:108" className="underline hover:text-rose-900 font-bold">108</a></span>
          <span className="text-rose-300">|</span>
          <span>Women Helpline: <a href="tel:181" className="underline hover:text-rose-900 font-bold">181</a></span>
        </div>
      </div>
    </aside>
  );
};
