import React, { useState, useEffect } from 'react';

export default function SalesInput() {
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    description: '',
    quantity: '',
    unitPrice: '',
    note: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('sales') || '[]');
    setSales(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    const { date, description, quantity, unitPrice } = form;
    if (!date || !description || !quantity || !unitPrice) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');

    const newSale = {
      ...form,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      amount: Number(quantity) * Number(unitPrice),
    };

    if (form.id !== null) {
      setSales(sales.map((item) => (item.id === form.id ? newSale : item)));
    } else {
      newSale.id = Date.now();
      setSales([...sales, newSale]);
    }

    setForm({
      id: null,
      date: '',
      description: '',
      quantity: '',
      unitPrice: '',
      note: '',
    });
  };

  const handleEdit = (sale) => setForm(sale);
  const handleDelete = (id) => setSales(sales.filter((s) => s.id !== id));
  const formatUSD = (n) => `$${n.toFixed(2)}`;

  return (
    <div style={styles.container}>
      <h2>Sales Input</h2>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.form}>
        <input name="date" type="date" value={form.date} onChange={handleChange} placeholder="Date" />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Quantity" />
        <input name="unitPrice" type="number" value={form.unitPrice} onChange={handleChange} placeholder="Unit Price" />
        <input name="note" value={form.note} onChange={handleChange} placeholder="Note (optional)" />
        <button onClick={handleSubmit}>{form.id ? 'Update' : 'Add'} Sale</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Qty</th>
            <th style={styles.th}>Unit Price</th>
            <th style={styles.th}>Total</th>
            <th style={styles.th}>Note</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td style={styles.td}>{s.date}</td>
              <td style={styles.td}>{s.description}</td>
              <td style={styles.td}>{s.quantity}</td>
              <td style={styles.td}>{formatUSD(s.unitPrice)}</td>
              <td style={styles.td}>{formatUSD(s.amount)}</td>
              <td style={styles.td}>{s.note}</td>
              <td style={styles.td}>
                <button onClick={() => handleEdit(s)}>✏️</button>{' '}
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
    maxWidth: 1000,
    margin: '30px auto',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 10,
    marginBottom: 20,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
    textAlign: 'center',
  },
  th: {
    backgroundColor: '#f3f4f6',
    border: '1px solid #ccc',
    padding: '8px 4px',
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px 4px',
    verticalAlign: 'middle',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
};
