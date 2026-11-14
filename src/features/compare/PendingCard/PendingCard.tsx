import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import Panel from '@/components/ui/Panel/Panel';

interface PendingCardProps {
  siteName: string;
  /** What happened: loading, error or no coordinates */
  status: 'loading' | 'error' | 'noData';
  onRemove: () => void;
  /** Shown for the error state: requests the data again */
  onRetry?: () => void;
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
  onRetry,
  className,
}: PendingCardProps) {
  const { t } = useTranslation();

  return (
    <Panel className={classNames('flex flex-col gap-3', className)}>
      <h3 className="font-semibold text-slate-100">{siteName}</h3>
      <p className="text-sm text-slate-400">{t(messageKey[status])}</p>
      <div className="mt-auto flex items-center justify-end gap-3">
        {status === 'error' && onRetry && (
          <Button className="px-2 py-1 text-xs" onClick={onRetry}>
            {t('common.refresh')}
          </Button>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-slate-500 hover:text-accent"
        >
          {t('compare.card.remove')}
        </button>
      </div>
    </Panel>
  );
}
