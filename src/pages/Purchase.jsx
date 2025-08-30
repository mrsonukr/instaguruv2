import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BsCheckCircleFill } from "react-icons/bs";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Header from "../components/Header";
import PurchaseForm from "../components/ui/PurchaseForm";
import servicesData from "../data/categories.json";
import { updatePageSEO } from "../utils/seoUtils";
import COLOR_VARIANTS from "../utils/colorVariants";
import { useLanguage } from "../context/LanguageContext";
import { getTranslation } from "../data/translations";
import { translateCategories, translatePackTitle, translatePackDescription } from "../utils/translationUtils";

const Purchase = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const [translatedServicesData, setTranslatedServicesData] = useState(servicesData);
  
  const pack = translatedServicesData
    .flatMap((service) => service.packs)
    .find((p) => p.id === parseInt(id));
  const service = translatedServicesData.find((s) =>
    s.packs.some((p) => p.id === parseInt(id))
  );

  useEffect(() => {
    if (pack && service) {
      // Update SEO for purchase page
      updatePageSEO('purchase', pack);
    }
  }, [pack, service]);

  // Translate services data when language changes
  useEffect(() => {
    const translated = translateCategories(servicesData, language);
    setTranslatedServicesData(translated);
  }, [language]);

  const benefits = [
    { id: 1, message: getTranslation('highQualityFollowers', language) },
    { id: 2, message: getTranslation('fastDeliveryGuaranteed', language) },
    { id: 3, message: getTranslation('safeSecureService', language) },
    { id: 4, message: getTranslation('customerSupport247', language) },
    { id: 5, message: getTranslation('noPasswordRequired', language) },
    { id: 6, message: getTranslation('satisfactionGuarantee', language) },
  ];

  if (!pack || !service) {
    return (
      <div>
        <Header />
        <div className="mt-20 m-4 text-center">
          <p className="text-lg font-semibold text-gray-800">{getTranslation('packNotFound', language)}</p>
        </div>
      </div>
    );
  }

  const variant = COLOR_VARIANTS[service.color] || COLOR_VARIANTS.red;
  return (
    <div>
      <Header />
      <div className="mt-20 m-4">
        {/* Pack Details Card */}
        <div className={`flex items-center ${variant.cardBg} rounded-lg p-4 w-full mb-4`}>
          <div className="flex-shrink-0 flex items-center">
            <img
              src={service.logo}
              alt={`${service.name} logo`}
              className="h-12 w-12 rounded-full object-cover"
              onError={(e) => {
                e.target.src = '/ic/logo.svg';
              }}
            />
          </div>
          <div className="flex flex-col flex-grow pl-4 pr-4 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 truncate">
              {translatePackTitle(pack.title, language)}
            </h3>
            <p className="text-xs text-gray-600 mt-1 truncate">{translatePackDescription(pack.description, language)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {service.name} • {getTranslation(`${service.slug}.filters.${pack.filter.toLowerCase()}`, language)}
            </p>
          </div>
          <div
            className={`flex-shrink-0 text-white text-sm px-4 py-2 rounded-full flex items-center gap-1 ${variant.buttonBg}`}
          >
            {pack.price}₹
          </div>
        </div>

        <PurchaseForm
          serviceData={service}
          color={service.color}
          filter={pack.filter}
          packPrice={pack.price}
          packTitle={pack.title}
          onSubmit={(link) => console.log("Submitted:", link)}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 m-4 mt-8">
        {benefits.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <BsCheckCircleFill className="text-green-500 text-sm" />
            <p className="text-xs font-semibold text-gray-800">
              {item.message}
            </p>
          </div>
        ))}
      </div>
      <div>
        <div className="text-center mt-6">
          <p className="text-lg font-semibold mt-4 mb-2 gradient-text">
            {getTranslation('howToUse', language)}
          </p>
        </div>
        <div className="m-4 rounded-2xl overflow-hidden aspect-video">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/NyqkkX0-v60"
            title="How to Use"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Purchase;