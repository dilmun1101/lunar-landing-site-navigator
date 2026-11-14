import CountdownChips from '@/features/scenario/CountdownChips';
import SkyPanel from '@/features/scenario/SkyPanel';
import VerdictCard from '@/features/scenario/VerdictCard';
import ViabilityTimeline from '@/features/scenario/ViabilityTimeline';

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
