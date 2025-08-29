import { HttpInterceptorFn } from '@angular/common/http';

export const localizationInterceptor: HttpInterceptorFn = (req, next) => {
  const cloneReq = req.clone({
    headers: req.headers.set('Accept-Language', localStorage.getItem('lang') || 'ar')
  })
  return next(cloneReq);
};
