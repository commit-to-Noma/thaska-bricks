import React from 'react';

export default function IncomeStatement() {
  const sales = JSON.parse(localStorage.getItem('sales') || '[]');
  const otherRevenue = JSON.parse(localStorage.getItem('otherRevenue') || '[]');
  const rawMaterials = JSON.parse(localStorage.getItem('rawMaterials') || '[]');
  const directLabour = JSON.parse(localStorage.getItem('directLabour') || '[]');
  const manufacturingOverheads = JSON.parse(localStorage.getItem('manufacturingOverheads') || '[]');
  const salaries = JSON.parse(localStorage.getItem('salaries') || '[]');
  const rent = JSON.parse(localStorage.getItem('rent') || '[]');
  const utilities = JSON.parse(localStorage.getItem('utilities') || '[]');
  const transportFuel = JSON.parse(localStorage.getItem('transportFuel') || '[]');
  const depreciation = JSON.parse(localStorage.getItem('depreciation') || '[]');
  const userExpense1 = JSON.parse(localStorage.getItem('userExpense1') || '[]');
  const userExpense2 = JSON.parse(localStorage.getItem('userExpense2') || '[]');
  const interestIncome = JSON.parse(localStorage.getItem('interestIncome') || '[]');
  const interestExpense = JSON.parse(localStorage.getItem('interestExpense') || '[]');
  const gainLossAssets = JSON.parse(localStorage.getItem('gainLossAssets') || '[]');
  const tax = Number(localStorage.getItem('tax') || 0);

  const sumAmounts = (arr) => arr.reduce((sum, item) => sum + (item.amount || 0), 0);

  const totalSales = sumAmounts(sales);
  const totalOtherRevenue = sumAmounts(otherRevenue);
  const totalRawMaterials = sumAmounts(rawMaterials);
  const totalDirectLabour = sumAmounts(directLabour);
  const totalManufacturingOverheads = sumAmounts(manufacturingOverheads);
  const totalSalaries = sumAmounts(salaries);
  const totalRent = sumAmounts(rent);
  const totalUtilities = sumAmounts(utilities);
  const totalTransportFuel = sumAmounts(transportFuel);
  const totalDepreciation = sumAmounts(depreciation);
  const totalUserExpense1 = sumAmounts(userExpense1);
  const totalUserExpense2 = sumAmounts(userExpense2);
  const totalInterestIncome = sumAmounts(interestIncome);
  const totalInterestExpense = sumAmounts(interestExpense);
  const totalGainLossAssets = sumAmounts(gainLossAssets);

  const totalRevenue = totalSales + totalOtherRevenue;
  const totalCostOfSales = totalRawMaterials + totalDirectLabour + totalManufacturingOverheads;
  const grossProfit = totalRevenue - totalCostOfSales;
  const totalOperatingExpenses = totalSalaries + totalRent + totalUtilities + totalTransportFuel + totalDepreciation + totalUserExpense1 + totalUserExpense2;
  const operatingProfit = grossProfit - totalOperatingExpenses;
  const netOtherIncome = totalInterestIncome - totalInterestExpense + totalGainLossAssets;
  const netProfitBeforeTax = operatingProfit + netOtherIncome;
  const netProfit = netProfitBeforeTax - tax;

  const formatUSD = (num) => `$${num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

  const row = (label, raw = '', calc = '', style = {}) => (
    <tr style={style}>
      <td>{label}</td>
      <td style={{ textAlign: 'right' }}>{raw !== '' ? formatUSD(raw) : ''}</td>
      <td style={{ textAlign: 'right' }}>{calc !== '' ? formatUSD(calc) : ''}</td>
    </tr>
  );

  return (
    <div style={{ maxWidth: 800, margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 0 }}>Income Statement for Thaska Bricks</h2>
      <p style={{ textAlign: 'center', marginTop: 0 }}>For the Period: 01/01/2025 – 31/12/2025</p>

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f1f1' }}>
            <th>Description</th>
            <th>Raw Amount (USD)</th>
            <th>Calculation Result (USD)</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ backgroundColor: '#e0e0e0' }}><td colSpan="3"><strong>REVENUE</strong></td></tr>
          {row('Sales', totalSales)}
          {row('Other Revenue', totalOtherRevenue)}
          {row('Total Revenue', '', totalRevenue, { fontWeight: 'bold' })}

          <tr style={{ backgroundColor: '#e0e0e0' }}><td colSpan="3"><strong>COST OF SALES</strong></td></tr>
          {row('Raw Materials', totalRawMaterials)}
          {row('Direct Labour', totalDirectLabour)}
          {row('Manufacturing Overheads', totalManufacturingOverheads)}
          {row('Total Cost of Sales', '', totalCostOfSales, { fontWeight: 'bold' })}

          {row('GROSS PROFIT', '', grossProfit, { fontWeight: 'bold', backgroundColor: '#cce5ff' })}

          <tr style={{ backgroundColor: '#e0e0e0' }}><td colSpan="3"><strong>OPERATING EXPENSES</strong></td></tr>
          {row('Salaries (linked from Employee Tab)', totalSalaries)}
          {row('Rent', totalRent)}
          {row('Utilities', totalUtilities)}
          {row('Transport/Fuel', totalTransportFuel)}
          {row('Depreciation', totalDepreciation)}
          {row('User-defined Expense 1', totalUserExpense1)}
          {row('User-defined Expense 2', totalUserExpense2)}
          {row('Total Operating Expenses', '', totalOperatingExpenses, { fontWeight: 'bold' })}

          {row('OPERATING PROFIT', '', operatingProfit, { fontWeight: 'bold', backgroundColor: '#cce5ff' })}

          <tr style={{ backgroundColor: '#e0e0e0' }}><td colSpan="3"><strong>OTHER INCOME / EXPENSES</strong></td></tr>
          {row('Interest Income', totalInterestIncome)}
          {row('Interest Expense', totalInterestExpense)}
          {row('Gain/Loss on Assets', totalGainLossAssets)}
          {row('Net Other Income/Expenses', '', netOtherIncome, { fontWeight: 'bold' })}

          {row('NET PROFIT BEFORE TAX', '', netProfitBeforeTax, { fontWeight: 'bold' })}
          {row('Tax (manual entry)', tax)}
          {row('NET PROFIT (FINAL)', '', netProfit, { fontWeight: 'bold', backgroundColor: '#d4edda' })}
        </tbody>
      </table>
    </div>
  );
}
