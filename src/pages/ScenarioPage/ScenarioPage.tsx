import CountdownChips from '@/features/scenario/CountdownChips/CountdownChips';
import SkyPanel from '@/features/scenario/SkyPanel/SkyPanel';
import VerdictCard from '@/features/scenario/VerdictCard/VerdictCard';
import ViabilityTimeline from '@/features/scenario/ViabilityTimeline/ViabilityTimeline';

export default function ScenarioPage() {
  return (
    <div className="flex flex-col gap-4">
      <VerdictCard />
      <CountdownChips />
      <ViabilityTimeline />
      <SkyPanel />
    </div>
  );
}
