import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import { siteCatalog } from '@/features/sites/siteCatalog';
import { useScenarioStore } from '@/state/useScenarioStore/useScenarioStore';

interface LandingDateProps {
  className?: string;
}

/** For Apollo sites: shows the real landing time and sets it as the scenario time. */
export default function LandingDate({ className }: LandingDateProps) {
  const { t, i18n } = useTranslation();
  const siteId = useScenarioStore((state) => state.siteId);
  const epoch = useScenarioStore((state) => state.epoch);
  const setEpoch = useScenarioStore((state) => state.setEpoch);

  const landing = siteCatalog.find((site) => site.id === siteId)?.landing;
  if (!landing) return null;

  const landingMs = new Date(landing).getTime();
  const isSet = Math.abs(epoch.getTime() - landingMs) < 60_000;
  const formatted = new Intl.DateTimeFormat(i18n.language, {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).format(landingMs);

  return (
    <div
      className={classNames(
        'flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3',
        className
      )}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          {t('sites.landing.label')}
        </span>
        <span className="font-mono text-sm text-slate-100">{formatted}</span>
      </div>
      {isSet ? (
        <p className="text-xs text-slate-500">{t('sites.landing.isSet')}</p>
      ) : (
        <>
          <p className="text-xs text-slate-500">{t('sites.landing.note')}</p>
          <Button
            className="self-start px-2 py-1 text-xs"
            onClick={() => setEpoch(new Date(landingMs))}
          >
            {t('sites.landing.set')}
          </Button>
        </>
      )}
    </div>
  );
}
