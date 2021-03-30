import cookie from 'js-cookie';
import { isEmpty } from 'lodash';
import { IncomingMessage } from 'http';
import { Config } from '../../core/models';

class CookieService {
  // Expires in days, 0 is Session
  set(key: string, value: string, expires: number) {
    if (process.browser) {
      const isProd = process.env.NODE_ENV === 'production';
      cookie.set(key, value, {
        path: '/',
        ...(!isEmpty(Config.cookies.domain) && isProd
          ? { domain: Config.cookies.domain }
          : {}),
        ...(expires > 0 ? { expires } : {}),
      });
    }
  }

  get(key: string, req?: IncomingMessage) {
    return process.browser
      ? this.getFromBrowser(key)
      : this.getFromServer(key, req);
  }

  remove(key: string) {
    if (process.browser) {
      cookie.remove(key, {
        ...(!isEmpty(Config.cookies.domain)
          ? { domain: Config.cookies.domain }
          : {}),
      });
      cookie.remove(key, {
        ...(!isEmpty(Config.cookies.domain)
          ? { domain: `.${Config.cookies.domain}` }
          : {}),
      });
    }
  }

  getFromBrowser(key: string) {
    const isProd = process.env.NODE_ENV === 'production';
    return cookie.get(
      key,
      !isEmpty(Config.cookies.domain) && isProd
        ? { path: '/', domain: Config.cookies.domain }
        : { path: '/' },
    );
  }

  getFromServer(key: string, req?: IncomingMessage) {
    if (!req) {
      return undefined;
    }
    if (!req.headers.cookie) {
      return undefined;
    }
    const rawCookie = req.headers.cookie
      .split(';')
      .find((c) => c.trim().startsWith(`${key}=`));
    if (!rawCookie) {
      return undefined;
    }
    return rawCookie.split('=')[1];
  }
}

const cookieService = new CookieService();
export { cookieService };
