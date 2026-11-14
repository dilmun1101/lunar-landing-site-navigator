import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';
import LanguageSwitch from '@/components/ui/LanguageSwitch';
import Logo from '@/components/ui/Logo';
import ModeSwitch from '@/components/ui/ModeSwitch';
import ComparePanel from '@/features/compare/ComparePanel';
import SitePicker from '@/features/sites/SitePicker';

const tabs = [
  { to: '/scenario', labelKey: 'nav.scenario' },
  { to: '/planner', labelKey: 'nav.planner' },
];

export default function AppShell() {
  const { t } = useTranslation();

  return (
    <div className="grid min-h-screen grid-cols-[320px_1fr] grid-rows-[auto_1fr_auto] bg-space-900 text-slate-100">
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
                `flex h-full items-center border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-slate-400 hover:text-accent'
                }`
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

      <aside className="border-r border-white/10 p-4">
        <SitePicker />
      </aside>

      <main className="p-4">
        <Outlet />
      </main>

      <footer className="col-span-2 border-t border-white/10 p-4">
        <ComparePanel />
      </footer>
    </div>
  );
}
