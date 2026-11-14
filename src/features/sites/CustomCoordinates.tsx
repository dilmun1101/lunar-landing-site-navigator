import { useTranslation } from 'react-i18next';

export default function CustomCoordinates() {
  const { t } = useTranslation();
  return (
    <section data-stub="CustomCoordinates">
      <h3>{t('sites.custom.title')}</h3>
      <ul>
        <li>{t('sites.custom.lat')}</li>
        <li>{t('sites.custom.lon')}</li>
        <li>{t('sites.custom.apply')}</li>
      </ul>
    </section>
  );
}
