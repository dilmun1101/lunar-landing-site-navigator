import { useTranslation } from 'react-i18next';

export default function HeatmapTooltip() {
  const { t } = useTranslation();
  return (
    <section data-stub="HeatmapTooltip">
      <ul>
        <li>{t('planner.tooltip.site')}</li>
        <li>{t('planner.tooltip.date')}</li>
        <li>{t('planner.tooltip.value')}</li>
      </ul>
    </section>
  );
}
