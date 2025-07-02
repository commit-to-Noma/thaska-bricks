// src/MainApp.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to Thaska Bricks</h1>
      <p style={styles.subtitle}>Your Dreams Made Concrete 🧱</p>

      <div style={styles.menu}>
        {/* Navigate to IncomeStatement page */}
        <button
          style={styles.button}
          className="thaska-btn"
          onClick={() => navigate('/income-statement')}
        >
          📈 Income Statement
        </button>
        {/* Placeholder buttons for future pages */}
        <button
          style={styles.button}
          className="thaska-btn"
          onClick={() => alert('Clients page coming soon')}
        >
          👥 Clients
        </button>
        <button
          style={styles.button}
          className="thaska-btn"
          onClick={() => alert('Invoice page coming soon')}
        >
          🧾 New Invoice
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: '50px auto',
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
  menu: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    padding: '12px 20px',
    fontSize: 16,
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#2563eb',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
};
