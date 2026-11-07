import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'p-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'c-details/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'payment/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    // Store pages call the live API and may depend on browser cookies/local storage.
    // Render them in the browser instead of requesting remote data during prerender.
    renderMode: RenderMode.Client,
  },
];

