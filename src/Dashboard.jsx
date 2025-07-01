import React from 'react';

// Inject custom button styles (optional)
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    .thaska-btn {
      background-color: #2563eb;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: background-color 0.3s;
    }
    .thaska-btn:hover {
      background-color: #1e40af !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default function Dashboard() {
  // We removed useNavigate for now — it needs a Router provider
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to Thaska Bricks</h1>
      <p style={styles.subtitle}>Your Dreams Made Concrete</p>

      <div style={styles.menu}>
        <button
          style={styles.button}
          className="thaska-btn"
          onClick={() => alert('Create a new invoice')}
        >
          🧾 New Invoice
        </button>
        <button
          style={styles.button}
          className="thaska-btn"
          onClick={() => alert('View clients')}
        >
          👥 Clients
        </button>
        <button
          style={styles.button}
          className="thaska-btn"
          onClick={() => alert('View income statement')}
        >
          📈 Income Statement
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
    border: '1px solid #ddd',
    borderRadius: 8,
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  title: {
    marginBottom: 8,
    color: '#1e40af',
  },
  subtitle: {
    marginBottom: 30,
    color: '#374151',
  },
  menu: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    padding: '15px 25px',
    fontSize: 16,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
  },
};
