import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import { generateReferenceNumber, updateInventoryFromSale } from './utils/helpers.js';

export default function SalesInput() {
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    referenceNumber: '',
    productSold: '', // Renamed from description
    quantity: '',
    unitPrice: '',
    paid: 'yes', // 'yes' or 'no' for accounts receivable
    paidVia: 'cash', // 'cash', 'bank', 'ecocash'
    customerDetails: '', // Renamed from note
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
    const { date, productSold, quantity, unitPrice, paid, paidVia } = form;
    if (!date || !productSold || !quantity || !unitPrice) {
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
      description: form.productSold, // For compatibility with existing code
    };
    
    // Update inventory automatically if it's a product sale
    if (form.productSold && form.quantity) {
      try {
        await updateInventoryFromSale(newSale);
      } catch (error) {
        console.log('Inventory update error:', error);
      }
    }
    
    if (form.id !== null) {
      setSales(sales.map((item) => (item.id === form.id ? newSale : item)));
    } else {
      newSale.id = Date.now();
      setSales([...sales, newSale]);
    }
    
    // Reset form
    setForm({ 
      id: null, 
      date: '', 
      referenceNumber: '', 
      productSold: '', 
      quantity: '', 
      unitPrice: '', 
      paid: 'yes', 
      paidVia: 'cash', 
      customerDetails: '' 
    });
  };

  const handleEdit = (sale) => setForm(sale);
  const handleDelete = (id) => {
    const saleToDelete = sales.find(s => s.id === id);
    const confirmMessage = `Are you sure you want to delete this sale?\n\nProduct: ${saleToDelete?.productSold || saleToDelete?.description || 'Unknown'}\nAmount: $${saleToDelete?.amount || 0}\nDate: ${saleToDelete?.date || 'Unknown'}\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      setSales(sales.filter((s) => s.id !== id));
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💰 Sales Input</h2>
      
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
          <input 
            name="productSold" 
            value={form.productSold} 
            onChange={handleChange} 
            placeholder="Product Sold"
            style={styles.input}
            required
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
            required
          />
          <input 
            name="unitPrice" 
            type="number" 
            step="0.01"
            value={form.unitPrice} 
            onChange={handleChange} 
            placeholder="Unit Price"
            style={styles.input}
            required
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
            <option value="bank">🏦 Bank Transfer</option>
            <option value="ecocash">📱 EcoCash</option>
          </select>
          <input 
            name="customerDetails" 
            value={form.customerDetails} 
            onChange={handleChange} 
            placeholder="Customer Details"
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.submitSection}>
        <button onClick={handleSubmit} style={styles.submitButton}>
          {form.id !== null ? '✏️ Update Sale' : '➕ Add Sale'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.tableSection}>
        <h3 style={styles.sectionTitle}>📊 Sales History ({sales.length} transactions)</h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Reference</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Unit Price</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Payment</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="10" style={styles.noDataCell}>
                    No sales recorded yet. Add your first sale above!
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} style={styles.tr}>
                    <td style={styles.td}>{sale.date}</td>
                    <td style={styles.td}>{sale.referenceNumber}</td>
                    <td style={styles.td}>{sale.productSold || sale.description}</td>
                    <td style={styles.td}>{sale.quantity}</td>
                    <td style={styles.td}>${Number(sale.unitPrice || 0).toFixed(2)}</td>
                    <td style={styles.td}>${Number(sale.amount || 0).toFixed(2)}</td>
                    <td style={styles.td}>
                      <span style={sale.paid === 'yes' ? styles.paidStatus : styles.unpaidStatus}>
                        {sale.paid === 'yes' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                    <td style={styles.td}>{sale.paidVia}</td>
                    <td style={styles.td}>{sale.customerDetails || sale.note || 'N/A'}</td>
                    <td style={styles.td}>
                      <button style={styles.editButton} onClick={() => handleEdit(sale)} title="Edit this sale">
                        ✏️ Edit
                      </button>
                      <button style={styles.deleteButton} onClick={() => handleDelete(sale.id)} title="Delete this sale (cannot be undone)">
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
  calculatedTotal: {
    padding: '12px',
    backgroundColor: '#dbeafe',
    borderRadius: '6px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#1e40af',
    border: '2px solid #3b82f6',
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
  paidStatus: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  unpaidStatus: {
    color: '#dc2626',
    fontWeight: 'bold',
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
