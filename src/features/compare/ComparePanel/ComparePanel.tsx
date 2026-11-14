import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import EmptyState from '@/features/compare/EmptyState/EmptyState';
import PendingCard from '@/features/compare/PendingCard/PendingCard';
import ScenarioCard from '@/features/compare/ScenarioCard/ScenarioCard';
import { useCompareViews } from '@/features/compare/useCompareViews/useCompareViews';
import {
  MAX_COMPARE_ITEMS,
  useCompareList,
} from '@/state/useCompareList/useCompareList';

interface ComparePanelProps {
  className?: string;
}

export default function ComparePanel({ className }: ComparePanelProps) {
  const { t } = useTranslation();
  const items = useCompareList((state) => state.items);
  const remove = useCompareList((state) => state.remove);
  const { states, reload } = useCompareViews(items);

  return (
    <section className={classNames('flex flex-col gap-3', className)}>
      <SectionTitle>
        {t('compare.title')} · {items.length}/{MAX_COMPARE_ITEMS}
      </SectionTitle>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-3">
          {items.map((item) => {
            const state = states[item.id] ?? { status: 'loading' as const };
            return state.status === 'ready' ? (
              <ScenarioCard
                key={item.id}
                scenario={state.view}
                onRemove={() => remove(item.id)}
              />
            ) : (
              <PendingCard
                key={item.id}
                siteName={item.siteName}
                status={state.status}
                onRemove={() => remove(item.id)}
                onRetry={() => reload(item.id)}
              />
            );
          })}
          {/* TODO: show the "best alternative" hint once it is calculated from real data */}
        </div>
      )}
    </section>
  );
}
