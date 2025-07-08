// src/CapitalInput.jsx
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import EnhancedForm from './components/EnhancedForm.jsx';
import { generateReferenceNumber } from './utils/helpers.js';

export default function CapitalInput() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    referenceNumber: '',
    description: '',
    type: '', // 'Equipment', 'Loan', 'Investment', 'Repayment'
    category: '', // 'Investment', 'Financing'
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
      referenceNumber: form.referenceNumber || generateReferenceNumber('capital'),
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
      referenceNumber: '',
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
      case 'Equipment':
      case 'Investment':
        return 'investing';
      case 'Loan':
      case 'Repayment':
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
      <h2 style={styles.title}>💼 Capital, Equipment & Loans</h2>
      
      <EnhancedForm
        formType="capital"
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
      >
        <div style={styles.formGrid}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📅 Transaction Details</h3>
            <input 
              name="date" 
              type="date" 
              value={form.date} 
              onChange={handleChange} 
              style={styles.input}
            />
            <input 
              name="referenceNumber" 
              value={form.referenceNumber} 
              onChange={handleChange} 
              placeholder="Reference (auto-generated)"
              style={styles.input}
            />
            <input 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              placeholder="Description"
              style={styles.input}
            />
            <input 
              name="amount" 
              type="number" 
              value={form.amount} 
              onChange={handleChange} 
              placeholder="Amount (USD)"
              style={styles.input}
            />
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🏷️ Classification</h3>
            <select name="type" value={form.type} onChange={handleChange} style={styles.select}>
              <option value="">Select Type</option>
              <option value="Equipment">🏗️ Equipment Purchase</option>
              <option value="Investment">💰 Owner Investment</option>
              <option value="Loan">🏦 Loan Received</option>
              <option value="Repayment">💳 Loan Repayment</option>
            </select>
            <select name="category" value={form.category} onChange={handleChange} style={styles.select}>
              <option value="">Select Category</option>
              <option value="Investment">💼 Investment</option>
              <option value="Financing">🏦 Financing</option>
            </select>
            <div style={styles.infoBox}>
              <small>
                {form.type === 'Equipment' || form.type === 'Investment'
                  ? '💡 This will be recorded as an investing activity' 
                  : '💡 This will be recorded as a financing activity'}
              </small>
            </div>
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>💳 Payment Details</h3>
            <select name="paidVia" value={form.paidVia} onChange={handleChange} style={styles.select}>
              <option value="">Paid Via</option>
              <option value="cash">💵 Cash</option>
              <option value="bank">🏦 Bank Transfer</option>
              <option value="loan">🏦 Loan Proceeds</option>
            </select>
            <input 
              name="note" 
              value={form.note} 
              onChange={handleChange} 
              placeholder="Additional Notes"
              style={styles.input}
            />
          </div>
        </div>
      </EnhancedForm>

      {error && <p style={styles.error}>{error}</p>}

      {/* Summary Cards */}
      <div style={styles.summaryCards}>
        <div style={styles.card}>
          <h3>💼 Investments</h3>
          <p>${getTotalByCategory('Investment').toFixed(2)}</p>
        </div>
        <div style={styles.card}>
          <h3>🏦 Financing</h3>
          <p>${getTotalByCategory('Financing').toFixed(2)}</p>
        </div>
        <div style={styles.card}>
          <h3>💰 Net Capital</h3>
          <p>${(getTotalByCategory('Investment') - getTotalByCategory('Financing')).toFixed(2)}</p>
        </div>
      </div>

      <div style={styles.tableSection}>
        <h3 style={styles.sectionTitle}>📊 Capital History</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Reference</th>
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
              <tr key={e.id} style={styles.tr}>
                <td style={styles.td}>{e.date}</td>
                <td style={styles.td}>{e.referenceNumber}</td>
                <td style={styles.td}>{e.description}</td>
                <td style={styles.td}>{e.type}</td>
                <td style={styles.td}>{e.category}</td>
                <td style={styles.td}>${e.amount.toFixed(2)}</td>
                <td style={styles.td}>{e.paidVia}</td>
                <td style={styles.td}>{e.note}</td>
                <td style={styles.td}>
                  <button style={styles.actionButton} onClick={() => handleEdit(e)}>✏️</button>
                  <button style={styles.actionButton} onClick={() => handleDelete(e.id)}>🗑️</button>
                  <button style={styles.actionButton} title="Export PDF">📄</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1200,
    margin: '30px auto',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  title: {
    textAlign: 'center',
    color: '#1e40af',
    marginBottom: '30px',
    borderBottom: '2px solid #2563eb',
    paddingBottom: '10px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  section: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
  },
  sectionTitle: {
    color: '#374151',
    marginBottom: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '10px',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    marginBottom: '10px',
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#1e40af',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    margin: '20px 0',
  },
  card: {
    backgroundColor: '#1e40af',
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  tableSection: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #e5e7eb',
  },
  th: {
    backgroundColor: '#f3f4f6',
    padding: '12px 8px',
    textAlign: 'left',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  td: {
    padding: '10px 8px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
  },
  tr: {
    ':hover': {
      backgroundColor: '#f9fafb',
    },
  },
  actionButton: {
    marginRight: '5px',
    padding: '4px 8px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '14px',
    backgroundColor: '#f3f4f6',
  },
  error: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
};
