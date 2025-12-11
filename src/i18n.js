import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import navbar_en from "./locales/en/navbar.json";
import navbar_vi from "./locales/vi/navbar.json";

import settings_en from "./locales/en/settings.json";
import settings_vi from "./locales/vi/settings.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        navbar: navbar_en,
        settings: settings_en
      },
      vi: {
        navbar: navbar_vi,
        settings: settings_vi
      }
    },

    lng: localStorage.getItem("lang") || "vi",
    fallbackLng: "vi",

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
