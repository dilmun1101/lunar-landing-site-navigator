import { useTranslation } from 'react-i18next';

export default function ScenarioCard() {
  const { t } = useTranslation();
  return (
    <section data-stub="ScenarioCard">
      <ul>
        <li>{t('compare.card.solarElevation')}</li>
        <li>{t('compare.card.sunlightDuration')}</li>
        <li>{t('compare.card.earthWindow')}</li>
        <li>{t('compare.card.remove')}</li>
      </ul>
    </section>
  );
}
