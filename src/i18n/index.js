import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import vi from "./vi.json";
import en from "./en.json";
import cn from "./cn.json";
import jp from "./jp.json";
import de from "./de.json";
import fr from "./fr.json";

const resources = {
  vi: { translation: vi },
  en: { translation: en },
  cn: { translation: cn },
  jp: { translation: jp },
  de: { translation: de },
  fr: { translation: fr }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("lang") || "vi",
  interpolation: { escapeValue: false }
});

export default i18n;
