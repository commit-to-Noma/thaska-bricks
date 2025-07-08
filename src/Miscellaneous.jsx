// src/Miscellaneous.jsx
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import EnhancedForm from './components/EnhancedForm.jsx';
import { generateReferenceNumber } from './utils/helpers.js';

export default function Miscellaneous() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    referenceNumber: '',
    category: '',
    expenseType: 'Operating', // 'Operating', 'Repair', 'Asset'
    description: '',
    amount: '',
    recurring: 'no', // 'yes', 'no'
    paidVia: 'cash', // 'cash', 'bank', 'credit'
    note: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    localforage.getItem('miscellaneous').then((data) => {
      if (data) setEntries(data);
    });
  }, []);

  useEffect(() => {
    localforage.setItem('miscellaneous', entries);
  }, [entries]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    const { date, category, expenseType, description, amount, paidVia } = form;
    if (!date || !category || !expenseType || !description || !amount || !paidVia) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    
    const newEntry = { 
      ...form, 
      referenceNumber: form.referenceNumber || generateReferenceNumber('misc'),
      amount: Number(amount),
      cashFlowType: expenseType === 'Asset' ? 'investing' : 'operating',
    };
    
    if (form.id !== null) {
      setEntries(entries.map((e) => (e.id === form.id ? newEntry : e)));
    } else {
      newEntry.id = Date.now();
      setEntries([...entries, newEntry]);
    }
    
    setForm({ 
      id: null, 
      date: '', 
      referenceNumber: '',
      category: '', 
      expenseType: 'Operating', 
      description: '', 
      amount: '', 
      recurring: 'no', 
      paidVia: 'cash', 
      note: '' 
    });
  };

  const handleEdit = (item) => setForm(item);
  const handleDelete = (id) => setEntries(entries.filter((e) => e.id !== id));

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧰 Miscellaneous Expenses</h2>
      
      <EnhancedForm
        formType="miscellaneous"
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
              name="category" 
              value={form.category} 
              onChange={handleChange} 
              placeholder="Category (e.g. Repairs, Insurance)"
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
            <select name="expenseType" value={form.expenseType} onChange={handleChange} style={styles.select}>
              <option value="Operating">💼 Operating Expense</option>
              <option value="Repair">🔧 Repair/Maintenance</option>
              <option value="Asset">🏗️ Asset Purchase</option>
            </select>
            <select name="recurring" value={form.recurring} onChange={handleChange} style={styles.select}>
              <option value="no">📅 One-time</option>
              <option value="yes">🔄 Recurring</option>
            </select>
            <div style={styles.infoBox}>
              <small>
                {form.expenseType === 'Asset' 
                  ? '💡 This will be recorded as an investing activity' 
                  : '💡 This will be recorded as an operating expense'}
              </small>
            </div>
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>💳 Payment Details</h3>
            <select name="paidVia" value={form.paidVia} onChange={handleChange} style={styles.select}>
              <option value="cash">💵 Cash</option>
              <option value="bank">🏦 Bank</option>
              <option value="credit">💳 Credit</option>
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

      <div style={styles.tableSection}>
        <h3 style={styles.sectionTitle}>📊 Miscellaneous Expenses History</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Reference</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Recurring</th>
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
                <td style={styles.td}>{e.category}</td>
                <td style={styles.td}>{e.expenseType}</td>
                <td style={styles.td}>{e.description}</td>
                <td style={styles.td}>${e.amount.toFixed(2)}</td>
                <td style={styles.td}>{e.recurring === 'yes' ? '🔄' : '📅'}</td>
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
// This component allows users to manage miscellaneous expenses, including adding, editing, and deleting entries.
// It uses localForage for persistent storage and provides a simple form for input.