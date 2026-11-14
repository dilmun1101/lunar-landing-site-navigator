import { createHashRouter, Navigate } from 'react-router';
import AppShell from '@/layouts/AppShell/AppShell';

// Hash router: works on any static hosting (GitHub Pages, etc.)
// and does not break the relative base in vite.config.ts.
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
