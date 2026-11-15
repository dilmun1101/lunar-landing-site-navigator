import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';
import LanguageSwitch from '@/components/ui/LanguageSwitch/LanguageSwitch';
import Logo from '@/components/ui/Logo/Logo';
import ModeSwitch from '@/components/ui/ModeSwitch/ModeSwitch';
import ComparePanel from '@/features/compare/ComparePanel/ComparePanel';
import ResourcesPanel from '@/features/resources/ResourcesPanel/ResourcesPanel';
import WelcomeCard from '@/features/welcome/WelcomeCard/WelcomeCard';
import Sidebar from '@/layouts/Sidebar/Sidebar';

const tabs = [
  { to: '/scenario', labelKey: 'nav.scenario' },
  { to: '/planner', labelKey: 'nav.planner' },
];

interface AppShellProps {
  className?: string;
}

export default function AppShell({ className }: AppShellProps) {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(
        'grid min-h-screen grid-cols-[320px_1fr] grid-rows-[auto_1fr_auto] bg-space-900 text-slate-100',
        className
      )}
    >
      <header className="sticky top-0 z-10 col-span-2 flex h-14 items-center gap-8 border-b border-white/10 bg-space-900/90 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-sm font-semibold tracking-[0.18em] uppercase">
            Lunar <span className="text-accent">Landing Navigator</span>
          </span>
        </div>

        <nav className="flex h-full gap-6">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                classNames(
                  'flex h-full items-center border-b-2 text-sm font-medium transition-colors',
                  {
                    'border-accent text-accent': isActive,
                    'border-transparent text-slate-400 hover:text-accent':
                      !isActive,
                  }
                )
              }
            >
              {t(tab.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <ModeSwitch />
          <LanguageSwitch />
        </div>
      </header>

      <Sidebar />

      <main className="flex flex-col gap-4 p-4">
        <WelcomeCard />
        <Outlet />
      </main>

      <footer className="border-t border-white/10 p-4">
        <ComparePanel />
        <ResourcesPanel className="mt-4 border-t border-white/10 pt-4" />
      </footer>
    </div>
  );
}
