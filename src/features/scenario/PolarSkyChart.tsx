import { useTranslation } from 'react-i18next';

export default function PolarSkyChart() {
  const { t } = useTranslation();
  return (
    <section data-stub="PolarSkyChart">
      <h3>{t('scenario.polar.title')}</h3>
      <ul>
        <li>{t('scenario.polar.north')}</li>
        <li>{t('scenario.polar.east')}</li>
        <li>{t('scenario.polar.south')}</li>
        <li>{t('scenario.polar.west')}</li>
      </ul>
    </section>
  );
}
