import classNames from 'classnames';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useMode } from '@/hooks/useMode/useMode';

interface HintProps {
  /** Plain-language explanation of the term next to the "?" */
  text: string;
  /** A longer explanation: the bubble is wider */
  wide?: boolean;
  className?: string;
}

/** Widths of the bubble in px (w-56 and w-72), needed to keep it inside the window */
const NARROW_PX = 224;
const WIDE_PX = 288;
const GAP_PX = 6;
const EDGE_PX = 8;
/** Below this much free space the bubble opens upward */
const MIN_ROOM_BELOW_PX = 180;

interface BubblePlace {
  left: number;
  top?: number;
  bottom?: number;
}

/**
 * A small "?" with an explanation on hover, focus or tap.
 * Shown only in beginner mode; experts know the terms.
 * The bubble is drawn in <body> on top of everything, so side panels, scrolling areas
 * and other layers can neither cut it off nor cover it.
 */
export default function Hint({ text, wide = false, className }: HintProps) {
  const { t } = useTranslation();
  const mode = useMode();
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [place, setPlace] = useState<BubblePlace | null>(null);

  const show = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = wide ? WIDE_PX : NARROW_PX;
    const left = Math.min(
      Math.max(EDGE_PX, rect.left),
      window.innerWidth - width - EDGE_PX
    );
    const roomBelow = window.innerHeight - rect.bottom;
    setPlace(
      roomBelow < MIN_ROOM_BELOW_PX
        ? { left, bottom: window.innerHeight - rect.top + GAP_PX }
        : { left, top: rect.bottom + GAP_PX }
    );
  };
  const hide = () => setPlace(null);

  const open = place !== null;
  // The bubble is fixed to the window: scrolling or resizing would leave it in the wrong place
  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [open]);

  if (mode !== 'beginner') return null;

  return (
    <span className={classNames('inline-flex', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={t('hints.what')}
        aria-describedby={open ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={show}
        onKeyDown={(event) => {
          if (event.key === 'Escape') hide();
        }}
        className="inline-flex size-4 cursor-help items-center justify-center rounded-full border border-white/20 text-[10px] leading-none font-semibold text-slate-400 normal-case transition-colors hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent focus-visible:outline-none"
      >
        ?
      </button>
      {place &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={place}
            className={classNames(
              'pointer-events-none fixed z-50 rounded-lg border border-white/15 bg-slate-900 p-2.5 text-xs leading-snug font-normal tracking-normal text-slate-200 normal-case shadow-lg',
              wide ? 'w-72' : 'w-56'
            )}
          >
            {text}
          </span>,
          document.body
        )}
    </span>
  );
}
