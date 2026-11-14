import { useTranslation } from 'react-i18next';

export default function ModeSwitch() {
  const { t } = useTranslation();
  return (
    <section data-stub="ModeSwitch">
      <h3>{t('mode.label')}</h3>
      <ul>
        <li>{t('mode.beginner')}</li>
        <li>{t('mode.expert')}</li>
      </ul>
    </section>
  );
}
