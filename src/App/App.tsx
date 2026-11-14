import { Suspense } from 'react';
import { RouterProvider } from 'react-router/dom';
import { router } from '@/router';

export default function App() {
  // Переводы загружаются по сети (i18next-http-backend), пока ждём — Suspense.
  return (
    <Suspense fallback={null}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
