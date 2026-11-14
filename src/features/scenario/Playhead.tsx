import { useTranslation } from 'react-i18next';

export default function Playhead() {
  const { t } = useTranslation();
  return (
    <section data-stub="Playhead">
      <h3>{t('scenario.playhead.now')}</h3>
    </section>
  );
}
