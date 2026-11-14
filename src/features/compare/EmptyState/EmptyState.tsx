import { useTranslation } from 'react-i18next';

export default function EmptyState() {
  const { t } = useTranslation();
  return (
    <section data-stub="EmptyState">
      <h3>{t('compare.empty.title')}</h3>
      <ul>
        <li>{t('compare.empty.hint')}</li>
      </ul>
    </section>
  );
}
