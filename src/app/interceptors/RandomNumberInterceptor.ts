import { HttpInterceptorFn } from '@angular/common/http';

export const randomNumberInterceptor: HttpInterceptorFn = (req, next) => {
  const randomNumber = localStorage.getItem('chatSession');

  const modifiedReq = randomNumber
    ? req.clone({
        setHeaders: {
          'X-Session-Id': randomNumber
        }
      })
    : req;

  return next(modifiedReq);
};
