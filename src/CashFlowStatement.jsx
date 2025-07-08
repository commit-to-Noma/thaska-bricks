// src/CashFlowStatement.jsx
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';

export default function CashFlowStatement() {
const [month, setMonth] = useState('');
const [year, setYear] = useState('');
const [beginningCash, setBeginningCash] = useState(0);
const [operating, setOperating] = useState({ inflow: 0, outflow: 0 });
const [investing, setInvesting] = useState([{ label: '', amount: '' }]);
const [financing, setFinancing] = useState([{ label: '', amount: '' }]);
const [endingCash, setEndingCash] = useState(0);
const [history, setHistory] = useState({});

useEffect(() => {
localforage.getItem('cashFlow').then((data) => {
if (data) setHistory(data);
});
}, []);

useEffect(() => {
const key = `${year}-${month}`;
if (month && year && history) {
  const prevMonth = new Date(year, month - 2); // month is 1-based
  const prevKey = `${prevMonth.getFullYear()}-${(prevMonth.getMonth() + 1).toString().padStart(2, '0')}`;
  const prevData = history[prevKey];
  if (prevData) setBeginningCash(prevData.endingCash);
}
}, [month, year, history]);

const handleSubmit = () => {
  const totalInvesting = investing.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalFinancing = financing.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const netOperating = Number(operating.inflow) - Number(operating.outflow);
  const netChange = netOperating - totalInvesting + totalFinancing;
  const endBalance = Number(beginningCash) + netChange;

  const entry = {
    beginningCash: Number(beginningCash),
    operating,
    investing,
    financing,
    endingCash: endBalance,
  };

  const updated = { ...history, [`${year}-${month}`]: entry };
  setHistory(updated);
  localforage.setItem('cashFlow', updated);
  setEndingCash(endBalance);
};

const updateInvesting = (index, key, value) => {
const updated = [...investing];
updated[index][key] = value;
setInvesting(updated);
};

const updateFinancing = (index, key, value) => {
const updated = [...financing];
updated[index][key] = value;
setFinancing(updated);
};

return (
<div style={{ maxWidth: 800, margin: '20px auto', fontFamily: 'Arial' }}>
<h2>Cash Flow Statement</h2>

php-template
Copy
Edit
<div style={{ display: 'flex', gap: 10 }}>
  <select value={month} onChange={(e) => setMonth(e.target.value)}>
    <option value="">Month</option>
    {[...Array(12)].map((_, i) => (
      <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
        {new Date(0, i).toLocaleString('en', { month: 'long' })}
      </option>
    ))}
  </select>
  <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
</div>

    <h4>Operating Activities</h4>
    <input type="number" placeholder="Cash Inflows (e.g. Sales)" value={operating.inflow} onChange={(e) => setOperating({ ...operating, inflow: e.target.value })} />
    <input type="number" placeholder="Cash Outflows (e.g. Salaries)" value={operating.outflow} onChange={(e) => setOperating({ ...operating, outflow: e.target.value })} />

    <h4>Investing Activities</h4>
    {investing.map((item, i) => (
      <div key={i} style={{ display: 'flex', gap: 10 }}>
        <input placeholder="Label" value={item.label} onChange={(e) => updateInvesting(i, 'label', e.target.value)} />
        <input type="number" placeholder="Amount" value={item.amount} onChange={(e) => updateInvesting(i, 'amount', e.target.value)} />
      </div>
    ))}
    <button onClick={() => setInvesting([...investing, { label: '', amount: '' }])}>+ Add Investment</button>

    <h4>Financing Activities</h4>
    {financing.map((item, i) => (
      <div key={i} style={{ display: 'flex', gap: 10 }}>
        <input placeholder="Label" value={item.label} onChange={(e) => updateFinancing(i, 'label', e.target.value)} />
        <input type="number" placeholder="Amount" value={item.amount} onChange={(e) => updateFinancing(i, 'amount', e.target.value)} />
      </div>
    ))}
    <button onClick={() => setFinancing([...financing, { label: '', amount: '' }])}>+ Add Financing</button>

    <button style={{ marginTop: 20 }} onClick={handleSubmit}>Save Cash Flow</button>

    <h4 style={{ marginTop: 30 }}>Ending Cash Balance: ${endingCash.toFixed(2)}</h4>
  </div>
);
}