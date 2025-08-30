import { Clock } from "lucide-react";
import siteConfig from "../../config/siteConfig";
import { useLanguage } from "../../context/LanguageContext";
import { getTranslation } from "../../data/translations";

const PayInfo = () => {
  const { language } = useLanguage();
  
  return (
    <div className="font-semibold text-slate-800 ">
      <h3>{getTranslation('instruction', language)}</h3>
      <ul className="list-decimal pl-5 space-y-2 mt-4 text-sm">
        <li>
          {getTranslation('enterAmountAbove', language).replace('{amount}', siteConfig.minimumAmount)}{" "}
          <span className="text-green-600">{getTranslation('minAmount', language).replace('{amount}', siteConfig.minimumAmount)}</span>
        </li>
        <li>{getTranslation('scanQRCodeAndPay', language)}</li>
        <li>
          {getTranslation('paymentsProcessedAutomatically', language)}
        </li>
      </ul>

      <div className="flex items-start gap-3 mt-4 bg-sky-50 text-green-800 border border-green-200 rounded-xl p-4">
        <Clock className="w-5 h-5 mt-1 text-green-500" />
        <div className="text-sm leading-relaxed">
          {getTranslation('fundsAddedAutomatically', language)}
        </div>
      </div>
    </div>
  );
};

export default PayInfo;