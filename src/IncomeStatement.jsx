import React, { useState, useEffect } from 'react';
import localforage from 'localforage';

export default function IncomeStatement() {
  const [sales, setSales] = useState([]);
  const [costs, setCosts] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filtered, setFiltered] = useState(false);

  const formatUSD = (num) => `$${num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

  const isInRange = (date) => {
    if (!fromDate || !toDate) return false;
    const d = new Date(date);
    return d >= new Date(fromDate) && d <= new Date(toDate);
  };

  useEffect(() => {
    const loadData = async () => {
      const salesData = (await localforage.getItem('sales')) || [];
      const costsData = (await localforage.getItem('costs')) || [];
      const salariesData = (await localforage.getItem('salaries')) || [];
      setSales(salesData);
      setCosts(costsData);
      setSalaries(salariesData);
    };
    loadData();
  }, []);

  const filterData = () => {
    setFiltered(true);
  };

  const filteredSales = sales.filter((s) => isInRange(s.date));
  const filteredCosts = costs.filter((c) => isInRange(c.date));
  const filteredSalaries = salaries.filter((s) => isInRange(s.date));

  const totalSales = filteredSales.reduce((sum, s) => sum + s.amount, 0);
  const rawMaterials = filteredCosts
    .filter((c) => c.category === 'Raw Materials')
    .reduce((sum, c) => sum + c.amount, 0);
  const directLabour = filteredCosts
    .filter((c) => c.category === 'Direct Labour')
    .reduce((sum, c) => sum + c.amount, 0);
  const overheads = filteredCosts
    .filter((c) => c.category === 'Manufacturing Overheads')
    .reduce((sum, c) => sum + c.amount, 0);
  const rent = filteredCosts
    .filter((c) => c.category === 'Rent')
    .reduce((sum, c) => sum + c.amount, 0);
  const utilities = filteredCosts
    .filter((c) => c.category === 'Utilities')
    .reduce((sum, c) => sum + c.amount, 0);
  const transport = filteredCosts
    .filter((c) => c.category === 'Transport/Fuel')
    .reduce((sum, c) => sum + c.amount, 0);
  const depreciation = filteredCosts
    .filter((c) => c.category === 'Depreciation')
    .reduce((sum, c) => sum + c.amount, 0);
  const otherExpenses = filteredCosts
    .filter((c) => !['Raw Materials', 'Direct Labour', 'Manufacturing Overheads', 'Rent', 'Utilities', 'Transport/Fuel', 'Depreciation'].includes(c.category))
    .reduce((sum, c) => sum + c.amount, 0);

  const totalCOGS = rawMaterials + directLabour + overheads;
  const grossProfit = totalSales - totalCOGS;
  const totalOperating = filteredSalaries.reduce((sum, s) => sum + s.amount, 0) + rent + utilities + transport + depreciation + otherExpenses;
  const operatingProfit = grossProfit - totalOperating;
  const interestIncome = 0;
  const interestExpense = 0;
  const assetGains = 0;
  const netOther = interestIncome - interestExpense + assetGains;
  const netBeforeTax = operatingProfit + netOther;
  const tax = 0;
  const netFinal = netBeforeTax - tax;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 1000, margin: '20px auto' }}>
      <h2>Income Statement for Thaska Bricks</h2>
      <p>For the Period From {fromDate || '____'} to {toDate || '____'}</p>

      <div style={{ marginBottom: 16 }}>
        <label>From: <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></label>
        <label style={{ marginLeft: 20 }}>To: <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></label>
        <button style={{ marginLeft: 20 }} onClick={filterData}>Generate</button>
      </div>

      {filtered && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1" cellPadding="8">
          <thead style={{ backgroundColor: '#e0e7ff' }}>
            <tr>
              <th>Description</th>
              <th>Amounts</th>
              <th>Totals</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan="3"><strong>REVENUE</strong></td></tr>
            <tr><td>Sales</td><td>{formatUSD(totalSales)}</td><td></td></tr>
            <tr><td>Other Revenue</td><td>{formatUSD(0)}</td><td></td></tr>
            <tr style={{ backgroundColor: '#d1fae5' }}><td><strong>Total Revenue</strong></td><td></td><td>{formatUSD(totalSales)}</td></tr>

            <tr><td colSpan="3"><strong>COST OF GOODS SOLD</strong></td></tr>
            <tr><td>Raw Materials</td><td>{formatUSD(rawMaterials)}</td><td></td></tr>
            <tr><td>Direct Labour</td><td>{formatUSD(directLabour)}</td><td></td></tr>
            <tr><td>Manufacturing Overheads</td><td>{formatUSD(overheads)}</td><td></td></tr>
            <tr style={{ backgroundColor: '#d1fae5' }}><td><strong>Total COGS</strong></td><td></td><td>{formatUSD(totalCOGS)}</td></tr>

            <tr style={{ backgroundColor: '#bfdbfe' }}><td><strong>GROSS PROFIT</strong></td><td></td><td>{formatUSD(grossProfit)}</td></tr>

            <tr><td colSpan="3"><strong>OPERATING EXPENSES</strong></td></tr>
            <tr><td>Salaries</td><td>{formatUSD(filteredSalaries.reduce((sum, s) => sum + s.amount, 0))}</td><td></td></tr>
            <tr><td>Rent</td><td>{formatUSD(rent)}</td><td></td></tr>
            <tr><td>Utilities</td><td>{formatUSD(utilities)}</td><td></td></tr>
            <tr><td>Transport/Fuel</td><td>{formatUSD(transport)}</td><td></td></tr>
            <tr><td>Depreciation</td><td>{formatUSD(depreciation)}</td><td></td></tr>
            <tr><td>Other Expenses</td><td>{formatUSD(otherExpenses)}</td><td></td></tr>
            <tr style={{ backgroundColor: '#d1fae5' }}><td><strong>Total Operating Expenses</strong></td><td></td><td>{formatUSD(totalOperating)}</td></tr>

            <tr style={{ backgroundColor: '#bfdbfe' }}><td><strong>OPERATING PROFIT</strong></td><td></td><td>{formatUSD(operatingProfit)}</td></tr>

            <tr><td colSpan="3"><strong>OTHER INCOME / EXPENSES</strong></td></tr>
            <tr><td>Interest Income</td><td>{formatUSD(interestIncome)}</td><td></td></tr>
            <tr><td>Interest Expense</td><td>{formatUSD(interestExpense)}</td><td></td></tr>
            <tr><td>Gain/Loss on Assets</td><td>{formatUSD(assetGains)}</td><td></td></tr>
            <tr style={{ backgroundColor: '#d1fae5' }}><td><strong>Net Other Inc./Exp.</strong></td><td></td><td>{formatUSD(netOther)}</td></tr>

            <tr style={{ backgroundColor: '#bfdbfe' }}><td><strong>NET PROFIT BEFORE TAX</strong></td><td></td><td>{formatUSD(netBeforeTax)}</td></tr>
            <tr><td>Tax (manual entry)</td><td>{formatUSD(tax)}</td><td></td></tr>
            <tr style={{ backgroundColor: '#bbf7d0' }}><td><strong>NET PROFIT (FINAL)</strong></td><td></td><td><strong>{formatUSD(netFinal)}</strong></td></tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
