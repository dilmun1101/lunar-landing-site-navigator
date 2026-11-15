import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Select from '@/components/ui/Select/Select';
import {
  type DurationKey,
  useScenarioStore,
} from '@/state/useScenarioStore/useScenarioStore';

interface MissionDurationProps {
  className?: string;
}

export default function MissionDuration({ className }: MissionDurationProps) {
  const { t } = useTranslation();
  const duration = useScenarioStore((state) => state.duration);
  const setDuration = useScenarioStore((state) => state.setDuration);

  return (
    <label
      className={classNames(
        'flex flex-col gap-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase',
        className
      )}
    >
      {t('setup.duration.label')}
      <Select
        value={duration}
        onChange={(event) => setDuration(event.target.value as DurationKey)}
        className="normal-case"
      >
        <option value="7">{t('time.days', { count: 7 })}</option>
        <option value="14">{t('time.days', { count: 14 })}</option>
        <option value="cycle">{t('setup.duration.cycle')}</option>
      </Select>
    </label>
  );
}
