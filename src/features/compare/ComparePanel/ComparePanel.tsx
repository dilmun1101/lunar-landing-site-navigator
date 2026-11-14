import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import BestAlternativeHint from '@/features/compare/BestAlternativeHint/BestAlternativeHint';
import EmptyState from '@/features/compare/EmptyState/EmptyState';
import ScenarioCard from '@/features/compare/ScenarioCard/ScenarioCard';
import {
  demoBestAlternative,
  demoComparison,
  type ScenarioView,
} from '@/features/scenario/demoScenario';

interface ComparePanelProps {
  // TODO: брать список из state/useCompareList, когда появится логика
  scenarios?: ScenarioView[];
  className?: string;
}

export default function ComparePanel({
  scenarios = demoComparison,
  className,
}: ComparePanelProps) {
  const { t } = useTranslation();

  return (
    <section className={classNames('flex flex-col gap-3', className)}>
      <SectionTitle>{t('compare.title')}</SectionTitle>

      {scenarios.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-3">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
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
