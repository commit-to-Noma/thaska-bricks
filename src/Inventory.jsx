// src/Inventory.jsx
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import { generateReferenceNumber } from './utils/helpers.js';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    referenceNumber: '',
    type: 'raw-material',
    name: '',
    quantityIn: '',
    quantityOut: '',
    unit: 'bags',
    sourceUse: '',
    remarks: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [inv, mov] = await Promise.all([
          localforage.getItem('inventory'),
          localforage.getItem('inventoryMovements'),
        ]);
        setInventory(inv || []);
        setMovements(mov || []);
      } catch (error) {
        console.error('Error loading inventory data:', error);
        setInventory([]);
        setMovements([]);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (inventory.length > 0) {
      localforage.setItem('inventory', inventory);
    }
  }, [inventory]);

  useEffect(() => {
    if (movements.length > 0) {
      localforage.setItem('inventoryMovements', movements);
    }
  }, [movements]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    const { date, type, name, quantityIn, quantityOut, unit } = form;
    if (!date || !type || !name || (!quantityIn && !quantityOut) || !unit) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');

    const refNumber = form.referenceNumber || generateReferenceNumber('inventory');
    const newMovement = {
      ...form,
      id: form.id || Date.now(),
      referenceNumber: refNumber,
      quantityIn: Number(quantityIn || 0),
      quantityOut: Number(quantityOut || 0),
      netChange: Number(quantityIn || 0) - Number(quantityOut || 0),
      timestamp: new Date().toISOString(),
    };

    if (form.id !== null) {
      setMovements(movements.map((m) => (m.id === form.id ? newMovement : m)));
    } else {
      setMovements([...movements, newMovement]);
    }

    updateInventoryLevels(name, type, unit, newMovement.netChange);

    setForm({
      id: null,
      date: '',
      referenceNumber: '',
      type: 'raw-material',
      name: '',
      quantityIn: '',
      quantityOut: '',
      unit: 'bags',
      sourceUse: '',
      remarks: '',
    });
  };

  const updateInventoryLevels = (itemName, itemType, unit, netChange) => {
    const existing = inventory.find(i => i.name === itemName && i.type === itemType);
    if (existing) {
      const updated = inventory.map(item =>
        item.name === itemName && item.type === itemType
          ? { ...item, currentStock: item.currentStock + netChange, lastUpdated: new Date().toISOString() }
          : item
      );
      setInventory(updated);
    } else {
      const newItem = {
        id: Date.now(),
        name: itemName,
        type: itemType,
        unit: unit,
        currentStock: netChange,
        minimumLevel: 10,
        unitCost: 0,
        reorderLevel: 20,
        lastUpdated: new Date().toISOString(),
      };
      setInventory([...inventory, newItem]);
    }
  };

  const handleEdit = (item) => setForm(item);
  const handleDelete = (id) => setMovements(movements.filter((m) => m.id !== id));

  const getStockStatus = (currentStock, minimumLevel) => {
    const stock = currentStock || 0;
    const minLevel = minimumLevel || 0;
    
    if (stock <= minLevel) return 'low';
    if (stock <= minLevel * 1.5) return 'warning';
    return 'good';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📦 Inventory Tracking</h2>
      
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>➕ Add Inventory Movement</h3>
        {error && <p style={styles.error}>{error}</p>}
        
        <div style={styles.formGrid}>
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
          <select name="type" value={form.type} onChange={handleChange} style={styles.select}>
            <option value="raw-material">Raw Material</option>
            <option value="finished-product">Finished Product</option>
          </select>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Item Name"
            style={styles.input}
          />
          <input
            name="quantityIn"
            type="number"
            value={form.quantityIn}
            onChange={handleChange}
            placeholder="Quantity In"
            style={styles.input}
          />
          <input
            name="quantityOut"
            type="number"
            value={form.quantityOut}
            onChange={handleChange}
            placeholder="Quantity Out"
            style={styles.input}
          />
          <select name="unit" value={form.unit} onChange={handleChange} style={styles.select}>
            <option value="bags">Bags</option>
            <option value="pallets">Pallets</option>
            <option value="bricks">Bricks</option>
            <option value="tons">Tons</option>
            <option value="pieces">Pieces</option>
          </select>
          <input
            name="sourceUse"
            value={form.sourceUse}
            onChange={handleChange}
            placeholder="Source/Use Reference"
            style={styles.input}
          />
          <input
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            placeholder="Remarks"
            style={styles.input}
          />
          <button onClick={handleSubmit} style={styles.submitButton}>
            {form.id ? 'Update' : 'Add'} Movement
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📦 Current Stock Levels</h3>
        <div style={styles.stockGrid}>
          {inventory.length > 0 ? inventory.map((item, index) => {
            const status = getStockStatus(item.currentStock, item.minimumLevel);
            return (
              <div key={item.id || index} style={{...styles.stockCard, ...styles[status]}}>
                <h4>{item.name || 'Unknown Item'}</h4>
                <p style={styles.stockLevel}>
                  <strong>{item.currentStock || 0} {item.unit || 'units'}</strong>
                </p>
                <p style={styles.stockType}>{(item.type || '').replace('-', ' ')}</p>
                <p style={styles.lastUpdated}>
                  Updated: {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'Never'}
                </p>
              </div>
            );
          }) : (
            <div style={styles.emptyState}>
              <p>No inventory items yet. Add some items using the form above!</p>
            </div>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📋 Movement History</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Reference</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Item</th>
              <th style={styles.th}>Qty In</th>
              <th style={styles.th}>Qty Out</th>
              <th style={styles.th}>Net Change</th>
              <th style={styles.th}>Unit</th>
              <th style={styles.th}>Source/Use</th>
              <th style={styles.th}>Remarks</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movements.length > 0 ? movements.map((m, index) => (
              <tr key={m.id || index} style={styles.tr}>
                <td style={styles.td}>{m.date || ''}</td>
                <td style={styles.td}>{m.referenceNumber || ''}</td>
                <td style={styles.td}>{(m.type || '').replace('-', ' ')}</td>
                <td style={styles.td}>{m.name || ''}</td>
                <td style={styles.td}>{m.quantityIn || '-'}</td>
                <td style={styles.td}>{m.quantityOut || '-'}</td>
                <td style={{...styles.td, color: (m.netChange || 0) >= 0 ? '#16a34a' : '#dc2626'}}>
                  {(m.netChange || 0) > 0 ? '+' : ''}{m.netChange || 0}
                </td>
                <td style={styles.td}>{m.unit || ''}</td>
                <td style={styles.td}>{m.sourceUse || ''}</td>
                <td style={styles.td}>{m.remarks || ''}</td>
                <td style={styles.td}>
                  <button style={styles.actionButton} onClick={() => handleEdit(m)}>✏️</button>
                  <button style={styles.actionButton} onClick={() => handleDelete(m.id)}>🗑️</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="11" style={{...styles.td, textAlign: 'center', fontStyle: 'italic', color: '#6b7280'}}>
                  No movements recorded yet
                </td>
              </tr>
            )}
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
  section: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  sectionTitle: {
    color: '#374151',
    marginBottom: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    alignItems: 'end',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  stockGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
  },
  stockCard: {
    padding: '15px',
    borderRadius: '8px',
    border: '2px solid',
    textAlign: 'center',
  },
  stockLevel: {
    fontSize: '18px',
    margin: '10px 0',
  },
  stockType: {
    fontSize: '12px',
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  lastUpdated: {
    fontSize: '11px',
    opacity: 0.6,
  },
  good: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  warning: {
    backgroundColor: '#fefce8',
    borderColor: '#eab308',
  },
  low: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
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
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
    fontStyle: 'italic',
  },
};
