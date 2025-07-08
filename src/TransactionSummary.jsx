// src/TransactionSummary.jsx
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';

export default function TransactionSummary() {
  const [summary, setSummary] = useState({
    sales: { total: 0, count: 0, unpaid: 0 },
    costs: { total: 0, count: 0, inventory: 0, cogs: 0 },
    payroll: { total: 0, count: 0, unpaid: 0 },
    misc: { total: 0, count: 0, operating: 0, assets: 0 },
    capital: { assets: 0, liabilities: 0, equity: 0 },
  });

  const [insights, setInsights] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [sales, costs, payslips, misc, capital] = await Promise.all([
        localforage.getItem('sales') || [],
        localforage.getItem('costs') || [],
        localforage.getItem('payslips') || [],
        localforage.getItem('miscellaneous') || [],
        localforage.getItem('capital') || [],
      ]);

      // Sales summary
      const salesSummary = {
        total: sales.reduce((sum, s) => sum + (s.amount || 0), 0),
        count: sales.length,
        unpaid: sales.filter(s => s.paid === 'no').reduce((sum, s) => sum + s.amount, 0),
      };

      // Costs summary
      const costsSummary = {
        total: costs.reduce((sum, c) => sum + (c.amount || 0), 0),
        count: costs.length,
        inventory: costs.filter(c => c.usedInProduction === 'no').reduce((sum, c) => sum + c.amount, 0),
        cogs: costs.filter(c => c.usedInProduction === 'yes').reduce((sum, c) => sum + c.amount, 0),
      };

      // Payroll summary
      const payrollSummary = {
        total: payslips.reduce((sum, p) => {
          const totalBenefits = (p.benefits || []).reduce((s, b) => s + Number(b.amount || 0), 0);
          const totalDeductions = (p.deductions || []).reduce((s, d) => s + Number(d.amount || 0), 0);
          return sum + Number(p.basicSalary || 0) + totalBenefits - totalDeductions;
        }, 0),
        count: payslips.length,
        unpaid: 0, // Will need to add "paid" field to payroll
      };

      // Misc summary
      const miscSummary = {
        total: misc.reduce((sum, m) => sum + (m.amount || 0), 0),
        count: misc.length,
        operating: misc.filter(m => m.expenseType === 'operating').reduce((sum, m) => sum + m.amount, 0),
        assets: misc.filter(m => m.expenseType === 'asset').reduce((sum, m) => sum + m.amount, 0),
      };

      // Capital summary
      const capitalSummary = {
        assets: capital.filter(c => c.category === 'asset').reduce((sum, c) => sum + c.amount, 0),
        liabilities: capital.filter(c => c.category === 'liability').reduce((sum, c) => sum + c.amount, 0),
        equity: capital.filter(c => c.category === 'equity').reduce((sum, c) => sum + c.amount, 0),
      };

      setSummary({
        sales: salesSummary,
        costs: costsSummary,
        payroll: payrollSummary,
        misc: miscSummary,
        capital: capitalSummary,
      });

      // Generate insights
      const newInsights = [];
      
      if (salesSummary.unpaid > 0) {
        newInsights.push({
          type: 'warning',
          message: `$${salesSummary.unpaid.toFixed(2)} in unpaid sales (Accounts Receivable)`,
          action: 'Review Sales tab'
        });
      }

      if (costsSummary.inventory > costsSummary.cogs) {
        newInsights.push({
          type: 'info',
          message: `High inventory: $${costsSummary.inventory.toFixed(2)} vs COGS: $${costsSummary.cogs.toFixed(2)}`,
          action: 'Consider using more materials'
        });
      }

      if (capitalSummary.liabilities > capitalSummary.assets) {
        newInsights.push({
          type: 'warning',
          message: 'Liabilities exceed assets - negative equity',
          action: 'Review Capital tab'
        });
      }

      const grossProfit = salesSummary.total - costsSummary.cogs;
      const netProfit = grossProfit - payrollSummary.total - miscSummary.operating;
      
      if (netProfit < 0) {
        newInsights.push({
          type: 'error',
          message: `Negative profit: $${netProfit.toFixed(2)}`,
          action: 'Review expenses or increase sales'
        });
      } else {
        newInsights.push({
          type: 'success',
          message: `Profitable: $${netProfit.toFixed(2)} net profit`,
          action: 'Great work!'
        });
      }

      setInsights(newInsights);
    } catch (error) {
      console.error('Error loading transaction data:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📊 Transaction Summary</h3>
      
      {/* Summary Cards */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <h4>💰 Sales</h4>
          <p><strong>${summary.sales.total.toFixed(2)}</strong></p>
          <small>{summary.sales.count} transactions</small>
          {summary.sales.unpaid > 0 && (
            <p style={styles.unpaid}>⏳ ${summary.sales.unpaid.toFixed(2)} unpaid</p>
          )}
        </div>

        <div style={styles.card}>
          <h4>🧱 Costs</h4>
          <p><strong>${summary.costs.total.toFixed(2)}</strong></p>
          <small>COGS: ${summary.costs.cogs.toFixed(2)} | Inventory: ${summary.costs.inventory.toFixed(2)}</small>
        </div>

        <div style={styles.card}>
          <h4>📃 Payroll</h4>
          <p><strong>${summary.payroll.total.toFixed(2)}</strong></p>
          <small>{summary.payroll.count} employees</small>
        </div>

        <div style={styles.card}>
          <h4>💼 Capital</h4>
          <p><strong>Equity: ${(summary.capital.assets - summary.capital.liabilities).toFixed(2)}</strong></p>
          <small>Assets: ${summary.capital.assets.toFixed(2)} | Debt: ${summary.capital.liabilities.toFixed(2)}</small>
        </div>
      </div>

      {/* Insights */}
      <div style={styles.insights}>
        <h4>💡 Insights</h4>
        {insights.map((insight, index) => (
          <div key={index} style={{...styles.insight, ...styles[insight.type]}}>
            <span>{insight.message}</span>
            <small style={styles.action}>{insight.action}</small>
          </div>
        ))}
      </div>

      <button onClick={loadAllData} style={styles.refreshButton}>
        🔄 Refresh Summary
      </button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    margin: '0 0 20px 0',
    color: '#1e40af',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: '#f8fafc',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  },
  unpaid: {
    color: '#dc2626',
    fontSize: '12px',
    margin: '5px 0 0 0',
  },
  insights: {
    marginBottom: '20px',
  },
  insight: {
    padding: '10px',
    borderRadius: '4px',
    margin: '5px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  action: {
    fontStyle: 'italic',
    opacity: 0.8,
  },
  success: {
    backgroundColor: '#dcfce7',
    borderLeft: '4px solid #22c55e',
  },
  info: {
    backgroundColor: '#dbeafe',
    borderLeft: '4px solid #3b82f6',
  },
  warning: {
    backgroundColor: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
  },
  error: {
    backgroundColor: '#fee2e2',
    borderLeft: '4px solid #ef4444',
  },
  refreshButton: {
    padding: '10px 20px',
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};
