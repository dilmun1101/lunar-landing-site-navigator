import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

interface PlayheadProps {
  /** Position on the scale, 0–100 % */
  leftPercent: number;
  className?: string;
}

export default function Playhead({ leftPercent, className }: PlayheadProps) {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(
        'pointer-events-none absolute inset-y-[-6px] z-10',
        className
      )}
      style={{ left: `${leftPercent}%` }}
    >
      <div className="h-full w-0.5 -translate-x-1/2 bg-white" />
      <span className="absolute -top-5 left-0 -translate-x-1/2 text-[11px] font-semibold whitespace-nowrap text-white">
        {t('scenario.playhead.now')}
      </span>
    </div>
  );
}
