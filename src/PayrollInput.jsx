// src/PayrollInput.jsx
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';

export default function PayrollInput() {
  const [payslips, setPayslips] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    name: '',
    position: '',
    basicSalary: '',
    benefits: [{ label: '', amount: '' }],
    deductions: [{ label: '', amount: '' }],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    localforage.getItem('payslips').then((data) => {
      if (data) setPayslips(data);
    });
  }, []);

  useEffect(() => {
    localforage.setItem('payslips', payslips);
  }, [payslips]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleBenefitChange = (index, key, value) => {
    const updated = [...form.benefits];
    updated[index][key] = value;
    setForm({ ...form, benefits: updated });
  };

  const handleDeductionChange = (index, key, value) => {
    const updated = [...form.deductions];
    updated[index][key] = value;
    setForm({ ...form, deductions: updated });
  };

  const addBenefit = () => setForm({ ...form, benefits: [...form.benefits, { label: '', amount: '' }] });
  const addDeduction = () => setForm({ ...form, deductions: [...form.deductions, { label: '', amount: '' }] });

  const calculateTotals = () => {
    const totalBenefits = form.benefits.reduce((sum, b) => sum + Number(b.amount || 0), 0);
    const totalDeductions = form.deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const netPay = Number(form.basicSalary || 0) + totalBenefits - totalDeductions;
    return { totalBenefits, totalDeductions, netPay };
  };

  const handleSubmit = () => {
    const { name, position, basicSalary, date } = form;
    if (!name || !position || !basicSalary || !date) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    const newEntry = { ...form, basicSalary: Number(basicSalary) };
    if (form.id !== null) {
      setPayslips(payslips.map((p) => (p.id === form.id ? newEntry : p)));
    } else {
      newEntry.id = Date.now();
      setPayslips([...payslips, newEntry]);
    }
    setForm({ id: null, date: '', name: '', position: '', basicSalary: '', benefits: [{ label: '', amount: '' }], deductions: [{ label: '', amount: '' }] });
  };

  const handleEdit = (item) => setForm(item);
  const handleDelete = (id) => setPayslips(payslips.filter((p) => p.id !== id));

  const { totalBenefits, totalDeductions, netPay } = calculateTotals();

  return (
    <div style={styles.container}>
      <h2>Payroll Input</h2>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.form}>
        <input name="date" type="date" value={form.date} onChange={handleChange} placeholder="Date" />
        <input name="name" value={form.name} onChange={handleChange} placeholder="Employee Name" />
        <input name="position" value={form.position} onChange={handleChange} placeholder="Position" />
        <input name="basicSalary" type="number" value={form.basicSalary} onChange={handleChange} placeholder="Basic Salary (USD)" />
        <h4>Benefits</h4>
        {form.benefits.map((b, i) => (
          <div key={i} style={styles.inline}>
            <input placeholder="Label" value={b.label} onChange={(e) => handleBenefitChange(i, 'label', e.target.value)} />
            <input type="number" placeholder="Amount" value={b.amount} onChange={(e) => handleBenefitChange(i, 'amount', e.target.value)} />
          </div>
        ))}
        <button onClick={addBenefit}>+ Add Benefit</button>

        <h4>Deductions</h4>
        {form.deductions.map((d, i) => (
          <div key={i} style={styles.inline}>
            <input placeholder="Label" value={d.label} onChange={(e) => handleDeductionChange(i, 'label', e.target.value)} />
            <input type="number" placeholder="Amount" value={d.amount} onChange={(e) => handleDeductionChange(i, 'amount', e.target.value)} />
          </div>
        ))}
        <button onClick={addDeduction}>+ Add Deduction</button>

        <button onClick={handleSubmit}>{form.id ? 'Update' : 'Add'} Payslip</button>

        <p><strong>Total Benefits:</strong> ${totalBenefits.toFixed(2)}</p>
        <p><strong>Total Deductions:</strong> ${totalDeductions.toFixed(2)}</p>
        <p><strong>Net Pay:</strong> ${netPay.toFixed(2)}</p>
      </div>

      <h3>Payslips</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Date</th><th>Name</th><th>Position</th><th>Basic</th><th>Benefits</th><th>Deductions</th><th>Net Pay</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payslips.map((p) => {
            const totalB = p.benefits.reduce((sum, b) => sum + Number(b.amount || 0), 0);
            const totalD = p.deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);
            const net = Number(p.basicSalary || 0) + totalB - totalD;
            return (
              <tr key={p.id}>
                <td>{p.date}</td>
                <td>{p.name}</td>
                <td>{p.position}</td>
                <td>${Number(p.basicSalary).toFixed(2)}</td>
                <td>${totalB.toFixed(2)}</td>
                <td>${totalD.toFixed(2)}</td>
                <td>${net.toFixed(2)}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>✏️</button>
                  <button onClick={() => handleDelete(p.id)}>🗑️</button>
                </td>
              </tr>
            );
          })}
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
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 30,
  },
  inline: {
    display: 'flex',
    gap: 10,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  error: {
    color: 'red',
  },
};
