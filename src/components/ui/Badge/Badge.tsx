import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import type { Verdict } from '@/types';

const labelKey: Record<Verdict, string> = {
  viable: 'verdict.viable',
  marginal: 'verdict.marginal',
  'not-viable': 'verdict.notViable',
};

const styles: Record<Verdict, string> = {
  viable: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  marginal: 'border-orange-400/40 bg-orange-400/10 text-orange-300',
  'not-viable': 'border-red-400/40 bg-red-400/10 text-red-300',
};

interface BadgeProps {
  verdict: Verdict;
  className?: string;
}

export default function Badge({ verdict, className }: BadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase',
        styles[verdict],
        className
      )}
    >
      {t(labelKey[verdict])}
    </span>
  );
}
