'use client';

import dynamic from 'next/dynamic';

// Client-only: the app reads the JWT from localStorage.
const App = dynamic(() => import('../App'), { ssr: false });

export default function Page() {
  return <App />;
}
