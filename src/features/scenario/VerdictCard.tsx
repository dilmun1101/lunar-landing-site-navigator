import { useTranslation } from 'react-i18next';

export default function VerdictCard() {
  const { t } = useTranslation();
  return (
    <section data-stub="VerdictCard">
      <h3>{t('scenario.verdict.title')}</h3>
      <ul>
        <li>{t('verdict.viable')}</li>
        <li>{t('scenario.verdict.sunlight')}</li>
        <li>{t('scenario.verdict.earthLink')}</li>
        <li>{t('scenario.verdict.earthLinkExpert')}</li>
      </ul>
    </section>
  );
}
