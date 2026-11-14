import MetricToggle from '@/features/planner/MetricToggle/MetricToggle';
import ViabilityHeatmap from '@/features/planner/ViabilityHeatmap/ViabilityHeatmap';

export default function PlannerPage() {
  return (
    <div className="flex flex-col gap-4">
      <MetricToggle />
      <ViabilityHeatmap />
    </div>
  );
}
