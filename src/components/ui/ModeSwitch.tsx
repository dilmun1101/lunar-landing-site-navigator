import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SegmentedControl from '@/components/ui/SegmentedControl';

type Mode = 'beginner' | 'expert';

interface ModeSwitchProps {
  className?: string;
}

export default function ModeSwitch({ className }: ModeSwitchProps) {
  const { t } = useTranslation();
  // TODO: перенести в общее состояние (hooks/useMode.ts), когда режимы будут влиять на интерфейс
  const [mode, setMode] = useState<Mode>('expert');

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
