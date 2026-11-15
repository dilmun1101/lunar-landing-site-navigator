import classNames from 'classnames';
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

/** A press that moves less than this (px) is a click, not the start of a drag */
const CLICK_SLOP_PX = 5;

interface ExpandableViewProps {
  /** The picture. It should fill the box: `size-full` */
  children: ReactNode;
  /** Shown above the picture while it is open (e.g. the time playback) */
  header?: ReactNode;
  className?: string;
}

const ExpandIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
    <path
      d="M9.5 2H14v4.5M6.5 14H2V9.5M14 2 9 7M2 14l5-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CollapseIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
    <path
      d="m3 3 10 10M13 3 3 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * A square picture that opens over the whole right part of the page (to the right of
 * the sidebar, under the header) on a click or on the button, and closes on Esc.
 * The picture is not rendered twice: the same element changes its place, so a WebGL scene
 * keeps its state and there is only one canvas.
 */
export default function ExpandableView({
  children,
  header,
  className,
}: ExpandableViewProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const pressStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    // The page behind must not scroll while the picture is open
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  // A click opens the picture, a drag (rotating the 3D scene) does not
  const onPointerDown = (event: PointerEvent) => {
    pressStart.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent) => {
    const start = pressStart.current;
    pressStart.current = null;
    if (
      !expanded &&
      start &&
      Math.hypot(event.clientX - start.x, event.clientY - start.y) <
        CLICK_SLOP_PX
    ) {
      setExpanded(true);
    }
  };

  const label = t(expanded ? 'scenario.sky.collapse' : 'scenario.sky.expand');

  return (
    // The outer box keeps the place in the page while the picture is open
    <div className={classNames('relative aspect-square w-full', className)}>
      <div
        className={
          expanded
            ? // AppShell sets --sidebar-width and --compare-width; 3.5rem (top-14) is the header
              'fixed top-14 right-[var(--compare-width,0px)] bottom-0 left-[var(--sidebar-width,20rem)] z-20 flex flex-col gap-3 overflow-y-auto bg-space-900 p-4'
            : 'size-full'
        }
      >
        {expanded && header}
        <div
          className={classNames(
            'relative',
            expanded ? 'min-h-[24rem] flex-1' : 'size-full cursor-zoom-in'
          )}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <button
            type="button"
            aria-label={label}
            title={label}
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
            // The button has its own click: it must not count as a click on the picture
            onPointerDown={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
            className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-lg border border-white/15 bg-space-900/80 text-slate-300 backdrop-blur transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-earth"
          >
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </button>
          <div className="size-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
