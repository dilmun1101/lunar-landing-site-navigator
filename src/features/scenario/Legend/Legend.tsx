import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

interface LegendProps {
  className?: string;
}

export default function Legend({ className }: LegendProps) {
  const { t } = useTranslation();

  const items = [
    { key: 'sun', swatch: 'size-2.5 rounded-full bg-sun' },
    { key: 'earth', swatch: 'size-2.5 rounded-full bg-earth' },
    { key: 'horizon', swatch: 'h-2.5 w-4 rounded-sm bg-slate-500/60' },
  ];

  return (
    <ul
      className={classNames(
        'flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400',
        className
      )}
    >
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-1.5">
          <span className={item.swatch} />
          {t(`scenario.legend.${item.key}`)}
        </li>
      ))}
    </ul>
  );
}
