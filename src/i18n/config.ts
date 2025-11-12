import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';

const LANGUAGE_STORAGE_KEY = 'fin-language-preference';

// Get saved language or browser language
const getSavedLanguage = (): string => {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved) return saved;

  // Try to match browser language
  const browserLang = navigator.language;
  if (browserLang.startsWith('pt')) return 'pt-BR';
  if (browserLang.startsWith('es')) return 'es-ES';
  if (browserLang.startsWith('en')) return 'en-US';

  return 'pt-BR'; // Default
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      'en-US': { translation: enUS },
      'es-ES': { translation: esES },
    },
    lng: getSavedLanguage(),
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  document.documentElement.lang = lng;
});

export default i18n;
