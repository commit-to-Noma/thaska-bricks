import React, { useState, useEffect } from 'react';
import localforage from 'localforage';

export default function SalesInput() {
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
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

  const handleSubmit = () => {
    const { date, description, quantity, unitPrice, paid, paidVia } = form;
    if (!date || !description || !quantity || !unitPrice || !paid || !paidVia) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    const newSale = {
      ...form,
      amount: Number(quantity) * Number(unitPrice),
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      cashFlowType: 'operating',
    };
    if (form.id !== null) {
      setSales(sales.map((item) => (item.id === form.id ? newSale : item)));
    } else {
      newSale.id = Date.now();
      setSales([...sales, newSale]);
    }
    setForm({ id: null, date: '', description: '', quantity: '', unitPrice: '', paid: 'yes', paidVia: 'cash', note: '' });
  };

  const handleEdit = (sale) => setForm(sale);
  const handleDelete = (id) => setSales(sales.filter((s) => s.id !== id));

  return (
    <div style={styles.container}>
      <h2>Sales Input</h2>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.form}>
        <input name="date" type="date" value={form.date} onChange={handleChange} />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Quantity" />
        <input name="unitPrice" type="number" value={form.unitPrice} onChange={handleChange} placeholder="Unit Price" />
        <select name="paid" value={form.paid} onChange={handleChange}>
          <option value="yes">Paid ✓</option>
          <option value="no">Unpaid (A/R)</option>
        </select>
        <select name="paidVia" value={form.paidVia} onChange={handleChange}>
          <option value="cash">Cash</option>
          <option value="bank">Bank</option>
          <option value="credit">Credit</option>
        </select>
        <input name="note" value={form.note} onChange={handleChange} placeholder="Note (optional)" />
        <button onClick={handleSubmit}>{form.id ? 'Update' : 'Add'} Sale</button>
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Via</th>
            <th>Note</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td>{s.date}</td>
              <td>{s.description}</td>
              <td>{s.quantity}</td>
              <td>${Number(s.unitPrice).toFixed(2)}</td>
              <td>${Number(s.amount).toFixed(2)}</td>
              <td>{s.paid === 'yes' ? '✓' : '⏳'}</td>
              <td>{s.paidVia}</td>
              <td>{s.note}</td>
              <td>
                <button onClick={() => handleEdit(s)}>✏️</button>
                <button onClick={() => handleDelete(s.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 800,
    margin: '30px auto',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 10,
    marginBottom: 20,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  error: {
    color: 'red',
  },
};
