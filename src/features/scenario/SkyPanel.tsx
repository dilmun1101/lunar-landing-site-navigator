import { useTranslation } from 'react-i18next';

export default function SkyPanel() {
  const { t } = useTranslation();
  return (
    <section data-stub="SkyPanel">
      <h3>{t('scenario.sky.title')}</h3>
      <ul>
        <li>{t('scenario.sky.polar')}</li>
        <li>{t('scenario.sky.panorama')}</li>
      </ul>
    </section>
  );
}
