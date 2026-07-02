import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { createElement } from 'react';
import { languageToLocale, translate, type Language } from './translations';

export type { Language } from './translations';
export { LANGUAGE_LABELS } from './translations';

interface LanguageContextValue {
  language: Language;
  locale: string;
  setLanguage: (l: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface ProviderProps {
  language: Language;
  onChange: (l: Language) => void;
  children: ReactNode;
}

export function LanguageProvider({ language, onChange, children }: ProviderProps) {
  const value = useMemo<LanguageContextValue>(
    () => ({ language, locale: languageToLocale(language), setLanguage: onChange }),
    [language, onChange]
  );
  return createElement(LanguageContext.Provider, { value }, children);
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback for safety — components should always be inside a provider.
    return {
      language: 'en',
      locale: 'en-US',
      setLanguage: () => {},
    };
  }
  return ctx;
}

export function useLocale(): string {
  return useLanguage().locale;
}

/** Returns a stable translation function bound to the current language. */
export function useT(): (key: string, params?: Record<string, string | number>) => string {
  const { language } = useLanguage();
  return useCallback((key, params) => translate(language, key, params), [language]);
}
