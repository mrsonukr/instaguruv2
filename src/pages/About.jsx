import React, { useEffect } from "react";
import Header from "../components/Header";
import { Users, BadgeCheck, Tv, ShieldCheck, Smile } from "lucide-react";
import siteConfig from "../config/siteConfig";
import { updatePageSEO } from "../utils/seoUtils";
import { useLanguage } from "../context/LanguageContext";
import { getTranslation } from "../data/translations";

const About = () => {
  const { language } = useLanguage();
  
  useEffect(() => {
    // Update SEO for about page
    updatePageSEO('about');
  }, []);

  return (
    <div>
      <Header />
      <main className="container mx-auto mt-12 px-4 py-12">
        <section className="text-center mb-16">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{getTranslation('aboutUs', language)}</h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {getTranslation('aboutWelcome', language).replace('{siteName}', siteConfig.siteName)}
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
            {getTranslation('ourMission', language)}
          </h2>
          <p className="text-sm text-gray-700 max-w-3xl mx-auto text-center">
            {getTranslation('missionText', language)}
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
            {getTranslation('whyChooseUs', language)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-5 rounded-xl  text-center">
              <Users className="mx-auto text-green-600 mb-3" size={32} />
              <h3 className="font-bold text-gray-800 mb-2">
                {getTranslation('realGrowth', language)}
              </h3>
              <p className="text-sm text-gray-600">
                {getTranslation('realGrowthText', language)}
              </p>
            </div>
            <div className="bg-green-50 p-5 rounded-xl  text-center">
              <BadgeCheck className="mx-auto text-green-600 mb-3" size={32} />
              <h3 className="font-bold text-gray-800 mb-2">
                {getTranslation('twoYearsExcellence', language)}
              </h3>
              <p className="text-sm text-gray-600">
                {getTranslation('twoYearsText', language)}
              </p>
            </div>
            <div className="bg-green-50 p-5 rounded-xl  text-center">
              <Tv className="mx-auto text-green-600 mb-3" size={32} />
              <h3 className="font-bold text-gray-800 mb-2">
                {getTranslation('comprehensiveOTT', language)}
              </h3>
              <p className="text-sm text-gray-600">
                {getTranslation('comprehensiveOTTText', language)}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
            {getTranslation('ourCommitment', language)}
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <ShieldCheck className="mx-auto text-green-600 mb-3" size={32} />
            <p className="text-sm text-gray-700">
              {getTranslation('commitmentText', language)}
            </p>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {getTranslation('joinThousands', language)}
          </h2>
          <Smile className="mx-auto text-green-600 mb-3" size={32} />
          <p className="text-sm text-gray-700 max-w-xl mx-auto mb-6">
            {getTranslation('joinThousandsText', language)}
          </p>
          <a
            href="/"
            className="inline-block bg-green-500 text-white font-medium py-2 px-5 rounded-lg hover:bg-green-600 transition duration-300"
          >
            {getTranslation('getStartedNow', language)}
          </a>
        </section>
      </main>
    </div>
  );
};

export default About;