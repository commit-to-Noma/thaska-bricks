import React, { useState, useEffect } from 'react';

export default function SalesInput() {
  const [sales, setSales] = useState(() => {
    // Load saved sales from localStorage on page load
    const stored = localStorage.getItem('sales');
    return stored ? JSON.parse(stored) : [];
  });

  const [amount, setAmount] = useState('');
  const [item, setItem] = useState('');
  const [date, setDate] = useState('');

  // Save updated sales to localStorage whenever changed
  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  // Add a new sale to the list
  const handleAddSale = () => {
    if (!amount || !item || !date) return alert('Please fill in all fields');
    const newSale = { amount: parseFloat(amount), item, date };
    setSales(prev => [...prev, newSale]);
    setAmount('');
    setItem('');
    setDate('');
  };

  return (
    <div style={styles.container}>
      <h2>Sales Input</h2>

      <input
        type="number"
        placeholder="Amount ($)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Item sold"
        value={item}
        onChange={e => setItem(e.target.value)}
        style={styles.input}
      />
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleAddSale} style={styles.button}>➕ Add Sale</button>

      <h3 style={styles.historyTitle}>Sales History</h3>
      <ul style={styles.list}>
        {sales.map((sale, index) => (
          <li key={index}>
            {sale.date} — {sale.item} — ${sale.amount.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 500,
    margin: '30px auto',
    padding: 20,
    border: '1px solid #ddd',
    borderRadius: 8,
    fontFamily: 'Arial, sans-serif',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    padding: '10px 20px',
    fontSize: 16,
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  historyTitle: {
    marginTop: 30,
    fontSize: 18,
  },
  list: {
    marginTop: 10,
    paddingLeft: 20,
    lineHeight: '1.6',
  },
};
