import type { ReactNode } from 'react';
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { MeProvider } from '../hooks/useMe.jsx';

// Setter lys/mørk-tema før første maling, så siden ikke blinker.
const THEME_INIT =
  "try{var t=localStorage.getItem('vask.theme');if(t&&t!=='auto')document.documentElement.setAttribute('data-theme',t)}catch(e){}";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Vaskeplan' },
    ],
    links: [
      { rel: 'stylesheet', href: '/style.css?v=3' },
    ],
  }),
  component: () => (
    <MeProvider>
      <Outlet />
    </MeProvider>
  ),
  // Start rendrer hele dokumentet fra rotruten – derfor <html>, <head> og <body> her.
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="no" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
