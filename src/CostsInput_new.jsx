import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
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
    paidVia: 'cash', // 'cash', 'bank', 'ecocash'
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
  
  const handleDelete = (id) => {
    const costToDelete = costs.find(c => c.id === id);
    const confirmMessage = `Are you sure you want to delete this cost entry?\n\nDescription: ${costToDelete?.description || 'Unknown'}\nAmount: $${costToDelete?.amount || 0}\nDate: ${costToDelete?.date || 'Unknown'}\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      setCosts(costs.filter((c) => c.id !== id));
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧱 Costs Input</h2>
      
      <div style={styles.formGrid}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📅 Transaction Details</h3>
          <input 
            name="date" 
            type="date" 
            value={form.date} 
            onChange={handleChange} 
            style={styles.input}
            required
          />
          {form.referenceNumber && (
            <div style={styles.referenceDisplay}>
              <strong>Reference: {form.referenceNumber}</strong>
            </div>
          )}
          <select name="category" value={form.category} onChange={handleChange} style={styles.select} required>
            <option value="">Select Category</option>
            <option value="Expense">Expense</option>
            <option value="Asset Purchase">Asset Purchase</option>
            <option value="Cost of Goods Sold">Cost of Goods Sold</option>
          </select>
          <input 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            placeholder="Description"
            style={styles.input}
            required
          />
          <input 
            name="amount" 
            type="number" 
            step="0.01"
            value={form.amount} 
            onChange={handleChange} 
            placeholder="Amount (USD)"
            style={styles.input}
            required
          />
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🏭 Production Usage</h3>
          <div style={styles.checkboxContainer}>
            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={form.usedInProduction === 'yes'} 
                onChange={(e) => setForm({...form, usedInProduction: e.target.checked ? 'yes' : 'no'})}
                style={styles.checkbox}
              />
              Used in Production?
            </label>
          </div>
          <div style={styles.infoBox}>
            <small>
              {form.usedInProduction === 'yes' 
                ? '💡 This will be recorded as an expense and auto-logged in inventory' 
                : '💡 This will be recorded as inventory until used in production'}
            </small>
          </div>
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>💳 Payment Details</h3>
          <select name="paidVia" value={form.paidVia} onChange={handleChange} style={styles.select}>
            <option value="cash">💵 Cash</option>
            <option value="bank">🏦 Bank Transfer</option>
            <option value="ecocash">📱 EcoCash</option>
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

      <div style={styles.submitSection}>
        <button onClick={handleSubmit} style={styles.submitButton}>
          {form.id !== null ? '✏️ Update Cost' : '➕ Add Cost Entry'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.tableSection}>
        <h3 style={styles.sectionTitle}>📊 Costs History ({costs.length} entries)</h3>
        <div style={styles.tableContainer}>
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
              {costs.length === 0 ? (
                <tr>
                  <td colSpan="9" style={styles.noDataCell}>
                    No cost entries recorded yet. Add your first cost entry above!
                  </td>
                </tr>
              ) : (
                costs.map((c) => (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.td}>{c.date}</td>
                    <td style={styles.td}>{c.referenceNumber}</td>
                    <td style={styles.td}>{c.category}</td>
                    <td style={styles.td}>{c.description}</td>
                    <td style={styles.td}>${Number(c.amount || 0).toFixed(2)}</td>
                    <td style={styles.td}>
                      {c.usedInProduction === 'yes' ? '🏭 Production' : '📦 Inventory'}
                    </td>
                    <td style={styles.td}>{c.paidVia}</td>
                    <td style={styles.td}>{c.note || 'N/A'}</td>
                    <td style={styles.td}>
                      <button style={styles.editButton} onClick={() => handleEdit(c)} title="Edit this cost entry">
                        ✏️ Edit
                      </button>
                      <button style={styles.deleteButton} onClick={() => handleDelete(c.id)} title="Delete this cost entry (cannot be undone)">
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  title: {
    textAlign: 'center',
    color: '#1e40af',
    marginBottom: '30px',
    borderBottom: '2px solid #2563eb',
    paddingBottom: '10px',
    fontSize: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
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
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '10px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    marginBottom: '10px',
    boxSizing: 'border-box',
  },
  referenceDisplay: {
    padding: '10px',
    backgroundColor: '#f0f9ff',
    borderRadius: '4px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#0369a1',
    border: '1px solid #0284c7',
    marginBottom: '10px',
  },
  submitSection: {
    textAlign: 'center',
    margin: '30px 0',
  },
  submitButton: {
    padding: '12px 30px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    minWidth: '150px',
  },
  checkboxContainer: {
    marginBottom: '15px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '500',
  },
  checkbox: {
    marginRight: '8px',
    width: '16px',
    height: '16px',
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
    marginTop: '30px',
  },
  tableContainer: {
    overflowX: 'auto',
    maxWidth: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
  },
  th: {
    backgroundColor: '#f3f4f6',
    padding: '12px 8px',
    textAlign: 'left',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: 'bold',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 8px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    verticalAlign: 'top',
  },
  tr: {
    transition: 'background-color 0.2s ease',
  },
  editButton: {
    marginRight: '8px',
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    backgroundColor: '#3b82f6',
    color: 'white',
    transition: 'background-color 0.2s ease',
    fontWeight: '500',
  },
  deleteButton: {
    marginRight: '8px',
    padding: '8px 12px',
    border: '1px solid #dc2626',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    backgroundColor: 'white',
    color: '#dc2626',
    transition: 'all 0.2s ease',
    fontWeight: '500',
  },
  noDataCell: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
    fontSize: '16px',
    fontStyle: 'italic',
  },
  error: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #fca5a5',
  },
};
