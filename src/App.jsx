import React, { useState } from 'react';
import SplashScreen from './SplashScreen';
import MainApp from './MainApp';

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return loaded ? <MainApp /> : <SplashScreen onFinish={() => setLoaded(true)} />;
}
