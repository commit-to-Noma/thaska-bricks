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
    referenceNumber: '',
    type: 'raw-material',
    name: '',
    customName: '', // For custom items not in catalog
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
      referenceNumber: '',
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
          <select name="type" value={form.type} onChange={handleChange} style={styles.select}>
            <option value="raw-material">📦 Raw Material</option>
            <option value="finished-product">🧱 Finished Product</option>
          </select>
          <select name="name" value={form.name} onChange={handleChange} style={styles.select}>
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
          <select name="unit" value={form.unit} onChange={handleChange} style={styles.select}>
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
            {form.id ? 'Update' : 'Add'} Movement
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
