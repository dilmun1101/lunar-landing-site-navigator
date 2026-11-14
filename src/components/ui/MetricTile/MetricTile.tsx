import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Panel from '@/components/ui/Panel/Panel';

const barColor = {
  sun: 'bg-sun',
  earth: 'bg-earth',
  emerald: 'bg-emerald-400',
} as const;

interface MetricTileProps {
  label: string;
  /** Значение в процентах, 0–100 */
  percent: number;
  color: keyof typeof barColor;
  className?: string;
}

export default function MetricTile({
  label,
  percent,
  color,
  className,
}: MetricTileProps) {
  const { i18n } = useTranslation();
  const value = new Intl.NumberFormat(i18n.language, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(percent / 100);

  return (
    <Panel className={classNames('flex flex-col gap-2 p-3', className)}>
      <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        {label}
      </span>
      <span className="font-mono text-3xl font-semibold text-slate-100">
        {value}
      </span>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-1.5 overflow-hidden rounded-full bg-white/10"
      >
        <div
          className={classNames('h-full rounded-full', barColor[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </Panel>
  );
}
