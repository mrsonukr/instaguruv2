import React, { useEffect } from "react";
import Header from "../components/Header";
import { Users, BadgeCheck, Tv, ShieldCheck, Smile } from "lucide-react";
import siteConfig from "../config/siteConfig";
import { updatePageSEO } from "../utils/seoUtils";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    // Update SEO for about page
    updatePageSEO('about');
  }, []);

  return (
    <div>
      <Header />
      <main className="container mx-auto mt-12 px-4 py-12">
        <section className="text-center mb-16">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('aboutUs')}</h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            {t('aboutWelcome', { siteName: siteConfig.siteName })}
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
            {t('ourMission')}
          </h2>
          <p className="text-sm text-gray-700 max-w-3xl mx-auto text-center">
            {t('missionText')}
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
            {t('whyChooseUs')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-5 rounded-xl  text-center">
              <Users className="mx-auto text-green-600 mb-3" size={32} />
              <h3 className="font-bold text-gray-800 mb-2">
                {t('realGrowth')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('realGrowthText')}
              </p>
            </div>
            <div className="bg-green-50 p-5 rounded-xl  text-center">
              <BadgeCheck className="mx-auto text-green-600 mb-3" size={32} />
              <h3 className="font-bold text-gray-800 mb-2">
                {t('twoYearsExcellence')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('twoYearsText')}
              </p>
            </div>
            <div className="bg-green-50 p-5 rounded-xl  text-center">
              <Tv className="mx-auto text-green-600 mb-3" size={32} />
              <h3 className="font-bold text-gray-800 mb-2">
                {t('comprehensiveOTT')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('comprehensiveOTTText')}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
            {t('ourCommitment')}
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <ShieldCheck className="mx-auto text-green-600 mb-3" size={32} />
            <p className="text-sm text-gray-700">
              {t('commitmentText')}
            </p>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('joinThousands')}
          </h2>
          <Smile className="mx-auto text-green-600 mb-3" size={32} />
          <p className="text-sm text-gray-700 max-w-xl mx-auto mb-6">
            {t('joinThousandsText')}
          </p>
          <a
            href="/"
            className="inline-block bg-green-500 text-white font-medium py-2 px-5 rounded-lg hover:bg-green-600 transition duration-300"
          >
            {t('getStartedNow')}
          </a>
        </section>
      </main>
    </div>
  );
};

export default About;