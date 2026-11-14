import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import BestAlternativeHint from '@/features/compare/BestAlternativeHint/BestAlternativeHint';
import EmptyState from '@/features/compare/EmptyState/EmptyState';
import ScenarioCard from '@/features/compare/ScenarioCard/ScenarioCard';
import {
  demoBestAlternative,
  demoScenario,
} from '@/features/scenario/demoScenario';
import { useCompareList } from '@/state/useCompareList/useCompareList';
import { durationDays } from '@/state/useScenarioStore/useScenarioStore';

interface ComparePanelProps {
  className?: string;
}

export default function ComparePanel({ className }: ComparePanelProps) {
  const { t } = useTranslation();
  const items = useCompareList((state) => state.items);
  const remove = useCompareList((state) => state.remove);

  return (
    <section className={classNames('flex flex-col gap-3', className)}>
      <SectionTitle>{t('compare.title')}</SectionTitle>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-3">
          {items.map((item) => (
            <ScenarioCard
              key={item.id}
              // TODO: заменить демо-цифры расчётом по площадке и дате
              scenario={{
                ...demoScenario,
                id: item.id,
                siteName: item.siteName,
                epoch: new Date(item.epoch),
                durationDays: durationDays[item.duration],
              }}
              onRemove={() => remove(item.id)}
            />
          ))}
          <BestAlternativeHint
            days={demoBestAlternative.days}
            percent={demoBestAlternative.percent}
          />
        </div>
      )}
    </section>
  );
}
