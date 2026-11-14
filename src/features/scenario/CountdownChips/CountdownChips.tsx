import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { formatDuration } from '@/lib/formatDuration/formatDuration';
import type { Duration } from '@/types';

interface CountdownChipsProps {
  sunset: Duration;
  earthset: Duration;
  className?: string;
}

export default function CountdownChips({
  sunset,
  earthset,
  className,
}: CountdownChipsProps) {
  const { t } = useTranslation();

  const chips = [
    {
      key: 'sunset',
      dot: 'bg-sun',
      text: t('scenario.countdown.sunset', { time: formatDuration(t, sunset) }),
    },
    {
      key: 'earthset',
      dot: 'bg-earth',
      text: t('scenario.countdown.earthset', {
        time: formatDuration(t, earthset),
      }),
    },
  ];

  return (
    <ul className={classNames('flex flex-wrap gap-2', className)}>
      {chips.map((chip) => (
        <li
          key={chip.key}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200"
        >
          <span className={classNames('size-2 rounded-full', chip.dot)} />
          {chip.text}
        </li>
      ))}
    </ul>
  );
}
