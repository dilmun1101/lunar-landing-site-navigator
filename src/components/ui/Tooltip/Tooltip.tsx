import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useMode } from '@/hooks/useMode/useMode';

interface HintProps {
  /** Plain-language explanation of the term next to the "?" */
  text: string;
  className?: string;
}

/**
 * A small "?" with an explanation on hover, focus or tap.
 * Shown only in beginner mode; experts know the terms.
 */
export default function Hint({ text, className }: HintProps) {
  const { t } = useTranslation();
  const mode = useMode();
  if (mode !== 'beginner') return null;

  return (
    <span className={classNames('group relative inline-flex', className)}>
      <button
        type="button"
        aria-label={t('hints.what')}
        className="inline-flex size-4 cursor-help items-center justify-center rounded-full border border-white/20 text-[10px] leading-none font-semibold text-slate-400 normal-case transition-colors hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent focus-visible:outline-none"
      >
        ?
      </button>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute top-full left-0 z-20 mt-1.5 w-56 rounded-lg border border-white/15 bg-slate-900 p-2.5 text-xs leading-snug font-normal tracking-normal text-slate-200 normal-case opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
