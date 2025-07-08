// src/BalanceSheet.jsx
import React, { useEffect, useState } from 'react';
import localforage from 'localforage';

export default function BalanceSheet() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState({
    // Current Assets
    cash: 0,
    accountsReceivable: 0,
    inventory: 0,
    prepaidExpenses: 0,
    shortTermInvestments: 0,
    
    // Fixed Assets
    longTermInvestments: 0,
    propertyPlantEquipment: 0,
    accumulatedDepreciation: 0,
    intangibleAssets: 0,
    
    // Other Assets
    deferredIncomeTax: 0,
    otherAssets: 0,
    
    // Current Liabilities
    accountsPayable: 0,
    shortTermLoans: 0,
    incomeTaxesPayable: 0,
    accruedSalariesWages: 0,
    unearnedRevenue: 0,
    currentPortionLongTermDebt: 0,
    
    // Long-Term Liabilities
    longTermDebt: 0,
    deferredIncomeTaxLiab: 0,
    otherLiabilities: 0,
    
    // Owner's Equity
    ownerInvestment: 0,
    retainedEarnings: 0,
    otherEquity: 0,
  });

  useEffect(() => {
    async function loadData() {
      const [sales, costs, salaries, misc, capital, payslips] = await Promise.all([
        localforage.getItem('sales') || [],
        localforage.getItem('costs') || [],
        localforage.getItem('salaries') || [],
        localforage.getItem('miscellaneous') || [],
        localforage.getItem('capital') || [],
        localforage.getItem('payslips') || [],
      ]);

      // Filter data by selected date (if needed, for now use all data)
      const totalSales = sales.reduce((sum, s) => sum + (s.total || 0), 0);
      const totalCosts = costs.reduce((sum, c) => sum + (c.amount || 0), 0);
      const totalSalaries = salaries.reduce((sum, s) => sum + (s.amount || 0), 0);
      const totalMisc = misc.reduce((sum, m) => sum + (m.amount || 0), 0);
      const totalCapital = capital.reduce((sum, c) => sum + (c.amount || 0), 0);
      
      // Calculate net profit (retained earnings)
      const netProfit = totalSales - totalCosts - totalSalaries - totalMisc;
      
      // Calculate inventory from costs (approximation)
      const inventoryValue = totalCosts * 0.3; // Assume 30% of costs are inventory
      
      // Calculate accrued salaries
      const accruedSalaries = totalSalaries * 0.1; // Assume 10% are accrued

      setData(prev => ({
        ...prev,
        cash: netProfit > 0 ? netProfit : 0, // Cash from net profit
        inventory: inventoryValue,
        accountsPayable: totalCosts * 0.2, // Assume 20% of costs are payable
        accruedSalariesWages: accruedSalaries,
        ownerInvestment: totalCapital,
        retainedEarnings: netProfit,
      }));
    }

    loadData();
  }, [selectedDate]);

  // Calculate totals
  const totalCurrentAssets = data.cash + data.accountsReceivable + data.inventory + 
                             data.prepaidExpenses + data.shortTermInvestments;
  
  const totalFixedAssets = data.longTermInvestments + data.propertyPlantEquipment + 
                          data.accumulatedDepreciation + data.intangibleAssets;
  
  const totalOtherAssets = data.deferredIncomeTax + data.otherAssets;
  
  const totalAssets = totalCurrentAssets + totalFixedAssets + totalOtherAssets;
  
  const totalCurrentLiabilities = data.accountsPayable + data.shortTermLoans + 
                                 data.incomeTaxesPayable + data.accruedSalariesWages + 
                                 data.unearnedRevenue + data.currentPortionLongTermDebt;
  
  const totalLongTermLiabilities = data.longTermDebt + data.deferredIncomeTaxLiab + 
                                  data.otherLiabilities;
  
  const totalOwnerEquity = data.ownerInvestment + data.retainedEarnings + data.otherEquity;
  
  const totalLiabilitiesEquity = totalCurrentLiabilities + totalLongTermLiabilities + totalOwnerEquity;
  
  const balanceCheck = totalAssets - totalLiabilitiesEquity;
  const isBalanced = Math.abs(balanceCheck) < 0.01;

  return (
    <div style={styles.container}>
      {/* Page Title Section */}
      <div style={styles.header}>
        <h1 style={styles.companyName}>Thaska Bricks</h1>
        <h2 style={styles.title}>Balance Sheet</h2>
        <div style={styles.dateSection}>
          <label>As of: </label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Account</th>
            <th style={styles.th}>Amount (USD)</th>
          </tr>
        </thead>
        <tbody>
          {/* ASSETS SECTION */}
          <tr style={styles.sectionHeader}>
            <td colSpan={2} style={{...styles.td, ...styles.sectionTitle}}>ASSETS</td>
          </tr>
          
          {/* Current Assets */}
          <tr style={styles.subSectionHeader}>
            <td style={{...styles.td, paddingLeft: '20px'}}><strong>Current Assets</strong></td>
            <td style={styles.td}></td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Cash</td>
            <td style={styles.td}>${data.cash.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Accounts Receivable</td>
            <td style={styles.td}>${data.accountsReceivable.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Inventory</td>
            <td style={styles.td}>${data.inventory.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Prepaid Expenses</td>
            <td style={styles.td}>${data.prepaidExpenses.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Short-Term Investments</td>
            <td style={styles.td}>${data.shortTermInvestments.toFixed(2)}</td>
          </tr>
          <tr style={styles.totalRow}>
            <td style={{...styles.td, paddingLeft: '20px'}}><strong>Total Current Assets</strong></td>
            <td style={styles.td}><strong>${totalCurrentAssets.toFixed(2)}</strong></td>
          </tr>

          {/* Fixed Assets */}
          <tr style={styles.subSectionHeader}>
            <td style={{...styles.td, paddingLeft: '20px'}}><strong>Fixed Assets</strong></td>
            <td style={styles.td}></td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Long-term Investments</td>
            <td style={styles.td}>${data.longTermInvestments.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Property, Plant & Equipment</td>
            <td style={styles.td}>${data.propertyPlantEquipment.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Less: Accumulated Depreciation</td>
            <td style={styles.td}>${data.accumulatedDepreciation.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Intangible Assets</td>
            <td style={styles.td}>${data.intangibleAssets.toFixed(2)}</td>
          </tr>
          <tr style={styles.totalRow}>
            <td style={{...styles.td, paddingLeft: '20px'}}><strong>Total Fixed Assets</strong></td>
            <td style={styles.td}><strong>${totalFixedAssets.toFixed(2)}</strong></td>
          </tr>

          {/* Other Assets */}
          <tr style={styles.subSectionHeader}>
            <td style={{...styles.td, paddingLeft: '20px'}}><strong>Other Assets</strong></td>
            <td style={styles.td}></td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Deferred Income Tax</td>
            <td style={styles.td}>${data.deferredIncomeTax.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Other</td>
            <td style={styles.td}>${data.otherAssets.toFixed(2)}</td>
          </tr>
          <tr style={styles.totalRow}>
            <td style={{...styles.td, paddingLeft: '20px'}}><strong>Total Other Assets</strong></td>
            <td style={styles.td}><strong>${totalOtherAssets.toFixed(2)}</strong></td>
          </tr>

          {/* Total Assets */}
          <tr style={styles.grandTotal}>
            <td style={styles.td}><strong>TOTAL ASSETS</strong></td>
            <td style={styles.td}><strong>${totalAssets.toFixed(2)}</strong></td>
          </tr>

          {/* LIABILITIES AND OWNER'S EQUITY SECTION */}
          <tr style={styles.sectionHeader}>
            <td colSpan={2} style={{...styles.td, ...styles.sectionTitle}}>LIABILITIES AND OWNER'S EQUITY</td>
          </tr>

          {/* Current Liabilities */}
          <tr style={styles.subSectionHeader}>
            <td style={{...styles.td, paddingLeft: '20px'}}><strong>Current Liabilities</strong></td>
            <td style={styles.td}></td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Accounts Payable</td>
            <td style={styles.td}>${data.accountsPayable.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Short-term Loans</td>
            <td style={styles.td}>${data.shortTermLoans.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Income Taxes Payable</td>
            <td style={styles.td}>${data.incomeTaxesPayable.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Accrued Salaries & Wages</td>
            <td style={styles.td}>${data.accruedSalariesWages.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Unearned Revenue</td>
            <td style={styles.td}>${data.unearnedRevenue.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Current Portion of Long-Term Debt</td>
            <td style={styles.td}>${data.currentPortionLongTermDebt.toFixed(2)}</td>
          </tr>
          <tr style={styles.totalRow}>
            <td style={{...styles.td, paddingLeft: '20px'}}><strong>Total Current Liabilities</strong></td>
            <td style={styles.td}><strong>${totalCurrentLiabilities.toFixed(2)}</strong></td>
          </tr>

          {/* Long-Term Liabilities */}
          <tr style={styles.subSectionHeader}>
            <td style={{...styles.td, paddingLeft: '20px'}}><strong>Long-Term Liabilities</strong></td>
            <td style={styles.td}></td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Long-term Debt</td>
            <td style={styles.td}>${data.longTermDebt.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Deferred Income Tax</td>
            <td style={styles.td}>${data.deferredIncomeTaxLiab.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Other</td>
            <td style={styles.td}>${data.otherLiabilities.toFixed(2)}</td>
          </tr>
          <tr style={styles.totalRow}>
            <td style={{...styles.td, paddingLeft: '20px'}}><strong>Total Long-Term Liabilities</strong></td>
            <td style={styles.td}><strong>${totalLongTermLiabilities.toFixed(2)}</strong></td>
          </tr>

          {/* Owner's Equity */}
          <tr style={styles.subSectionHeader}>
            <td style={{...styles.td, paddingLeft: '20px'}}><strong>Owner's Equity</strong></td>
            <td style={styles.td}></td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Owner's Investment</td>
            <td style={styles.td}>${data.ownerInvestment.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Retained Earnings</td>
            <td style={styles.td}>${data.retainedEarnings.toFixed(2)}</td>
          </tr>
          <tr>
            <td style={{...styles.td, paddingLeft: '40px'}}>Other</td>
            <td style={styles.td}>${data.otherEquity.toFixed(2)}</td>
          </tr>
          <tr style={styles.totalRow}>
            <td style={{...styles.td, paddingLeft: '20px'}}><strong>Total Owner's Equity</strong></td>
            <td style={styles.td}><strong>${totalOwnerEquity.toFixed(2)}</strong></td>
          </tr>

          {/* Total Liabilities + Equity */}
          <tr style={styles.grandTotal}>
            <td style={styles.td}><strong>TOTAL LIABILITIES + EQUITY</strong></td>
            <td style={styles.td}><strong>${totalLiabilitiesEquity.toFixed(2)}</strong></td>
          </tr>

          {/* Balance Check */}
          <tr style={isBalanced ? styles.balanceOk : styles.balanceError}>
            <td style={styles.td}><strong>Balance Check (Should be $0.00)</strong></td>
            <td style={styles.td}><strong>${balanceCheck.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1000,
    margin: '30px auto',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid #2563eb',
    paddingBottom: '20px',
  },
  companyName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e40af',
    margin: '0 0 10px 0',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#374151',
    margin: '0 0 15px 0',
  },
  dateSection: {
    fontSize: '16px',
    color: '#6b7280',
  },
  dateInput: {
    padding: '5px 10px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    marginLeft: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '2px solid #374151',
    fontSize: '14px',
  },
  th: {
    backgroundColor: '#f3f4f6',
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '2px solid #374151',
    fontWeight: 'bold',
    border: '1px solid #d1d5db',
  },
  td: {
    padding: '8px 15px',
    border: '1px solid #d1d5db',
    verticalAlign: 'top',
  },
  sectionHeader: {
    backgroundColor: '#2563eb',
    color: 'white',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: '16px',
    textAlign: 'center',
    padding: '12px',
  },
  subSectionHeader: {
    backgroundColor: '#e5e7eb',
  },
  totalRow: {
    backgroundColor: '#f9fafb',
    borderTop: '2px solid #374151',
    borderBottom: '2px solid #374151',
  },
  grandTotal: {
    backgroundColor: '#dbeafe',
    borderTop: '3px solid #2563eb',
    borderBottom: '3px solid #2563eb',
    fontWeight: 'bold',
  },
  balanceOk: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  balanceError: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
};
