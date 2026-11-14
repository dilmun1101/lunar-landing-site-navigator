import { NavLink, Outlet } from 'react-router';
import ComparePanel from '@/features/compare/ComparePanel';
import SitePicker from '@/features/sites/SitePicker';

const tabs = [
  { to: '/scenario', label: 'Scenario' },
  { to: '/planner', label: 'Planner' },
];

export default function AppShell() {
  return (
    <div className="grid min-h-screen grid-cols-[320px_1fr] grid-rows-[auto_1fr_auto] bg-space-900 text-slate-100">
      <header className="col-span-2 flex items-center gap-6 border-b border-white/10 px-4 py-3">
        <span className="font-semibold">Lunar Landing Navigator</span>
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to}>
              {tab.label}
            </NavLink>
          ))}
        </nav>
        {/* TODO: UnitsToggle, ModeSwitch, ShareButton */}
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
