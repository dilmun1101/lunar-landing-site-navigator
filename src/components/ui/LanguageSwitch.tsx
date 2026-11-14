import { useTranslation } from 'react-i18next';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { supportedLanguages } from '@/i18n/i18n';

export default function LanguageSwitch() {
  const { t, i18n } = useTranslation();

  return (
    <SegmentedControl
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
