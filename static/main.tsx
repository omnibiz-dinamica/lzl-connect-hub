// Entry point of the static build for shared hosting (Hostnet, FTP).
// Used only by `npm run build:static`; the Lovable build (vite.config.ts) never loads this folder.
import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { HeadContent, RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import '../src/styles.css';

// On Lovable the root route renders <html>/<head>/<body> on the server.
// Here the app mounts inside <div id="root">, so the shell only manages the <head> tags.
function StaticShell({ children }: { children: ReactNode }) {
  return (
    <>
      <HeadContent />
      {children}
    </>
  );
}
routeTree.update({ shellComponent: StaticShell });

const router = createRouter({
  routeTree,
  context: { queryClient: new QueryClient() },
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');
createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
