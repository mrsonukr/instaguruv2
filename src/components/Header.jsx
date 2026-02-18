import React, { useState } from "react";
import { FiMenu, FiHome, FiPhone, FiInfo, FiShare2, FiPackage, FiCreditCard } from "react-icons/fi";
import { Link } from "react-router-dom";
import siteConfig from "../config/siteConfig";
import { clearConsole } from "../utils/consoleUtils";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { language, toggleLanguage, getDefaultLanguage } = useLanguage();
  const { t } = useTranslation();

  const toggleSidebar = () => {
    // Clear console when opening/closing sidebar
    clearConsole();
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSwitch = () => {
    toggleLanguage();
  };

  return (
    <>
      {/* Header with Logo and Menu Icon */}
      <header className="flex justify-between items-center p-4 bg-white text-black fixed top-0 w-full z-30">
        <div className="logo">
          <Link to="/">
            <img
              src={siteConfig.logoPath}
              alt={`${siteConfig.siteName} Logo`}
              className="h-8 w-auto"
            />
          </Link>
        </div>
        
        {/* Switch and Menu Icon Container */}
        <div className="flex items-center gap-3">
          {/* Switch */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {language === 'hi' ? "हिंदी" : "ENG"}
            </span>
            <button
              onClick={toggleSwitch}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                language === 'hi' ? 'bg-green-600' : 'bg-gray-200'
              }`}
              title={`Current: ${language === 'hi' ? 'Hindi' : 'English'} | Default: ${getDefaultLanguage() === 'hi' ? 'Hindi' : 'English'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  language === 'hi' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {/* Menu Icon */}
          <div
            className="menu-icon cursor-pointer p-2 rounded-full hover:bg-green-200 transition-colors duration-200"
            onClick={toggleSidebar}
          >
            <FiMenu className="h-6 w-6" />
          </div>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300 ease-in-out z-40 ${
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 w-72 h-full rounded-r-3xl bg-white/95 backdrop-blur-lg shadow-2xl pt-6 transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <img
          src={siteConfig.logoPath}
          alt={`${siteConfig.siteName} Logo`}
          className="mx-6 mb-4 h-8 w-auto"
        />
        <ul className="list-none p-0 m-0">
          <li>
            <Link
              to="/"
              className="flex items-center p-4 border-b border-gray-200 hover:bg-green-50 transition-colors duration-200 gap-3 text-gray-800 font-medium no-underline"
            >
              <FiHome className="w-6 h-6 text-green-500" />
              {t('home')}
            </Link>
          </li>
          <li>
            <Link
              to="/orders"
              className="flex items-center p-4 border-b border-gray-200 hover:bg-green-50 transition-colors duration-200 gap-3 text-gray-800 font-medium no-underline"
            >
              <FiPackage className="w-6 h-6 text-green-500" />
              {t('myOrders')}
            </Link>
          </li>
          <li>
            <Link
              to="/refer"
              className="flex items-center p-4 border-b border-gray-200 hover:bg-green-50 transition-colors duration-200 gap-3 text-gray-800 font-medium no-underline"
            >
              <FiShare2 className="w-6 h-6 text-green-500" />
              {t('refer')}
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              rel="noopener noreferrer"
              className="flex items-center p-4 border-b border-gray-200 hover:bg-green-50 transition-colors duration-200 gap-3 text-gray-800 font-medium no-underline"
            >
              <FiPhone className="w-6 h-6 text-green-500" />
              {t('contactUs')}
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="flex items-center p-4 border-b border-gray-200 hover:bg-green-50 transition-colors duration-200 gap-3 text-gray-800 font-medium no-underline"
            >
              <FiInfo className="w-6 h-6 text-green-500" />
              {t('about')}
            </Link>
          </li>
        </ul>
      </aside>
    </>
  );
};

export default Header;