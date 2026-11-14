import { useTranslation } from 'react-i18next';

export default function BestAlternativeHint() {
  const { t } = useTranslation();
  return (
    <section data-stub="BestAlternativeHint">
      <h3>{t('compare.best.title')}</h3>
      <p>{t('compare.best.text', { days: 3, percent: 14 })}</p>
    </section>
  );
}
