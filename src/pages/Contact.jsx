import React, { useEffect } from "react";
import Header from "../components/Header";
import { Mail, Smartphone, Clock } from "lucide-react";
import siteConfig from "../config/siteConfig";
import { updatePageSEO } from "../utils/seoUtils";
import { useLanguage } from "../context/LanguageContext";
import { getTranslation } from "../data/translations";

const Contact = () => {
  const { language } = useLanguage();
  
  useEffect(() => {
    // Update SEO for contact page
    updatePageSEO('contact');
  }, []);

  return (
    <div>
      <Header />
      <main className="container mt-12 mx-auto px-4 py-8">
        <section className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-800 mb-2">{getTranslation('contactUs', language)}</h1>
          <p className="text-sm text-gray-600">
            {getTranslation('contactMessage', language)}
          </p>
        </section>

        <section className="flex flex-col md:flex-row items-center justify-center gap-4">
          {/* Email */}
          <div className="bg-green-50 px-4 py-3 rounded-lg  flex items-center gap-3 w-full md:w-auto">
            <Mail className="w-5 h-5 text-green-600" />
            <div className="text-left text-sm">
              <p className="font-semibold text-gray-800">{getTranslation('email', language)}</p>
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="text-green-600 hover:underline"
              >
                {siteConfig.supportEmail}
              </a>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bg-green-50 px-4 py-3 rounded-lg  flex items-center gap-3 w-full md:w-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="100"
              height="100"
              viewBox="0 0 24 24"
              fill="#16A34A"
              className="h-5 w-5"
            >
              <path d="M 12 2 C 6.5 2 2 6.5 2 12 C 2 13.8 2.5007813 15.5 3.3007812 17 L 2 22 L 7.1992188 20.800781 C 8.6992188 21.600781 10.3 22 12 22 C 17.5 22 22 17.5 22 12 C 22 9.3 20.999609 6.8003906 19.099609 4.9003906 C 17.199609 3.0003906 14.7 2 12 2 z M 12 4 C 14.1 4 16.099219 4.8007813 17.699219 6.3007812 C 19.199219 7.9007813 20 9.9 20 12 C 20 16.4 16.4 20 12 20 C 10.7 20 9.2992188 19.7 8.1992188 19 L 7.5 18.599609 L 6.8007812 18.800781 L 4.8007812 19.300781 L 5.3007812 17.5 L 5.5 16.699219 L 5.0996094 16 C 4.3996094 14.8 4 13.4 4 12 C 4 7.6 7.6 4 12 4 z M 8.5 7.4003906 C 8.3 7.4003906 8.0007812 7.3992188 7.8007812 7.6992188 C 7.5007813 7.9992188 6.9003906 8.6007813 6.9003906 9.8007812 C 6.9003906 11.000781 7.8003906 12.200391 7.9003906 12.400391 C 8.1003906 12.600391 9.6992188 15.199219 12.199219 16.199219 C 14.299219 16.999219 14.699219 16.800781 15.199219 16.800781 C 15.699219 16.700781 16.700391 16.199609 16.900391 15.599609 C 17.100391 14.999609 17.099219 14.499219 17.199219 14.199219 C 17.099219 14.099219 16.999219 14.000391 16.699219 13.900391 C 16.499219 13.800391 15.3 13.199609 15 13.099609 C 14.7 12.999609 14.600391 12.899219 14.400391 13.199219 C 14.200391 13.499219 13.699609 13.999219 13.599609 14.199219 C 13.499609 14.399219 13.399609 14.400781 13.099609 14.300781 C 12.899609 14.200781 12.099609 13.999609 11.099609 13.099609 C 10.299609 12.499609 9.7992187 11.700391 9.6992188 11.400391 C 9.4992187 11.200391 9.7007813 11.000391 9.8007812 10.900391 L 10.199219 10.5 C 10.299219 10.4 10.300391 10.199609 10.400391 10.099609 C 10.500391 9.9996094 10.500391 9.8992188 10.400391 9.6992188 C 10.300391 9.4992187 9.7996094 8.3007812 9.5996094 7.8007812 C 9.3996094 7.4007812 9.2 7.4003906 9 7.4003906 L 8.5 7.4003906 z"></path>
            </svg>
            <div className="text-left text-sm">
              <p className="font-semibold text-gray-800">{getTranslation('whatsapp', language)}</p>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                {siteConfig.supportPhone}
              </a>
            </div>
          </div>

          {/* 24/7 Support */}
          <div className="bg-green-50 px-4 py-3 rounded-lg  flex items-center gap-3 w-full md:w-auto">
            <Clock className="w-5 h-5 text-green-600" />
            <div className="text-left text-sm">
              <p className="font-semibold text-gray-800">{getTranslation('support', language)}</p>
              <p className="text-gray-600">{getTranslation('supportAvailable', language)}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;