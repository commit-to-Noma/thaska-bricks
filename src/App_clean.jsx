import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import logo from './assets/logo.jpg';

// Import your existing components
import Welcome from './Welcome.jsx';
import IncomeStatement from './IncomeStatement.jsx';
import SalesInput from './SalesInput.jsx';
import CostsInput from './CostsInput.jsx';
import PayrollTab from './PayrollInput.jsx';
import BalanceSheet from './BalanceSheet.jsx';
import CashFlowStatement from './CashFlowStatement';
import CapitalInput from './CapitalInput.jsx';
import Inventory from './Inventory.jsx';
import TransactionSummary from './TransactionSummary.jsx';
import SplashScreen from './SplashScreen.jsx';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'sales', label: 'Sales', icon: '💰', path: '/sales' },
    { id: 'payroll', label: 'Payroll', icon: '👥', path: '/payroll' },
    { id: 'costs', label: 'Costs & Expenses', icon: '🧱', path: '/costs' },
    { id: 'capital', label: 'Capital & Equipment', icon: '🏭', path: '/capital' },
    { id: 'inventory', label: 'Inventory', icon: '📦', path: '/inventory' },
    { id: 'income-statement', label: 'Income Statement', icon: '📈', path: '/income-statement' },
    { id: 'balance-sheet', label: 'Balance Sheet', icon: '⚖️', path: '/balance-sheet' },
    { id: 'cashflow', label: 'Cash Flow', icon: '📊', path: '/cashflow' },
  ];

  return (
    <div style={styles.sidebar}>
      {/* Logo and Company Name */}
      <div style={styles.sidebarHeader}>
        <img src={logo} alt="Thaska Bricks" style={styles.sidebarLogo} />
        <h2 style={styles.sidebarTitle}>Thaska Bricks</h2>
      </div>

      {/* Navigation Tabs */}
      <nav style={styles.nav}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{
              ...styles.navButton,
              ...(location.pathname === tab.path ? styles.navButtonActive : {})
            }}
            onClick={() => navigate(tab.path)}
          >
            <span style={styles.navIcon}>{tab.icon}</span>
            <span style={styles.navLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function MainContent() {
  const location = useLocation();

  // Show welcome message when no specific tab is selected
  if (location.pathname === '/') {
    return (
      <div style={styles.welcomeContainer}>
        <div style={styles.welcomeHeader}>
          <h1 style={styles.welcomeTitle}>Welcome to Thaska Bricks</h1>
          <p style={styles.welcomeSubtitle}>Your Dreams Made Concrete 🧱</p>
          <p style={styles.welcomeText}>Select a tab from the sidebar to get started.</p>
        </div>
        <div style={styles.summaryGrid}>
          <TransactionSummary />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.mainContent}>
      <Routes>
        <Route path="/sales" element={<SalesInput />} />
        <Route path="/payroll" element={<PayrollTab />} />
        <Route path="/costs" element={<CostsInput />} />
        <Route path="/capital" element={<CapitalInput />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/income-statement" element={<IncomeStatement />} />
        <Route path="/balance-sheet" element={<BalanceSheet />} />
        <Route path="/cashflow" element={<CashFlowStatement />} />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Show splash screen for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <div style={styles.appContainer}>
        <Sidebar />
        <div style={styles.mainArea}>
          <MainContent />
        </div>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    fontFamily: 'Arial, sans-serif',
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#1e40af', // Thaska blue
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
  },
  sidebarHeader: {
    padding: '20px',
    textAlign: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '20px',
  },
  sidebarLogo: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '10px',
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  nav: {
    flex: 1,
    padding: '0 10px',
  },
  navButton: {
    width: '100%',
    padding: '15px 20px',
    margin: '5px 0',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '16px',
    transition: 'all 0.2s ease',
  },
  navButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: 'translateX(5px)',
  },
  navIcon: {
    fontSize: '20px',
    marginRight: '15px',
    minWidth: '25px',
  },
  navLabel: {
    textAlign: 'left',
  },
  mainArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
    overflow: 'auto',
  },
  mainContent: {
    padding: '20px',
    maxWidth: '100%',
    overflow: 'auto',
  },
  welcomeContainer: {
    padding: '20px',
    height: '100%',
    overflow: 'auto',
  },
  welcomeHeader: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#374151',
  },
  welcomeMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    color: '#374151',
  },
  summaryGrid: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  welcomeTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: '10px',
  },
  welcomeSubtitle: {
    fontSize: '1.2rem',
    marginBottom: '20px',
    color: '#6b7280',
  },
  welcomeText: {
    fontSize: '1rem',
    color: '#9ca3af',
  },
};
