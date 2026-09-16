"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { i18n, Locale } from "@/i18n.config";

export function LanguageSwitcher() {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<Locale>(i18n.defaultLocale);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Read the cookie on mount to set the initial state
    const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'));
    if (match && match[2]) {
      const locale = match[2] as Locale;
      if (i18n.locales.includes(locale)) {
        setCurrentLocale(locale);
      }
    }
  }, []);

  const changeLanguage = (locale: Locale) => {
    // Set the cookie (expires in 1 year)
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    setCurrentLocale(locale);
    setIsOpen(false);
    
    // Refresh the page to trigger Server Components to re-render with the new locale
    router.refresh();
  };

  const languageNames: Record<Locale, string> = {
    es: "🇪🇸 Español",
    en: "🇺🇸 English",
    fr: "🇫🇷 Français",
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center w-full rounded-md border border-nordic-dark/10 shadow-sm px-3 py-1 bg-background-light text-sm font-medium text-nordic-dark hover:bg-nordic-dark/5 focus:outline-none transition-colors"
          id="menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {languageNames[currentLocale]}
          <span className="material-icons text-sm ml-1">expand_more</span>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-background-light ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            {i18n.locales.map((locale) => (
              <button
                key={locale}
                onClick={() => changeLanguage(locale)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currentLocale === locale
                    ? "bg-mosque/10 text-mosque font-semibold"
                    : "text-nordic-dark hover:bg-nordic-dark/5"
                }`}
                role="menuitem"
                tabIndex={-1}
              >
                {languageNames[locale]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
