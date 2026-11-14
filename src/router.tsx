import { createHashRouter, Navigate } from 'react-router';
import AppShell from '@/layouts/AppShell/AppShell';

// Hash-роутер: работает на любом статическом хостинге (GitHub Pages и т.п.)
// и не ломает относительный base в vite.config.ts.
export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/scenario" replace /> },
      {
        path: 'scenario',
        lazy: async () => ({
          Component: (await import('@/pages/ScenarioPage/ScenarioPage'))
            .default,
        }),
      },
      {
        path: 'planner',
        lazy: async () => ({
          Component: (await import('@/pages/PlannerPage/PlannerPage')).default,
        }),
      },
      { path: '*', element: <Navigate to="/scenario" replace /> },
    ],
  },
]);
