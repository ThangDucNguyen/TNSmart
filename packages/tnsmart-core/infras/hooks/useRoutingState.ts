import { useEffect, useState } from 'react';
import { Router, useRouter } from 'next/router';

const getBasicPath = (link) => link.split('?')?.[0];
export const useRoutingState: (needParams?: boolean) => boolean = (
  needParams = true,
) => {
  const [isRouting, setIsRouting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const routeChangeStart = (e) => {
      const link = getBasicPath(e);
      const nextLink = getBasicPath(router.asPath);

      if (needParams && link !== nextLink) {
        setIsRouting(true);
        return;
      }
      if (!needParams && e !== router.asPath) {
        setIsRouting(true);
        return;
      }
    };
    const routeChangeComplete = (e) => {
      setIsRouting(false);
    };
    Router.events.on('routeChangeStart', routeChangeStart);
    Router.events.on('routeChangeComplete', routeChangeComplete);
    Router.events.on('routeChangeError', routeChangeComplete);
    return () => {
      Router.events.off('routeChangeStart', routeChangeStart);
      Router.events.off('routeChangeComplete', routeChangeComplete);
      Router.events.off('routeChangeError', routeChangeComplete);
    };
  }, []);
  return isRouting;
};
