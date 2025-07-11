// src/Inventory.jsx
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import { generateReferenceNumber } from './utils/helpers.js';

// Product catalogs
const FINISHED_PRODUCTS = [
  'Standard Concrete Bricks',
  'Machine-Pressed Blocks', 
  'Kerbstones',
  '3D Pavers',
  'Arrow Pavers',
  'Zig Zag Pavers',
  'Dog Bone Pavers',
  'Equestrian Pavers',
];

const RAW_MATERIALS = [
  'Cement (50kg bags)',
  'Sand (cubic meters)',
  'Stone/Aggregate',
  'Pigments/Colorants',
  'Water (liters)',
  'Plastic wrap/pallets',
  'Machine lubricant',
  'Spare parts',
];

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    type: 'raw-material',
    name: '',
    customName: '',
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
        const inventoryData = await localforage.getItem('inventory');
        const movementsData = await localforage.getItem('inventoryMovements');
        if (inventoryData) setInventory(inventoryData);
        if (movementsData) setMovements(movementsData);
      } catch (error) {
        console.error('Error loading inventory data:', error);
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
    const { date, type, name, customName, quantityIn, quantityOut, unit } = form;
    const itemName = name === 'custom' ? customName : name;
    
    if (!date || !type || !itemName || (!quantityIn && !quantityOut) || !unit) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');

    const refNumber = generateReferenceNumber('inventory');
    const newMovement = {
      ...form,
      id: form.id || Date.now(),
      referenceNumber: refNumber,
      name: itemName,
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

    updateInventoryLevels(itemName, type, unit, newMovement.netChange);

    setForm({
      id: null,
      date: '',
      type: 'raw-material',
      name: '',
      customName: '',
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
      const updated = {
        ...existing,
        currentStock: (existing.currentStock || 0) + netChange,
        lastUpdated: new Date().toISOString(),
      };
      setInventory(inventory.map(i => 
        i.name === itemName && i.type === itemType ? updated : i
      ));
    } else {
      const newItem = {
        id: Date.now(),
        name: itemName,
        type: itemType,
        unit: unit,
        currentStock: netChange,
        minimumLevel: 10, // Default minimum level
        lastUpdated: new Date().toISOString(),
      };
      setInventory([...inventory, newItem]);
    }
  };

  const handleEdit = (item) => setForm(item);
  
  const handleDelete = (id) => {
    const movementToDelete = movements.find(m => m.id === id);
    const confirmMessage = `Are you sure you want to delete this inventory movement?\n\nItem: ${movementToDelete?.name || 'Unknown'}\nNet Change: ${movementToDelete?.netChange || 0}\nDate: ${movementToDelete?.date || 'Unknown'}\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      setMovements(movements.filter((m) => m.id !== id));
    }
  };

  const getStockStatus = (currentStock, minimumLevel) => {
    const stock = currentStock || 0;
    const minLevel = minimumLevel || 0;
    
    if (stock <= minLevel) return 'low';
    if (stock <= minLevel * 1.5) return 'warning';
    return 'good';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📦 Inventory Management</h2>
      
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
            required
          />
          <select name="type" value={form.type} onChange={handleChange} style={styles.select} required>
            <option value="raw-material">📦 Raw Material</option>
            <option value="finished-product">🧱 Finished Product</option>
          </select>
          <select name="name" value={form.name} onChange={handleChange} style={styles.select} required>
            <option value="">Select Item</option>
            {(form.type === 'finished-product' ? FINISHED_PRODUCTS : RAW_MATERIALS).map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
            <option value="custom">➕ Custom Item (specify below)</option>
          </select>
          {form.name === 'custom' && (
            <input
              name="customName"
              value={form.customName}
              onChange={handleChange}
              placeholder="Enter custom item name"
              style={styles.input}
              required
            />
          )}
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
          <select name="unit" value={form.unit} onChange={handleChange} style={styles.select} required>
            <option value="bags">Bags</option>
            <option value="cubic-meters">Cubic Meters</option>
            <option value="pallets">Pallets</option>
            <option value="bricks">Bricks</option>
            <option value="tons">Tons</option>
            <option value="liters">Liters</option>
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
            {form.id ? '✏️ Update' : '➕ Add'} Movement
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📦 Current Stock Levels</h3>
        
        {/* Raw Materials Section */}
        <h4 style={styles.categoryTitle}>📦 Raw Materials</h4>
        <div style={styles.stockGrid}>
          {inventory.filter(item => item.type === 'raw-material').length > 0 ? 
            inventory.filter(item => item.type === 'raw-material').map((item, index) => {
              const status = getStockStatus(item.currentStock, item.minimumLevel);
              return (
                <div key={item.id || index} style={{...styles.stockCard, ...styles[status]}}>
                  <h4>{item.name || 'Unknown Item'}</h4>
                  <p style={styles.stockLevel}>
                    <strong>{item.currentStock || 0} {item.unit || 'units'}</strong>
                  </p>
                  <p style={styles.lastUpdated}>
                    Updated: {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              );
            }) : (
              <div style={styles.emptyState}>
                <p>No raw materials in inventory yet.</p>
              </div>
            )
          }
        </div>

        {/* Finished Products Section */}
        <h4 style={styles.categoryTitle}>🧱 Finished Products</h4>
        <div style={styles.stockGrid}>
          {inventory.filter(item => item.type === 'finished-product').length > 0 ? 
            inventory.filter(item => item.type === 'finished-product').map((item, index) => {
              const status = getStockStatus(item.currentStock, item.minimumLevel);
              return (
                <div key={item.id || index} style={{...styles.stockCard, ...styles[status]}}>
                  <h4>{item.name || 'Unknown Item'}</h4>
                  <p style={styles.stockLevel}>
                    <strong>{item.currentStock || 0} {item.unit || 'units'}</strong>
                  </p>
                  <p style={styles.lastUpdated}>
                    Updated: {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              );
            }) : (
              <div style={styles.emptyState}>
                <p>No finished products in inventory yet.</p>
              </div>
            )
          }
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📋 Movement History ({movements.length} entries)</h3>
        <div style={styles.tableContainer}>
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
                    <button style={styles.editButton} onClick={() => handleEdit(m)} title="Edit this movement">
                      ✏️ Edit
                    </button>
                    <button style={styles.deleteButton} onClick={() => handleDelete(m.id)} title="Delete this movement (cannot be undone)">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="11" style={styles.noDataCell}>
                    No movements recorded yet. Add your first inventory movement above!
                  </td>
                </tr>
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
  categoryTitle: {
    color: '#1e40af',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '20px',
    marginBottom: '10px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '5px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    alignItems: 'end',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease',
  },
  stockGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
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
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
    fontStyle: 'italic',
  },
};
