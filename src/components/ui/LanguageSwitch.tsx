import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '@/i18n/i18n';

export default function LanguageSwitch() {
  const { t, i18n } = useTranslation();

  return (
    <div role="group" aria-label={t('common.language')} className="flex gap-1">
      {supportedLanguages.map((lng) => (
        <button
          key={lng}
          type="button"
          aria-pressed={i18n.resolvedLanguage === lng}
          onClick={() => void i18n.changeLanguage(lng)}
          className="rounded px-2 py-1 text-sm aria-pressed:bg-white/15"
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
