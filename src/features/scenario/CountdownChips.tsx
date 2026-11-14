import { useTranslation } from 'react-i18next';

export default function CountdownChips() {
  const { t } = useTranslation();
  // Placeholder values: sunset in 4 d 11 h, Earthset in 2 d 3 h
  const sunset = `${t('time.days', { count: 4 })} ${t('time.hours', { count: 11 })}`;
  const earthset = `${t('time.days', { count: 2 })} ${t('time.hours', { count: 3 })}`;

  return (
    <div data-stub="CountdownChips" className="flex gap-2">
      <span>{t('scenario.countdown.sunset', { time: sunset })}</span>
      <span>{t('scenario.countdown.earthset', { time: earthset })}</span>
    </div>
  );
}
