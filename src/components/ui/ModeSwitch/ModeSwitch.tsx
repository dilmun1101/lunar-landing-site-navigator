import { useTranslation } from 'react-i18next';
import SegmentedControl from '@/components/ui/SegmentedControl/SegmentedControl';
import { useModeStore } from '@/hooks/useMode/useMode';

interface ModeSwitchProps {
  className?: string;
}

export default function ModeSwitch({ className }: ModeSwitchProps) {
  const { t } = useTranslation();
  const mode = useModeStore((state) => state.mode);
  const setMode = useModeStore((state) => state.setMode);

  return (
    <SegmentedControl
      className={className}
      label={t('mode.label')}
      options={[
        { value: 'beginner', label: t('mode.beginner') },
        { value: 'expert', label: t('mode.expert') },
      ]}
      value={mode}
      onChange={setMode}
    />
  );
}
