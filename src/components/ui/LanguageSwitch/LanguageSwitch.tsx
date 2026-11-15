import { useTranslation } from 'react-i18next';
import SegmentedControl from '@/components/ui/SegmentedControl/SegmentedControl';
import { supportedLanguages } from '@/i18n/i18n';

interface LanguageSwitchProps {
  className?: string;
}

export default function LanguageSwitch({ className }: LanguageSwitchProps) {
  const { t, i18n } = useTranslation();

  return (
    <SegmentedControl
      className={className}
      label={t('common.language')}
      options={supportedLanguages.map((lng) => ({
        value: lng,
        label: lng.toUpperCase(),
      }))}
      value={i18n.resolvedLanguage}
      onChange={(lng) => void i18n.changeLanguage(lng)}
    />
  );
}
