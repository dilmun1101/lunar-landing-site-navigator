import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import {
  coordinatesForSearch,
  externalLinks,
  formatCoordinates,
  type LatLon,
} from '@/lib/externalLinks/externalLinks';

const linkClass =
  'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-earth';

interface ExternalMapLinksProps {
  /** null — no point is selected, nothing to show */
  coordinates: LatLon | null;
  className?: string;
}

/**
 * Links to NASA's map tools. They do not allow embedding, so they open in a new tab;
 * the coordinates can be copied and pasted into the search box there.
 */
export default function ExternalMapLinks({
  coordinates,
  className,
}: ExternalMapLinksProps) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!coordinates) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coordinatesForSearch(coordinates));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // The clipboard can be blocked; the coordinates stay visible to copy by hand
    }
  };

  const links = [
    { key: 'quickmap', href: externalLinks.quickmap },
    { key: 'moonTrek', href: externalLinks.moonTrek },
  ] as const;

  return (
    <div
      className={classNames('flex flex-col gap-2', className)}
      aria-label={t('scenario.externalMaps.title')}
      role="group"
    >
      <div className="flex flex-wrap items-center gap-2">
        {links.map((link) => (
          <a
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className={linkClass}
          >
            {t(`scenario.externalMaps.${link.key}`)}
            <span aria-hidden="true">↗</span>
            <span className="sr-only">{t('scenario.externalMaps.newTab')}</span>
          </a>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="font-mono text-slate-200">
          {formatCoordinates(coordinates, i18n.language)}
        </span>
        <Button className="px-2 py-1 text-xs" onClick={() => void copy()}>
          {copied
            ? t('scenario.externalMaps.copied')
            : t('scenario.externalMaps.copy')}
        </Button>
        <span role="status" className="sr-only">
          {copied ? t('scenario.externalMaps.copied') : ''}
        </span>
      </div>
      <p className="text-xs text-slate-500">
        {t('scenario.externalMaps.hint')}
      </p>
    </div>
  );
}
