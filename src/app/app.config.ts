// src/app/app.config.ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Angular 20 — zoneless change detection (optionnel mais recommandé avec Signals)
    provideZonelessChangeDetection(),

    // Router avec input binding et View Transitions API
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions()
    ),

    // HTTP avec intercepteur JWT fonctionnel + Fetch API
    provideHttpClient(
      withInterceptors([jwtInterceptor]),
      withFetch()
    ),

    // Animations asynchrones
    provideAnimationsAsync(),
  ]
};
