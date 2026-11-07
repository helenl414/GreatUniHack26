import { Suspense, lazy, useEffect, useRef } from 'react';
import { useHashRoute } from './lib/useHashRoute';
import { BottomNav, FooterNote, TopBar } from './components/AppShell';
import Landing from './pages/Landing';

// The tools pull in the charting library, so load them only when opened.
const Planner = lazy(() => import('./pages/Planner'));
const Simulator = lazy(() => import('./pages/Simulator'));
const Report = lazy(() => import('./pages/Report'));

const TITLES = {
  home: 'Sothis — money planning for irregular income',
  plan: 'Income Smoothing Planner · Sothis',
  simulate: 'What-if Simulator · Sothis',
  report: 'Prove My Income · Sothis',
};

export default function App() {
  const route = useHashRoute();
  const firstRender = useRef(true);

  useEffect(() => {
    document.title = TITLES[route];
    // After in-app navigation, move focus to the new page's heading so keyboard and
    // screen-reader users land at the top of the new content (pages may still be loading).
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    let tries = 0;
    let frame;
    const focusTitle = () => {
      const target = document.querySelector('[data-page-title]') || document.getElementById('main');
      if (target && (target.id !== 'main' || tries > 20)) target.focus({ preventScroll: true });
      else if (tries++ < 30) frame = requestAnimationFrame(focusTitle);
    };
    frame = requestAnimationFrame(focusTitle);
    return () => cancelAnimationFrame(frame);
  }, [route]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <TopBar route={route} />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div className="wrap" style={{ minHeight: '60vh' }} />}>
          {route === 'home' && <Landing />}
          {route === 'plan' && <Planner />}
          {route === 'simulate' && <Simulator />}
          {route === 'report' && <Report />}
        </Suspense>
      </main>
      <FooterNote />
      <BottomNav route={route} />
    </>
  );
}
