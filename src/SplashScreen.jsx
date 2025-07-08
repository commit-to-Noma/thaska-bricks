// SplashScreen.jsx
import React, { useEffect } from 'react';
import logo from './assets/logo.jpg';

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // Show splash for 3 seconds as requested
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div style={styles.container}>
      <img src={logo} alt="Thaska Bricks Logo" style={styles.logo} />
      <h1 style={styles.text}>THASKA BRICKS</h1>
      <p style={styles.subtitle}>Your Dreams Made Concrete</p>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#1a3a7c', // custom deep blue
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: '50%',
    objectFit: 'cover',
    animation: 'pulse 2s infinite',
  },
  text: {
    fontSize: '2em',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: '1.2rem',
    opacity: 0.9,
  },
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `;
  document.head.appendChild(styleSheet);
}