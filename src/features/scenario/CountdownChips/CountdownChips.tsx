import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useMode } from '@/hooks/useMode/useMode';
import { formatDurationFor } from '@/lib/formatDuration/formatDuration';
import type { Duration } from '@/types';

interface CountdownChipsProps {
  /** null — the Sun is currently below the horizon */
  sunset: Duration | null;
  /** null — the Earth is currently below the horizon */
  earthset: Duration | null;
  className?: string;
}

export default function CountdownChips({
  sunset,
  earthset,
  className,
}: CountdownChipsProps) {
  const { t } = useTranslation();
  const beginner = useMode() === 'beginner';

  const chips = [
    {
      key: 'sunset',
      dot: 'bg-sun',
      text: sunset
        ? t('scenario.countdown.sunset', {
            time: formatDurationFor(t, sunset, beginner),
          })
        : t('scenario.countdown.sunBelow'),
    },
    {
      key: 'earthset',
      dot: 'bg-earth',
      text: earthset
        ? t('scenario.countdown.earthset', {
            time: formatDurationFor(t, earthset, beginner),
          })
        : t('scenario.countdown.earthBelow'),
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
