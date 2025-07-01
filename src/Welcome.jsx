// src/Welcome.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to Thaska Bricks</h1>
      <p style={styles.subtitle}>Reliable, simple business tools — made with love</p>
      <button style={styles.button} onClick={() => navigate('/dashboard')}>
        Enter Dashboard 🚀
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: '100px auto',
    padding: 20,
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
    color: '#1e40af',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    color: '#374151',
  },
  button: {
    padding: '12px 24px',
    fontSize: 16,
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#2563eb',
    color: 'white',
    cursor: 'pointer',
  },
};
