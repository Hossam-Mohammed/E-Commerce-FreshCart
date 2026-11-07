import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { headerInterceptor } from './core/interceptors/Header/header-interceptor';
import {CookieService} from 'ngx-cookie-service';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes , withViewTransitions() , withInMemoryScrolling({scrollPositionRestoration : 'top' , anchorScrolling:'enabled'})),
    importProvidersFrom(CarouselModule , CookieService),
    provideToastr(),
    provideHttpClient(withInterceptors([headerInterceptor])),
    provideClientHydration()
  ]
};
