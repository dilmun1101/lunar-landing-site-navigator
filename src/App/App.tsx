import { Suspense } from 'react';
import { RouterProvider } from 'react-router/dom';
import { router } from '@/router';

export default function App() {
  // Translations are loaded over the network (i18next-http-backend); Suspense while waiting.
  return (
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
