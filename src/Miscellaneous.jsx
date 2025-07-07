// src/Miscellaneous.jsx
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';

export default function Miscellaneous() {
  const [entries, setEntries] = useState([]);
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
    localforage.getItem('miscellaneous').then((data) => {
      if (data) setEntries(data);
    });
  }, []);

  useEffect(() => {
    localforage.setItem('miscellaneous', entries);
  }, [entries]);

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
    const newEntry = { ...form, amount: Number(amount) };
    if (form.id !== null) {
      setEntries(entries.map((e) => (e.id === form.id ? newEntry : e)));
    } else {
      newEntry.id = Date.now();
      setEntries([...entries, newEntry]);
    }
    setForm({ id: null, date: '', category: '', description: '', amount: '', note: '' });
  };

  const handleEdit = (item) => setForm(item);
  const handleDelete = (id) => setEntries(entries.filter((e) => e.id !== id));

  return (
    <div style={styles.container}>
      <h2>Miscellaneous Expenses</h2>
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.form}>
        <input name="date" type="date" value={form.date} onChange={handleChange} placeholder="Date" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category (e.g. Repairs)" />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Amount (USD)" />
        <input name="note" value={form.note} onChange={handleChange} placeholder="Note (optional)" />
        <button onClick={handleSubmit}>{form.id ? 'Update' : 'Add'} Entry</button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Category</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Note</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td style={styles.td}>{e.date}</td>
              <td style={styles.td}>{e.category}</td>
              <td style={styles.td}>{e.description}</td>
              <td style={styles.td}>${e.amount.toFixed(2)}</td>
              <td style={styles.td}>{e.note}</td>
              <td style={styles.td}>
                <button style={styles.actionButton} onClick={() => handleEdit(e)}>✏️</button>
                <button style={styles.actionButton} onClick={() => handleDelete(e.id)}>🗑️</button>
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
    border: '1px solid #ddd',
  },
  th: {
    backgroundColor: '#f5f5f5',
    padding: '12px 8px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
    fontWeight: 'bold',
  },
  td: {
    padding: '10px 8px',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'top',
  },
  actionButton: {
    marginRight: '5px',
    padding: '4px 8px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    color: 'red',
  },
};
// This component allows users to manage miscellaneous expenses, including adding, editing, and deleting entries.
// It uses localForage for persistent storage and provides a simple form for input.