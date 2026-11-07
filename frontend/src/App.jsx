import { Suspense, lazy, useEffect } from 'react';
import { useHashRoute } from './lib/useHashRoute';
import { BottomNav, FooterNote, TopBar } from './components/AppShell';
import Landing from './pages/Landing';

// The tools pull in the charting library, so load them only when opened.
const Planner = lazy(() => import('./pages/Planner'));
const Simulator = lazy(() => import('./pages/Simulator'));
const Report = lazy(() => import('./pages/Report'));

const TITLES = {
  home: 'Steady — plan for income that doesn’t arrive neatly',
  plan: 'Income Smoothing Planner · Steady',
  simulate: 'What-if Simulator · Steady',
  report: 'Prove My Income · Steady',
};

export default function App() {
  const route = useHashRoute();

  useEffect(() => {
    document.title = TITLES[route];
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
