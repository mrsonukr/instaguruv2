import React, { useEffect } from "react";
import Header from "../components/Header";
import { Mail, Smartphone, Clock } from "lucide-react";
import siteConfig from "../config/siteConfig";
import { updatePageSEO } from "../utils/seoUtils";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    // Update SEO for contact page
    updatePageSEO('contact');
  }, []);

  return (
    <div>
      <Header />
      <main className="container mt-12 mx-auto px-4 py-8">
        <section className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-800 mb-2">{t('contactUs')}</h1>
          <p className="text-sm text-gray-600">
            {t('contactMessage')}
          </p>
        </section>

        <section className="flex flex-col md:flex-row items-center justify-center gap-4">
          {/* Email */}
          <div className="bg-primary-50 px-4 py-3 rounded-lg  flex items-center gap-3 w-full md:w-auto">
            <Mail className="w-5 h-5 text-primary-600" />
            <div className="text-left text-sm">
              <p className="font-semibold text-gray-800">{t('email')}</p>
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="text-primary-600 hover:underline"
              >
                {siteConfig.supportEmail}
              </a>
            </div>
          </div>

          {/* 24/7 Support */}
          <div className="bg-primary-50 px-4 py-3 rounded-lg  flex items-center gap-3 w-full md:w-auto">
            <Clock className="w-5 h-5 text-primary-600" />
            <div className="text-left text-sm">
              <p className="font-semibold text-gray-800">{t('support')}</p>
              <p className="text-gray-600">{t('supportAvailable')}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;