import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { externalLinks } from '@/lib/externalLinks/externalLinks';

const resources = [
  { key: 'horizons', href: externalLinks.horizons },
  { key: 'usgs', href: externalLinks.usgsAstrogeology },
  { key: 'quickmap', href: externalLinks.quickmap },
  { key: 'moonTrek', href: externalLinks.moonTrek },
  { key: 'csa', href: externalLinks.csaMoonExploration },
] as const;

interface ResourcesPanelProps {
  className?: string;
}

/** Where the data comes from and where to look deeper; collapsed by default. */
export default function ResourcesPanel({ className }: ResourcesPanelProps) {
  const { t } = useTranslation();

  return (
    <details className={classNames('group text-sm', className)}>
      <summary className="cursor-pointer text-[11px] font-semibold tracking-wider text-slate-500 uppercase transition-colors select-none hover:text-accent">
        {t('resources.title')}
      </summary>

      <ul className="mt-3 grid gap-x-8 gap-y-2 md:grid-cols-2">
        {resources.map((resource) => (
          <li key={resource.key} className="flex flex-col">
            <a
              href={resource.href}
              target="_blank"
              rel="noreferrer"
              className="w-fit font-medium text-earth underline-offset-2 hover:underline"
            >
              {t(`resources.items.${resource.key}.name`)}{' '}
              <span aria-hidden="true">↗</span>
              <span className="sr-only">{t('resources.newTab')}</span>
            </a>
            <span className="text-xs text-slate-400">
              {t(`resources.items.${resource.key}.description`)}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-slate-500">{t('resources.disclaimer')}</p>
    </details>
  );
}
