import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ResourcesPanel from '@/features/resources/ResourcesPanel/ResourcesPanel';

const TEAM_NAME = 'Snow Leopard';
const AUTHOR_NICK = 'dilmun1101';
const AUTHOR_GITHUB = `https://github.com/${AUTHOR_NICK}`;

interface SiteFooterProps {
  className?: string;
}

/** The bottom of the page under the center column: data sources and resources, the team, the author. */
export default function SiteFooter({ className }: SiteFooterProps) {
  const { t } = useTranslation();

  return (
    <footer
      className={classNames(
        'col-start-2 flex min-w-0 flex-col gap-3 border-t border-white/10 p-4',
        className
      )}
    >
      <ResourcesPanel />

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 pt-3 text-xs text-slate-400">
        <p>
          {t('footer.team')}:{' '}
          <span className="font-semibold text-slate-200">{TEAM_NAME}</span>
          {' · '}
          {t('footer.event')}
        </p>
        <p>
          {t('footer.author')}:{' '}
          <a
            href={AUTHOR_GITHUB}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-earth underline-offset-2 hover:underline"
          >
            {AUTHOR_NICK} <span aria-hidden="true">↗</span>
            <span className="sr-only">{t('resources.newTab')}</span>
          </a>
        </p>
      </div>
    </footer>
  );
}
