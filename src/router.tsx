import { createBrowserRouter, Navigate } from 'react-router';
import AppShell from '@/layouts/AppShell/AppShell';

// Browser router: clean URLs. The host must serve index.html for unknown paths
// (see the catch-all rewrite in vercel.json).
export const router = createBrowserRouter([
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
