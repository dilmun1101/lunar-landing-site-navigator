import { useTranslation } from 'react-i18next';
import SegmentedControl from '@/components/ui/SegmentedControl/SegmentedControl';
import type { PlannerMetric } from '@/features/planner/demoPlanner';

interface MetricToggleProps {
  value: PlannerMetric;
  onChange: (value: PlannerMetric) => void;
  className?: string;
}

export default function MetricToggle({
  value,
  onChange,
  className,
}: MetricToggleProps) {
  const { t } = useTranslation();

  return (
    <SegmentedControl
      label={t('planner.metric.title')}
      value={value}
      onChange={onChange}
      className={className}
      options={[
        { value: 'sunlight', label: t('planner.metric.sunlight') },
        { value: 'comms', label: t('planner.metric.comms') },
      ]}
    />
  );
}
