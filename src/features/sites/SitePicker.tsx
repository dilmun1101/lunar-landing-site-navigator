import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@/components/ui/SearchIcon';
import { siteCatalog } from '@/features/sites/siteCatalog';
import type { SiteGroup } from '@/features/sites/types';

const groups: { id: SiteGroup; labelKey: string }[] = [
  { id: 'clps', labelKey: 'sites.groups.clps' },
  { id: 'apollo', labelKey: 'sites.groups.apollo' },
];

interface SitePickerProps {
  className?: string;
}

export default function SitePicker({ className }: SitePickerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  // TODO: хранить выбранную площадку в URL (state/useScenarioParams.ts)
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const normalized = query.trim().toLowerCase();
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      sites: siteCatalog.filter(
        (site) =>
          site.group === group.id &&
          site.name.toLowerCase().includes(normalized)
      ),
    }))
    .filter((group) => group.sites.length > 0);

  return (
    <section className={classNames('flex flex-col gap-5', className)}>
      <h2 className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
        {t('sites.title')}
      </h2>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('sites.search')}
          aria-label={t('sites.search')}
          className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pr-3 pl-9 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none"
        />
      </div>

      {visibleGroups.length === 0 ? (
        <p className="text-sm text-slate-500">{t('sites.noResults')}</p>
      ) : (
        visibleGroups.map((group) => (
          <div key={group.id} className="flex flex-col gap-1">
            <h3 className="px-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {t(group.labelKey)}
            </h3>
            <ul className="flex flex-col">
              {group.sites.map((site) => (
                <li key={site.id}>
                  <button
                    type="button"
                    aria-pressed={site.id === selectedId}
                    onClick={() => setSelectedId(site.id)}
                    className="w-full rounded-md border-l-2 border-transparent px-2 py-1.5 text-left text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-accent aria-pressed:border-accent aria-pressed:bg-accent/10 aria-pressed:text-accent"
                  >
                    {site.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
