import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import { type Criteria, criteriaLimits } from '@/domain/criteria/criteria';
import { useCriteriaStore } from '@/state/useCriteriaStore/useCriteriaStore';

const fields: (keyof Criteria)[] = [
  'minSunElevation',
  'minEarthElevation',
  'minWindowHours',
  'viablePercent',
  'marginalPercent',
];

interface CriterionFieldProps {
  name: keyof Criteria;
  value: number;
  onChange: (value: number) => void;
}

function CriterionField({ name, value, onChange }: CriterionFieldProps) {
  const { t } = useTranslation();
  const { min, max, step } = criteriaLimits[name];
  const [draft, setDraft] = useState(String(value));
  const [seen, setSeen] = useState(value);

  // The value changed outside (reset or clamping): show it instead of the draft
  if (seen !== value) {
    setSeen(value);
    if (Number(draft) !== value) setDraft(String(value));
  }

  const parsed = Number(draft);
  const invalid =
    draft.trim() === '' ||
    !Number.isFinite(parsed) ||
    parsed < min ||
    parsed > max;

  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      <span title={t(`criteria.${name}.hint`)}>
        {t(`criteria.${name}.label`)}
      </span>
      <TextInput
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={draft}
        aria-invalid={invalid}
        onChange={(event) => {
          setDraft(event.target.value);
          const next = Number(event.target.value);
          if (event.target.value.trim() !== '' && Number.isFinite(next)) {
            onChange(next);
          }
        }}
        className="py-1.5"
      />
    </label>
  );
}

interface CriteriaPanelProps {
  className?: string;
}

export default function CriteriaPanel({ className }: CriteriaPanelProps) {
  const { t } = useTranslation();
  const criteria = useCriteriaStore((state) => state.criteria);
  const setCriterion = useCriteriaStore((state) => state.setCriterion);
  const reset = useCriteriaStore((state) => state.reset);

  return (
    <details className={classNames('group', className)}>
      <summary className="cursor-pointer text-[11px] font-semibold tracking-wider text-slate-500 uppercase select-none hover:text-accent">
        {t('criteria.title')}
      </summary>
      <div className="mt-3 flex flex-col gap-3">
        <p className="text-xs text-slate-500">{t('criteria.note')}</p>
        {fields.map((name) => (
          <CriterionField
            key={name}
            name={name}
            value={criteria[name]}
            onChange={(value) => setCriterion(name, value)}
          />
        ))}
        <Button className="self-start px-2 py-1 text-xs" onClick={reset}>
          {t('criteria.reset')}
        </Button>
      </div>
    </details>
  );
}
