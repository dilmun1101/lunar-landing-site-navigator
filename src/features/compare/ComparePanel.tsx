import { useTranslation } from 'react-i18next';

export default function ComparePanel() {
  const { t } = useTranslation();
  return (
    <section data-stub="ComparePanel">
      <h3>{t('compare.title')}</h3>
    </section>
  );
}
