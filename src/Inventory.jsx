// src/Inventory.jsx
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    referenceNumber: '',
    type: 'raw-material', // 'raw-material', 'finished-product'
    name: '',
    quantityIn: '',
    quantityOut: '',
    unit: 'bags', // 'bags', 'pallets', 'bricks', 'tons'
    sourceUse: '', // Cost Entry ID / Sales Entry ID
    remarks: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      localforage.getItem('inventory') || [],
      localforage.getItem('inventoryMovements') || [],
    ]).then(([inv, mov]) => {
      setInventory(inv);
      setMovements(mov);
    });
  }, []);

  useEffect(() => {
    localforage.setItem('inventory', inventory);
  }, [inventory]);

  useEffect(() => {
    localforage.setItem('inventoryMovements', movements);
  }, [movements]);

  const generateReferenceNumber = () => {
    return `TX-INV-${Date.now()}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    const { date, type, name, quantityIn, quantityOut, unit, sourceUse } = form;
    if (!date || !type || !name || (!quantityIn && !quantityOut) || !unit) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');

    const refNumber = form.referenceNumber || generateReferenceNumber();
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

    // Update inventory levels
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
        minimumLevel: 0,
        maximumLevel: 1000,
        lastUpdated: new Date().toISOString(),
      };
      setInventory([...inventory, newItem]);
    }
  };

  const handleEdit = (item) => setForm(item);
  const handleDelete = (id) => setMovements(movements.filter((m) => m.id !== id));

  const getStockLevel = (itemName, itemType) => {
    const item = inventory.find(i => i.name === itemName && i.type === itemType);
    return item ? item.currentStock : 0;
  };

  const getStockStatus = (currentStock, minimumLevel) => {
    if (currentStock <= minimumLevel) return 'low';
    if (currentStock <= minimumLevel * 1.5) return 'warning';
    return 'good';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧱 Inventory Tracking</h2>
      
      {error && <p style={styles.error}>{error}</p>}

      {/* Movement Entry Form */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📦 Add Stock Movement</h3>
        <div style={styles.form}>
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
            placeholder="Item Name (e.g. Cement, 6-hole Brick)"
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
            placeholder="Remarks (optional)"
            style={styles.input}
          />
          <button onClick={handleSubmit} style={styles.submitButton}>
            {form.id ? 'Update' : 'Add'} Movement
          </button>
        </div>
      </div>

      {/* Current Stock Levels */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📊 Current Stock Levels</h3>
        <div style={styles.stockGrid}>
          {inventory.map((item) => {
            const status = getStockStatus(item.currentStock, item.minimumLevel);
            return (
              <div key={item.id} style={{...styles.stockCard, ...styles[status]}}>
                <h4>{item.name}</h4>
                <p style={styles.stockLevel}>
                  <strong>{item.currentStock} {item.unit}</strong>
                </p>
                <p style={styles.stockType}>{item.type.replace('-', ' ')}</p>
                <p style={styles.lastUpdated}>
                  Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Movement History */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📋 Movement History</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Reference</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Item</th>
              <th style={styles.th}>In</th>
              <th style={styles.th}>Out</th>
              <th style={styles.th}>Net</th>
              <th style={styles.th}>Unit</th>
              <th style={styles.th}>Source/Use</th>
              <th style={styles.th}>Remarks</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id} style={styles.tr}>
                <td style={styles.td}>{m.date}</td>
                <td style={styles.td}>{m.referenceNumber}</td>
                <td style={styles.td}>{m.type.replace('-', ' ')}</td>
                <td style={styles.td}>{m.name}</td>
                <td style={styles.td}>{m.quantityIn || '-'}</td>
                <td style={styles.td}>{m.quantityOut || '-'}</td>
                <td style={{...styles.td, color: m.netChange >= 0 ? '#16a34a' : '#dc2626'}}>
                  {m.netChange > 0 ? '+' : ''}{m.netChange}
                </td>
                <td style={styles.td}>{m.unit}</td>
                <td style={styles.td}>{m.sourceUse}</td>
                <td style={styles.td}>{m.remarks}</td>
                <td style={styles.td}>
                  <button style={styles.actionButton} onClick={() => handleEdit(m)}>✏️</button>
                  <button style={styles.actionButton} onClick={() => handleDelete(m.id)}>🗑️</button>
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
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
    marginBottom: '20px',
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
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  stockGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  stockCard: {
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
  },
  stockLevel: {
    fontSize: '18px',
    margin: '10px 0',
  },
  stockType: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  lastUpdated: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  good: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  warning: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  low: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
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
