import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import TextInput from '@/components/ui/TextInput/TextInput';
import {
  addDays,
  dateAtPhase,
  lunarPhase,
} from '@/domain/time/lunarDay/lunarDay';
import { useMode } from '@/hooks/useMode/useMode';
import { formatUtcDateTime, parseUtcDateTime } from '@/lib/format/format';
import { useScenarioStore } from '@/state/useScenarioStore/useScenarioStore';

interface TemporalSetupProps {
  className?: string;
}

export default function TemporalSetup({ className }: TemporalSetupProps) {
  const { t, i18n } = useTranslation();
  const beginner = useMode() === 'beginner';
  const epoch = useScenarioStore((state) => state.epoch);
  const setEpoch = useScenarioStore((state) => state.setEpoch);
  // Text while the user is typing; null — show the current epoch
  const [draft, setDraft] = useState<string | null>(null);

  const phase = lunarPhase(epoch);
  const phaseText = new Intl.NumberFormat(i18n.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(phase);

  const draftInvalid = draft !== null && parseUtcDateTime(draft) === null;
  const placeholder = formatUtcDateTime(
    new Date(Date.UTC(2026, 10, 14, 12, 0)),
    i18n.language
  );

  return (
    <section className={classNames('flex flex-col gap-4', className)}>
      <SectionTitle>{t('setup.title')}</SectionTitle>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="epoch-input"
          className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase"
        >
          {t('setup.epoch')}
        </label>
        <TextInput
          id="epoch-input"
          inputMode="numeric"
          placeholder={placeholder}
          value={draft ?? formatUtcDateTime(epoch, i18n.language)}
          onChange={(event) => {
            setDraft(event.target.value);
            const next = parseUtcDateTime(event.target.value);
            if (next) setEpoch(next);
          }}
          onBlur={() => setDraft(null)}
          aria-invalid={draftInvalid}
          className="font-mono"
        />
        {draftInvalid && (
          <p className="text-xs text-red-300">{t('setup.epochHint')}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          <label htmlFor="lunar-day-slider">{t('setup.lunarDay')}</label>
          {!beginner && (
            <span className="font-mono text-slate-300 normal-case">
              {t('setup.phase')}: {phaseText}
            </span>
          )}
        </div>
        <input
          id="lunar-day-slider"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={phase}
          onChange={(event) =>
            setEpoch(dateAtPhase(epoch, Number(event.target.value)))
          }
          className="w-full accent-accent"
        />
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={() => setEpoch(addDays(epoch, -1))}>
            {t('setup.prevDay')}
          </Button>
          <Button onClick={() => setEpoch(new Date())}>
            {t('setup.reset')}
          </Button>
          <Button onClick={() => setEpoch(addDays(epoch, 1))}>
            {t('setup.nextDay')}
          </Button>
        </div>
      </div>
    </section>
  );
}
