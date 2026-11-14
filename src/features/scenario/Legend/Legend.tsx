import { useTranslation } from 'react-i18next';

export default function Legend() {
  const { t } = useTranslation();
  return (
    <section data-stub="Legend">
      <ul>
        <li>{t('scenario.legend.sun')}</li>
        <li>{t('scenario.legend.earth')}</li>
        <li>{t('scenario.legend.horizon')}</li>
      </ul>
    </section>
  );
}
