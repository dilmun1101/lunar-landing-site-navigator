import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Panel from '@/components/ui/Panel/Panel';

interface BestAlternativeHintProps {
  days: number;
  percent: number;
  className?: string;
}

export default function BestAlternativeHint({
  days,
  percent,
  className,
}: BestAlternativeHintProps) {
  const { t } = useTranslation();

  return (
    <Panel
      className={classNames(
        'flex flex-col justify-center gap-2 border-dashed border-accent/40 bg-accent/5',
        className
      )}
    >
      <h3 className="text-[11px] font-semibold tracking-wider text-accent uppercase">
        {t('compare.best.title')}
      </h3>
      <p className="text-sm text-slate-200">
        {t('compare.best.text', { days, percent })}
      </p>
    </Panel>
  );
}
