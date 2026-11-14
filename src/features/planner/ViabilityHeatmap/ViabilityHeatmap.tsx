import { useTranslation } from 'react-i18next';

export default function ViabilityHeatmap() {
  const { t } = useTranslation();
  return (
    <section data-stub="ViabilityHeatmap">
      <h3>{t('planner.heatmap.title')}</h3>
      <ul>
        <li>{t('planner.heatmap.rows')}</li>
        <li>{t('planner.heatmap.columns')}</li>
      </ul>
    </section>
  );
}
