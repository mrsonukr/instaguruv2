import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import PBanner from "../components/ui/PBanner";
import PackCard from "../components/ui/PackCard";
import PackFilter from "../components/ui/PackFilter";
import Suggestion from "../components/ui/Suggestion";
import data from "../data/categories.json";
import Footer from "../components/ui/Footer";
import { updatePageSEO, addStructuredData } from "../utils/seoUtils";
import { useLanguage } from "../context/LanguageContext";
import { translateCategories } from "../utils/translationUtils";
import { useTranslation } from "react-i18next";

const Products = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [translatedData, setTranslatedData] = useState(data);

  const selectedItem = translatedData.find((item) => item.slug === slug);

  // Redirect to home if service not found
  useEffect(() => {
    if (!selectedItem) {
      navigate("/");
    } else {
      // Update SEO for service page
      updatePageSEO('service', selectedItem);
      updatePageSEO(selectedItem.slug, selectedItem);
      
      // Add structured data for service
      addStructuredData('service', selectedItem);
    }
  }, [selectedItem, navigate]);

  // Translate data when language changes
  useEffect(() => {
    const translated = translateCategories(data, language);
    setTranslatedData(translated);
  }, [language]);
  
  if (!selectedItem) {
    return null; // Or a loader if needed
  }

  const currentService = selectedItem;

  // Get unique filter values from packs
  const packFilters = [
    ...new Set(currentService.packs.map((pack) => pack.filter)),
  ].sort(); // Sort for consistent order

  // Filter packs based on selected filter
  const filteredPacks =
    selectedFilter === "All"
      ? currentService.packs
      : currentService.packs.filter((pack) => pack.filter === selectedFilter);

  // Show offer packs at the top (offer === true), others follow
  const sortedPacks = [...filteredPacks].sort((a, b) => {
    const aOffer = !!a.offer;
    const bOffer = !!b.offer;
    if (aOffer === bOffer) return 0;
    return bOffer ? 1 : -1; // true comes before false
  });

  return (
    <div>
      <Header />
      <div className="mt-20">
        <PBanner
          key={currentService.slug}
          imageSrc={currentService.logo}
          altText={`${currentService.name} logo`}
          title={t('discoverPlans', { service: currentService.name })}
          description={currentService.description}
          color={currentService.color}
        />
        {/* <PackFilter/> */}
        <PackFilter
          packFilters={packFilters}
          onFilterChange={setSelectedFilter}
          variant={currentService.color}
          serviceSlug={currentService.slug}
        />
        <div className="m-4 mt-0 flex flex-col items-center">
          {sortedPacks.length > 0 ? (
            sortedPacks.map((pack) => (
              <PackCard
                key={pack.id}
                color={currentService.color}
                title={pack.title}
                description={pack.description}
                price={pack.price}
                link={`/purchase/${pack.id}`}
                logo={currentService.logo}
                packId={pack.id}
                offer={pack.offer}
              />
            ))
          ) : (
            <p className="text-gray-600">{t('noPlansAvailable')}</p>
          )}
        </div>
        <div className="text-center mt-6 mb-4 ">
          <p className="text-lg font-semibold mt-4 mb-2 gradient-text">
            {t('exploreServices')}
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {translatedData.map((service) => (
            <Link key={service.slug} to={`/${service.slug}`}>
              <Suggestion
                logo={service.logo}
                name={service.name}
                color={service.color}
              />
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Products;