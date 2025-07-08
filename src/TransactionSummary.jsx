// src/TransactionSummary.jsx
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import { 
  checkForDuplicateTransactions, 
  checkForLargeCosts, 
  checkForOverdueReceivables,
  validateDoubleEntry
} from './utils/helpers.js';

export default function TransactionSummary() {
  const [summary, setSummary] = useState({
    sales: { total: 0, count: 0, unpaid: 0 },
    costs: { total: 0, count: 0, inventory: 0, cogs: 0 },
    payroll: { total: 0, count: 0, unpaid: 0 },
    misc: { total: 0, count: 0, operating: 0, assets: 0 },
    capital: { assets: 0, liabilities: 0, equity: 0 },
    inventory: { totalValue: 0, lowStock: 0 },
  });

  const [insights, setInsights] = useState([]);
  const [validationAlerts, setValidationAlerts] = useState([]);
  const [crossReferences, setCrossReferences] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [sales, costs, payroll, misc, capital, inventory] = await Promise.all([
        localforage.getItem('sales') || [],
        localforage.getItem('costs') || [],
        localforage.getItem('payroll') || [],
        localforage.getItem('miscellaneous') || [],
        localforage.getItem('capital') || [],
        localforage.getItem('inventory') || [],
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

      // Payroll summary (updated for new structure)
      const payrollSummary = {
        total: payroll.reduce((sum, p) => sum + (p.netPay || 0), 0),
        count: payroll.length,
        unpaid: 0,
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
        assets: capital.filter(c => c.category === 'Investment').reduce((sum, c) => sum + c.amount, 0),
        liabilities: capital.filter(c => c.category === 'Financing').reduce((sum, c) => sum + c.amount, 0),
        equity: capital.filter(c => c.category === 'Investment').reduce((sum, c) => sum + c.amount, 0),
      };

      // Inventory summary
      const inventorySummary = {
        totalValue: inventory.reduce((sum, i) => sum + (i.currentStock * i.unitCost), 0),
        lowStock: inventory.filter(i => i.currentStock <= i.reorderLevel).length,
      };

      setSummary({
        sales: salesSummary,
        costs: costsSummary,
        payroll: payrollSummary,
        misc: miscSummary,
        capital: capitalSummary,
        inventory: inventorySummary,
      });

      // Run validation checks
      const allTransactions = [...sales, ...costs, ...payroll, ...misc, ...capital];
      const duplicates = checkForDuplicateTransactions(allTransactions);
      const largeCosts = checkForLargeCosts(costs);
      const overdue = checkForOverdueReceivables(sales);
      const doubleEntryIssues = validateDoubleEntry(allTransactions);

      const alerts = [
        ...duplicates.map(d => ({ type: 'warning', message: `Duplicate transaction: ${d.description}`, action: 'Review and remove duplicates' })),
        ...largeCosts.map(c => ({ type: 'info', message: `Large cost: $${c.amount} - ${c.description}`, action: 'Verify amount' })),
        ...overdue.map(o => ({ type: 'error', message: `Overdue receivable: $${o.amount} - ${o.description}`, action: 'Follow up on payment' })),
        ...doubleEntryIssues.map(i => ({ type: 'error', message: `Double-entry issue: ${i.message}`, action: 'Review accounting logic' })),
      ];

      setValidationAlerts(alerts);

      // Generate cross-references
      const crossRefs = [];
      
      // Find inventory items referenced in costs/sales
      costs.forEach(cost => {
        const inventoryItem = inventory.find(i => i.name.toLowerCase().includes(cost.description.toLowerCase()));
        if (inventoryItem) {
          crossRefs.push({
            type: 'inventory-cost',
            message: `Cost "${cost.description}" (${cost.referenceNumber}) linked to inventory item "${inventoryItem.name}"`,
            references: [cost.referenceNumber, inventoryItem.id]
          });
        }
      });

      sales.forEach(sale => {
        const inventoryItem = inventory.find(i => i.name.toLowerCase().includes(sale.description.toLowerCase()));
        if (inventoryItem) {
          crossRefs.push({
            type: 'inventory-sale',
            message: `Sale "${sale.description}" (${sale.referenceNumber}) linked to inventory item "${inventoryItem.name}"`,
            references: [sale.referenceNumber, inventoryItem.id]
          });
        }
      });

      setCrossReferences(crossRefs);

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
          <h4>� Inventory</h4>
          <p><strong>${summary.inventory.totalValue.toFixed(2)}</strong></p>
          <small>{summary.inventory.lowStock > 0 ? `⚠️ ${summary.inventory.lowStock} items low stock` : '✅ All items in stock'}</small>
        </div>

        <div style={styles.card}>
          <h4>�💼 Capital</h4>
          <p><strong>Equity: ${(summary.capital.assets - summary.capital.liabilities).toFixed(2)}</strong></p>
          <small>Assets: ${summary.capital.assets.toFixed(2)} | Debt: ${summary.capital.liabilities.toFixed(2)}</small>
        </div>
      </div>

      {/* Validation Alerts */}
      {validationAlerts.length > 0 && (
        <div style={styles.alertsSection}>
          <h4>⚠️ Validation Alerts</h4>
          {validationAlerts.map((alert, index) => (
            <div key={index} style={{...styles.alert, ...styles[alert.type]}}>
              <span>{alert.message}</span>
              <small style={styles.action}>{alert.action}</small>
            </div>
          ))}
        </div>
      )}

      {/* Cross-References */}
      {crossReferences.length > 0 && (
        <div style={styles.crossRefSection}>
          <h4>🔗 Cross-References</h4>
          {crossReferences.map((ref, index) => (
            <div key={index} style={styles.crossRef}>
              <span>{ref.message}</span>
              <small>References: {ref.references.join(', ')}</small>
            </div>
          ))}
        </div>
      )}

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
  alertsSection: {
    marginBottom: '20px',
  },
  alert: {
    padding: '10px',
    borderRadius: '4px',
    margin: '5px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  crossRefSection: {
    marginBottom: '20px',
  },
  crossRef: {
    padding: '10px',
    borderRadius: '4px',
    margin: '5px 0',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
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
