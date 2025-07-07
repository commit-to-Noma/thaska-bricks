import React, { useState, useEffect } from 'react';
import localforage from 'localforage';

export default function CostsInput() {
  const [costs, setCosts] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    category: '',
    description: '',
    amount: '',
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

  const handleSubmit = () => {
    const { date, category, description, amount } = form;
    if (!date || !category || !description || !amount) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');

    const newCost = {
      ...form,
      amount: Number(amount),
    };

    if (form.id !== null) {
      setCosts(costs.map((item) => (item.id === form.id ? newCost : item)));
    } else {
      newCost.id = Date.now();
      setCosts([...costs, newCost]);
    }

    setForm({ id: null, date: '', category: '', description: '', amount: '', note: '' });
  };

  const handleEdit = (item) => setForm(item);
  const handleDelete = (id) => setCosts(costs.filter((c) => c.id !== id));

  return (
    <div style={styles.container}>
      <h2>Costs Input</h2>
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.form}>
        <input name="date" type="date" value={form.date} onChange={handleChange} placeholder="Date" />
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select Category</option>
          <option>Raw Materials</option>
          <option>Fuel</option>
          <option>Transport</option>
          <option>Utilities</option>
          <option>Other</option>
        </select>
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Amount (USD)" />
        <input name="note" value={form.note} onChange={handleChange} placeholder="Note (optional)" />
        <button onClick={handleSubmit}>{form.id ? 'Update' : 'Add'} Cost</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Note</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {costs.map((c) => (
            <tr key={c.id}>
              <td>{c.date}</td>
              <td>{c.category}</td>
              <td>{c.description}</td>
              <td>${c.amount.toFixed(2)}</td>
              <td>{c.note}</td>
              <td>
                <button onClick={() => handleEdit(c)}>✏️</button>
                <button onClick={() => handleDelete(c.id)}>🗑️</button>
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
    maxWidth: 900,
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
  },
  error: {
    color: 'red',
  },
};
