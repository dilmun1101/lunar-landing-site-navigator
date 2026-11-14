import { useTranslation } from 'react-i18next';

export default function MetricToggle() {
  const { t } = useTranslation();
  return (
    <section data-stub="MetricToggle">
      <h3>{t('planner.metric.title')}</h3>
      <ul>
        <li>{t('planner.metric.sunlight')}</li>
        <li>{t('planner.metric.comms')}</li>
      </ul>
    </section>
  );
}
