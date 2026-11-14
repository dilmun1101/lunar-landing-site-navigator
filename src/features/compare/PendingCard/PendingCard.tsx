import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Panel from '@/components/ui/Panel/Panel';

interface PendingCardProps {
  siteName: string;
  /** What happened: loading, error or no coordinates */
  status: 'loading' | 'error' | 'noData';
  onRemove: () => void;
  className?: string;
}

const messageKey = {
  loading: 'compare.card.loading',
  error: 'scenario.fetchError',
  noData: 'scenario.noData',
} as const;

export default function PendingCard({
  siteName,
  status,
  onRemove,
  className,
}: PendingCardProps) {
  const { t } = useTranslation();

  return (
    <Panel className={classNames('flex flex-col gap-3', className)}>
      <h3 className="font-semibold text-slate-100">{siteName}</h3>
      <p className="text-sm text-slate-400">{t(messageKey[status])}</p>
      <button
        type="button"
        onClick={onRemove}
        className="mt-auto self-end text-xs text-slate-500 hover:text-accent"
      >
        {t('compare.card.remove')}
      </button>
    </Panel>
  );
}
