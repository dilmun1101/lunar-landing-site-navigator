import { useTranslation } from 'react-i18next';

export default function SitePicker() {
  const { t } = useTranslation();
  return (
    <section data-stub="SitePicker">
      <h3>{t('sites.title')}</h3>
      <ul>
        <li>{t('sites.search')}</li>
        <li>{t('sites.groups.apollo')}</li>
        <li>{t('sites.groups.clps')}</li>
        <li>{t('sites.groups.international')}</li>
        <li>{t('common.addToComparison')}</li>
      </ul>
    </section>
  );
}
