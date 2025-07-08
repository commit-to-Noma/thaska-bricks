import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import EnhancedForm from './components/EnhancedForm.jsx';
import { generateReferenceNumber, updateInventoryFromCost } from './utils/helpers.js';

export default function CostsInput() {
  const [costs, setCosts] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    referenceNumber: '',
    category: '',
    description: '',
    amount: '',
    usedInProduction: 'yes', // 'yes' = COGS, 'no' = Inventory
    paidVia: 'cash', // 'cash', 'bank', 'credit'
    note: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    localforage.getItem('costs').then((saved) => {
      if (saved) setCosts(saved);
    });
  }, []);

  useEffect(() => {
    localforage.setItem('costs', costs);
  }, [costs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const { date, category, description, amount, usedInProduction, paidVia } = form;
    if (!date || !category || !description || !amount || !usedInProduction || !paidVia) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');

    const newCost = {
      ...form,
      referenceNumber: form.referenceNumber || generateReferenceNumber('costs'),
      amount: Number(amount),
      cashFlowType: 'operating',
    };

    // Update inventory automatically if it's for production
    if (form.usedInProduction === 'yes' && form.description) {
      await updateInventoryFromCost(newCost);
    }

    if (form.id !== null) {
      setCosts(costs.map((item) => (item.id === form.id ? newCost : item)));
    } else {
      newCost.id = Date.now();
      setCosts([...costs, newCost]);
    }

    setForm({ 
      id: null, 
      date: '', 
      referenceNumber: '',
      category: '', 
      description: '', 
      amount: '', 
      usedInProduction: 'yes', 
      paidVia: 'cash', 
      note: '' 
    });
  };

  const handleEdit = (item) => setForm(item);
  const handleDelete = (id) => setCosts(costs.filter((c) => c.id !== id));

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧱 Costs Input</h2>
      
      <EnhancedForm
        formType="costs"
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
            <select name="category" value={form.category} onChange={handleChange} style={styles.select}>
              <option value="">Select Category</option>
              <option value="COGS">COGS - Cost of Goods Sold</option>
              <option value="Operating">Operating Expenses</option>
              <option value="Asset">Asset Purchase</option>
            </select>
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
            <h3 style={styles.sectionTitle}>🏭 Production Usage</h3>
            <select name="usedInProduction" value={form.usedInProduction} onChange={handleChange} style={styles.select}>
              <option value="yes">✅ Used in Production (COGS)</option>
              <option value="no">📦 Inventory (Not used yet)</option>
            </select>
            <div style={styles.infoBox}>
              <small>
                {form.usedInProduction === 'yes' 
                  ? '💡 This will be recorded as COGS and auto-logged in inventory' 
                  : '💡 This will be recorded as inventory until used in production'}
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
        <h3 style={styles.sectionTitle}>📊 Costs History</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Reference</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Usage</th>
              <th style={styles.th}>Paid Via</th>
              <th style={styles.th}>Note</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((c) => (
              <tr key={c.id} style={styles.tr}>
                <td style={styles.td}>{c.date}</td>
                <td style={styles.td}>{c.referenceNumber}</td>
                <td style={styles.td}>{c.category}</td>
                <td style={styles.td}>{c.description}</td>
                <td style={styles.td}>${c.amount.toFixed(2)}</td>
                <td style={styles.td}>
                  {c.usedInProduction === 'yes' ? '🏭 COGS' : '📦 Inventory'}
                </td>
                <td style={styles.td}>{c.paidVia}</td>
                <td style={styles.td}>{c.note}</td>
                <td style={styles.td}>
                  <button style={styles.actionButton} onClick={() => handleEdit(c)}>✏️</button>
                  <button style={styles.actionButton} onClick={() => handleDelete(c.id)}>🗑️</button>
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
