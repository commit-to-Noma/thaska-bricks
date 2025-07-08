import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import EnhancedForm from './components/EnhancedForm.jsx';
import { generateReferenceNumber, updateInventoryFromSale } from './utils/helpers.js';

export default function SalesInput() {
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    referenceNumber: '',
    description: '',
    quantity: '',
    unitPrice: '',
    paid: 'yes', // 'yes' or 'no' for accounts receivable
    paidVia: 'cash', // 'cash', 'bank', 'credit'
    note: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    localforage.getItem('sales').then((data) => {
      if (data) setSales(data);
    });
  }, []);

  useEffect(() => {
    localforage.setItem('sales', sales);
  }, [sales]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    const { date, description, quantity, unitPrice, paid, paidVia } = form;
    if (!date || !description || !quantity || !unitPrice || !paid || !paidVia) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    
    const newSale = {
      ...form,
      referenceNumber: form.referenceNumber || generateReferenceNumber('sales'),
      amount: Number(quantity) * Number(unitPrice),
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      cashFlowType: 'operating',
    };
    
    // Update inventory automatically if it's a product sale
    if (form.description && form.quantity) {
      await updateInventoryFromSale(newSale);
    }
    
    if (form.id !== null) {
      setSales(sales.map((item) => (item.id === form.id ? newSale : item)));
    } else {
      newSale.id = Date.now();
      setSales([...sales, newSale]);
    }
    setForm({ 
      id: null, 
      date: '', 
      referenceNumber: '', 
      description: '', 
      quantity: '', 
      unitPrice: '', 
      paid: 'yes', 
      paidVia: 'cash', 
      note: '' 
    });
  };

  const handleEdit = (sale) => setForm(sale);
  const handleDelete = (id) => setSales(sales.filter((s) => s.id !== id));

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💰 Sales Input</h2>
      
      <EnhancedForm
        formType="sales"
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
              placeholder="Product/Service Description"
              style={styles.input}
            />
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>💰 Pricing</h3>
            <input 
              name="quantity" 
              type="number" 
              value={form.quantity} 
              onChange={handleChange} 
              placeholder="Quantity"
              style={styles.input}
            />
            <input 
              name="unitPrice" 
              type="number" 
              value={form.unitPrice} 
              onChange={handleChange} 
              placeholder="Unit Price"
              style={styles.input}
            />
            <div style={styles.calculatedTotal}>
              Total: ${((form.quantity || 0) * (form.unitPrice || 0)).toFixed(2)}
            </div>
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>💳 Payment</h3>
            <select name="paid" value={form.paid} onChange={handleChange} style={styles.select}>
              <option value="yes">✅ Paid</option>
              <option value="no">⏳ Unpaid (A/R)</option>
            </select>
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
        <h3 style={styles.sectionTitle}>📊 Sales History</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Reference</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Qty</th>
              <th style={styles.th}>Unit Price</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Paid</th>
              <th style={styles.th}>Via</th>
              <th style={styles.th}>Note</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} style={styles.tr}>
                <td style={styles.td}>{s.date}</td>
                <td style={styles.td}>{s.referenceNumber}</td>
                <td style={styles.td}>{s.description}</td>
                <td style={styles.td}>{s.quantity}</td>
                <td style={styles.td}>${Number(s.unitPrice).toFixed(2)}</td>
                <td style={styles.td}>${Number(s.amount).toFixed(2)}</td>
                <td style={styles.td}>{s.paid === 'yes' ? '✅' : '⏳'}</td>
                <td style={styles.td}>{s.paidVia}</td>
                <td style={styles.td}>{s.note}</td>
                <td style={styles.td}>
                  <button style={styles.actionButton} onClick={() => handleEdit(s)}>✏️</button>
                  <button style={styles.actionButton} onClick={() => handleDelete(s.id)}>🗑️</button>
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
  calculatedTotal: {
    padding: '10px',
    backgroundColor: '#dbeafe',
    borderRadius: '4px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
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
