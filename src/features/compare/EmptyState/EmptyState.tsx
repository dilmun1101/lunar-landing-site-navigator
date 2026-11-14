import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Panel from '@/components/ui/Panel/Panel';

interface EmptyStateProps {
  className?: string;
}

export default function EmptyState({ className }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <Panel
      className={classNames(
        'flex flex-col items-center gap-1 border-dashed py-8 text-center',
        className
      )}
    >
      <p className="font-medium text-slate-200">{t('compare.empty.title')}</p>
      <p className="text-sm text-slate-500">{t('compare.empty.hint')}</p>
    </Panel>
  );
}
