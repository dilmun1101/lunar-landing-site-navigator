import { useTranslation } from 'react-i18next';

export default function Badge() {
  const { t } = useTranslation();
  return (
    <section data-stub="Badge">
      <ul>
        <li>{t('verdict.viable')}</li>
        <li>{t('verdict.marginal')}</li>
        <li>{t('verdict.notViable')}</li>
      </ul>
    </section>
  );
}
