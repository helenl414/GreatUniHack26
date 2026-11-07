import { useEffect, useState } from 'react';

export const ROUTES = ['plan', 'simulate', 'report'];

const read = () => {
  const r = window.location.hash.replace(/^#\/?/, '');
  return ROUTES.includes(r) ? r : 'home';
};

export function useHashRoute() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const go = (route) => {
  window.location.hash = route === 'home' ? '/' : `/${route}`;
};
