import { useTranslation } from 'react-i18next';

export default function ViabilityTimeline() {
  const { t } = useTranslation();
  return (
    <section data-stub="ViabilityTimeline">
      <h3>{t('scenario.timeline.title')}</h3>
      <ul>
        <li>{t('scenario.timeline.sunAbove')}</li>
        <li>{t('scenario.timeline.earthAbove')}</li>
        <li>{t('scenario.timeline.window')}</li>
        <li>{t('scenario.timeline.play')}</li>
        <li>{t('scenario.timeline.pause')}</li>
        <li>{t('scenario.timeline.speed')}</li>
      </ul>
    </section>
  );
}
