import classNames from 'classnames';
import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import ComparePanel from '@/features/compare/ComparePanel/ComparePanel';
import {
  COMPARE_MAX_WIDTH,
  COMPARE_MIN_WIDTH,
  useCompareDock,
} from '@/hooks/useCompareDock/useCompareDock';
import { useCompareList } from '@/state/useCompareList/useCompareList';

interface CompareDockProps {
  className?: string;
}

const ChevronIcon = ({ pointsLeft }: { pointsLeft: boolean }) => (
  <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
    <path
      d={pointsLeft ? 'm10 3-5 5 5 5' : 'm6 3 5 5-5 5'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** The right panel with the compared scenarios; folds into a narrow strip with a counter. */
export default function CompareDock({ className }: CompareDockProps) {
  const { t } = useTranslation();
  const open = useCompareDock((state) => state.open);
  const toggle = useCompareDock((state) => state.toggle);
  const width = useCompareDock((state) => state.width);
  const setWidth = useCompareDock((state) => state.setWidth);
  const resetWidth = useCompareDock((state) => state.resetWidth);
  const setResizing = useCompareDock((state) => state.setResizing);
  const asideRef = useRef<HTMLElement>(null);
  const count = useCompareList((state) => state.items.length);
  const label = t(open ? 'compare.dock.collapse' : 'compare.dock.expand');

  // The edge is dragged with the pointer captured, so it follows the mouse outside the strip too
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setResizing(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const right =
      asideRef.current?.getBoundingClientRect().right ?? window.innerWidth;
    setWidth(right - event.clientX);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setResizing(false);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 96 : 24;
    // The panel grows toward the left
    if (event.key === 'ArrowLeft') setWidth(width + step);
    else if (event.key === 'ArrowRight') setWidth(width - step);
    else if (event.key === 'Home') setWidth(COMPARE_MIN_WIDTH);
    else if (event.key === 'End') setWidth(COMPARE_MAX_WIDTH);
    else return;
    event.preventDefault();
  };

  return (
    <aside
      ref={asideRef}
      className={classNames(
        'sticky top-14 col-start-3 row-span-2 row-start-2 flex h-[calc(100vh-3.5rem)] flex-col border-l border-white/10 bg-space-900',
        className
      )}
    >
      {open && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t('compare.dock.resize')}
          aria-valuenow={width}
          aria-valuemin={COMPARE_MIN_WIDTH}
          aria-valuemax={COMPARE_MAX_WIDTH}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={resetWidth}
          onKeyDown={onKeyDown}
          className="group absolute top-0 left-0 z-10 h-full w-2 -translate-x-1/2 cursor-col-resize touch-none select-none focus-visible:outline-none"
        >
          <span className="mx-auto block h-full w-0.5 bg-transparent transition-colors group-hover:bg-accent/60 group-focus-visible:bg-accent group-active:bg-accent" />
        </div>
      )}

      <div
        className={classNames('flex shrink-0 flex-col gap-2 p-2', {
          'items-center': !open,
        })}
      >
        <button
          type="button"
          aria-label={label}
          title={label}
          aria-expanded={open}
          onClick={toggle}
          className="flex size-8 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-earth"
        >
          {/* Open: the arrow sends the panel to the right; closed: it pulls it out to the left */}
          <ChevronIcon pointsLeft={!open} />
        </button>
        {!open && count > 0 && (
          <span
            className="flex size-6 items-center justify-center rounded-full bg-accent/20 font-mono text-xs text-accent"
            aria-label={t('compare.dock.count', { count })}
          >
            {count}
          </span>
        )}
      </div>

      {/* Hidden, not removed: the cards keep their data */}
      <div
        className={classNames('min-h-0 flex-1 overflow-y-auto p-4 pt-2', {
          hidden: !open,
        })}
      >
        <ComparePanel />
      </div>
    </aside>
  );
}
