import { useEffect, useState } from "react";
import Header from "../components/Header";
import AutoSlider from "../components/AutoSlider";
import ItemCard from "../components/ui/ItemCard";
import channels from "../data/categories.json";
import Footer from "../components/ui/Footer";
import { updatePageSEO, addStructuredData } from "../utils/seoUtils";
import { useLanguage } from "../context/LanguageContext";
import { translateCategories } from "../utils/translationUtils";
import { useTranslation } from "react-i18next";
import WhatsAppButton from "../components/ui/WhatsAppButton";

const Home = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [processedChannels, setProcessedChannels] = useState(channels);

  useEffect(() => {
    updatePageSEO("home");
    addStructuredData("organization");
    addStructuredData("website");
    setProcessedChannels(channels);
  }, []);

  useEffect(() => {
    const translatedChannels = translateCategories(channels, language);
    setProcessedChannels(translatedChannels);
  }, [language]);

  return (
    <>
      <Header />
      <div className="mt-20"></div>
      <AutoSlider />

      <div className="flex justify-center mb-2 gap-4 items-center mt-2 m-4 bg-red-200 p-3 rounded-lg">
        <a
          href="https://www.youtube.com/shorts/ooX_6PNNEh0"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 28.57 20"
            width="32"
            height="22"
            aria-hidden="true"
          >
            <path
              d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 0 14.285 0 14.285 0C14.285 0 5.35042 0 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C0 5.35042 0 10 0 10C0 10 0 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"
              fill="#FF0000"
            />
            <path
              d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z"
              fill="#FFFFFF"
            />
          </svg>

          <p className="font-semibold text-black">
            {t("watchVideoHowToBuy")}
          </p>
        </a>
      </div>


      <div className="text-center mt-6 ">
        <p className="text-lg font-semibold mt-4 mb-2 gradient-text">
          {t("exploreServices")}
        </p>
      </div>

      {processedChannels.map((channel, index) => (
        <ItemCard key={index} {...channel} />
      ))}
      <Footer />
    </>
  );
};

export default Home;
