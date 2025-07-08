// src/CapitalInput.jsx
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';

export default function CapitalInput() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    description: '',
    type: '', // 'equipment', 'loan', 'investment', 'repayment'
    category: '', // 'asset', 'liability', 'equity'
    amount: '',
    paidVia: '', // 'cash', 'bank', 'loan'
    note: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    localforage.getItem('capital').then((data) => {
      if (data) setEntries(data);
    });
  }, []);

  useEffect(() => {
    localforage.setItem('capital', entries);
  }, [entries]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    const { date, description, type, category, amount, paidVia } = form;
    if (!date || !description || !type || !category || !amount || !paidVia) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    
    const newEntry = {
      ...form,
      amount: Number(amount),
      id: form.id || Date.now(),
      cashFlowType: getCashFlowType(type),
    };
    
    if (form.id !== null) {
      setEntries(entries.map((e) => (e.id === form.id ? newEntry : e)));
    } else {
      setEntries([...entries, newEntry]);
    }
    
    setForm({ 
      id: null, 
      date: '', 
      description: '', 
      type: '', 
      category: '', 
      amount: '', 
      paidVia: '', 
      note: '' 
    });
  };

  const getCashFlowType = (type) => {
    switch (type) {
      case 'equipment':
      case 'investment':
        return 'investing';
      case 'loan':
      case 'repayment':
        return 'financing';
      default:
        return 'operating';
    }
  };

  const handleEdit = (item) => setForm(item);
  const handleDelete = (id) => setEntries(entries.filter((e) => e.id !== id));

  const getTotalByCategory = (category) => {
    return entries
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <div style={styles.container}>
      <h2>Capital, Equipment & Loans</h2>
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.form}>
        <input 
          name="date" 
          type="date" 
          value={form.date} 
          onChange={handleChange} 
          placeholder="Date" 
        />
        
        <input 
          name="description" 
          value={form.description} 
          onChange={handleChange} 
          placeholder="Description" 
        />
        
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="">Select Type</option>
          <option value="equipment">Equipment Purchase</option>
          <option value="investment">Owner Investment</option>
          <option value="loan">Loan Received</option>
          <option value="repayment">Loan Repayment</option>
        </select>
        
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select Category</option>
          <option value="asset">Asset (Equipment, etc.)</option>
          <option value="liability">Liability (Loans)</option>
          <option value="equity">Equity (Investment)</option>
        </select>
        
        <input 
          name="amount" 
          type="number" 
          value={form.amount} 
          onChange={handleChange} 
          placeholder="Amount (USD)" 
        />
        
        <select name="paidVia" value={form.paidVia} onChange={handleChange}>
          <option value="">Paid Via</option>
          <option value="cash">Cash</option>
          <option value="bank">Bank Transfer</option>
          <option value="loan">Loan Proceeds</option>
        </select>
        
        <input 
          name="note" 
          value={form.note} 
          onChange={handleChange} 
          placeholder="Note (optional)" 
        />
        
        <button onClick={handleSubmit}>
          {form.id ? 'Update' : 'Add'} Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryCards}>
        <div style={styles.card}>
          <h3>Assets</h3>
          <p>${getTotalByCategory('asset').toFixed(2)}</p>
        </div>
        <div style={styles.card}>
          <h3>Liabilities</h3>
          <p>${getTotalByCategory('liability').toFixed(2)}</p>
        </div>
        <div style={styles.card}>
          <h3>Equity</h3>
          <p>${getTotalByCategory('equity').toFixed(2)}</p>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Category</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Paid Via</th>
            <th style={styles.th}>Note</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td style={styles.td}>{e.date}</td>
              <td style={styles.td}>{e.description}</td>
              <td style={styles.td}>{e.type}</td>
              <td style={styles.td}>{e.category}</td>
              <td style={styles.td}>${e.amount.toFixed(2)}</td>
              <td style={styles.td}>{e.paidVia}</td>
              <td style={styles.td}>{e.note}</td>
              <td style={styles.td}>
                <button style={styles.actionButton} onClick={() => handleEdit(e)}>✏️</button>
                <button style={styles.actionButton} onClick={() => handleDelete(e.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1000,
    margin: '20px auto',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 15,
    marginBottom: 30,
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#1e40af',
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #d1d5db',
  },
  th: {
    backgroundColor: '#f3f4f6',
    padding: '12px 8px',
    textAlign: 'left',
    borderBottom: '2px solid #d1d5db',
    fontWeight: 'bold',
  },
  td: {
    padding: '10px 8px',
    borderBottom: '1px solid #e5e7eb',
    verticalAlign: 'top',
  },
  actionButton: {
    marginRight: '5px',
    padding: '4px 8px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
};
