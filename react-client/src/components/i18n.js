import i8n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

i8n.use(Backend).use(LanguageDetector).use(initReactI18next).init({
    backend: {
        //translation file path
        loadPath: '/assets/i18n/{{ns}}/{{lng}}.json',
    },
    fallbackLng: 'en',
    debug: false,
    ns: ['common'],

    interpolation: {
        escapeValue: false, // not needed for react!!
        formatSeparator: ',',
    },
    react: {
        wait: true,
    },
});

// Set language attribute on HTML element when language changes
i8n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
    document.documentElement.setAttribute('lang', lng);
});

// Set initial language attribute
document.documentElement.lang = i8n.language;
document.documentElement.setAttribute('lang', i8n.language);

export default i8n;