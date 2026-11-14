import { useTranslation } from 'react-i18next';

export default function HorizonPanorama() {
  const { t } = useTranslation();
  return (
    <section data-stub="HorizonPanorama">
      <h3>{t('scenario.panorama.title')}</h3>
    </section>
  );
}
