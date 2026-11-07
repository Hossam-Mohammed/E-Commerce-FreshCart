import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  let _PLATFORM_ID = inject(PLATFORM_ID)
  let _CookieService = inject(CookieService)
  // wishlist - cart - user - address - orders 

  if(isPlatformBrowser(_PLATFORM_ID)){
    if(_CookieService.check('userToken')){
      if(req.url.includes('cart') || req.url.includes('wishlist') || req.url.includes('users') || req.url.includes('addresses') || req.url.includes('products') || req.url.includes('orders') || req.url.includes('reviews') || req.url.includes('/auth/verifyToken')){
        req = req.clone({
          setHeaders: {token : _CookieService.get('userToken')}
        })
      }
    }
  }
  return next(req);
};
