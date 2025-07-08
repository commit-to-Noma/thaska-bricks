// src/PayrollInput.jsx
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import EnhancedForm from './components/EnhancedForm.jsx';
import { generateReferenceNumber } from './utils/helpers.js';
import PayslipPDFButton from './components/PayslipPDF';

export default function PayrollInput() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    referenceNumber: '',
    employeeName: '',
    employeeId: '',
    position: '',
    payPeriod: '',
    hoursWorked: '',
    hourlyRate: '',
    overtimeHours: '',
    overtimeRate: '',
    grossPay: '',
    deductions: '',
    netPay: '',
    paymentMethod: '', // 'cash', 'bank', 'check'
    note: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    localforage.getItem('payroll').then((data) => {
      if (data) setEntries(data);
    });
  }, []);

  useEffect(() => {
    localforage.setItem('payroll', entries);
  }, [entries]);

  // Auto-calculate gross pay when hours/rates change
  useEffect(() => {
    const regular = Number(form.hoursWorked) * Number(form.hourlyRate) || 0;
    const overtime = Number(form.overtimeHours) * Number(form.overtimeRate) || 0;
    const gross = regular + overtime;
    const net = gross - Number(form.deductions || 0);
    
    setForm(prev => ({
      ...prev,
      grossPay: gross.toFixed(2),
      netPay: net.toFixed(2)
    }));
  }, [form.hoursWorked, form.hourlyRate, form.overtimeHours, form.overtimeRate, form.deductions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    const { date, employeeName, position, payPeriod, grossPay, paymentMethod } = form;
    if (!date || !employeeName || !position || !payPeriod || !grossPay || !paymentMethod) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    
    const newEntry = {
      ...form,
      referenceNumber: form.referenceNumber || generateReferenceNumber('payroll'),
      hoursWorked: Number(form.hoursWorked) || 0,
      hourlyRate: Number(form.hourlyRate) || 0,
      overtimeHours: Number(form.overtimeHours) || 0,
      overtimeRate: Number(form.overtimeRate) || 0,
      grossPay: Number(form.grossPay) || 0,
      deductions: Number(form.deductions) || 0,
      netPay: Number(form.netPay) || 0,
      id: form.id || Date.now(),
      cashFlowType: 'operating',
    };
    
    if (form.id !== null) {
      setEntries(entries.map((e) => (e.id === form.id ? newEntry : e)));
    } else {
      setEntries([...entries, newEntry]);
    }
    
    setForm({ 
      id: null, 
      date: '', 
      referenceNumber: '',
      employeeName: '',
      employeeId: '',
      position: '',
      payPeriod: '',
      hoursWorked: '',
      hourlyRate: '',
      overtimeHours: '',
      overtimeRate: '',
      grossPay: '',
      deductions: '',
      netPay: '',
      paymentMethod: '',
      note: ''
    });
  };

  const handleEdit = (item) => setForm(item);
  const handleDelete = (id) => setEntries(entries.filter((e) => e.id !== id));

  const getTotalPayroll = () => {
    return entries.reduce((sum, e) => sum + e.netPay, 0);
  };

  const getTotalDeductions = () => {
    return entries.reduce((sum, e) => sum + e.deductions, 0);
  };

  const getCurrentMonthPayroll = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return entries
      .filter(e => {
        const entryDate = new Date(e.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.netPay, 0);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👥 Payroll Management</h2>
      
      <EnhancedForm
        formType="payroll"
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
      >
        <div style={styles.formGrid}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📅 Pay Period Details</h3>
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
            <input 
              name="payPeriod" 
              value={form.payPeriod} 
              onChange={handleChange} 
              placeholder="Pay Period (e.g., 2025-01-01 to 2025-01-15)"
              style={styles.input}
            />
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>👤 Employee Information</h3>
            <input 
              name="employeeName" 
              value={form.employeeName} 
              onChange={handleChange} 
              placeholder="Employee Name"
              style={styles.input}
            />
            <input 
              name="employeeId" 
              value={form.employeeId} 
              onChange={handleChange} 
              placeholder="Employee ID (optional)"
              style={styles.input}
            />
            <input 
              name="position" 
              value={form.position} 
              onChange={handleChange} 
              placeholder="Position/Role"
              style={styles.input}
            />
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>⏰ Hours & Rates</h3>
            <div style={styles.inputGroup}>
              <input 
                name="hoursWorked" 
                type="number" 
                value={form.hoursWorked} 
                onChange={handleChange} 
                placeholder="Regular Hours"
                style={styles.input}
              />
              <input 
                name="hourlyRate" 
                type="number" 
                value={form.hourlyRate} 
                onChange={handleChange} 
                placeholder="Hourly Rate ($)"
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <input 
                name="overtimeHours" 
                type="number" 
                value={form.overtimeHours} 
                onChange={handleChange} 
                placeholder="Overtime Hours"
                style={styles.input}
              />
              <input 
                name="overtimeRate" 
                type="number" 
                value={form.overtimeRate} 
                onChange={handleChange} 
                placeholder="Overtime Rate ($)"
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>💰 Payment Details</h3>
            <input 
              name="grossPay" 
              type="number" 
              value={form.grossPay} 
              onChange={handleChange} 
              placeholder="Gross Pay (auto-calculated)"
              style={styles.input}
              readOnly
            />
            <input 
              name="deductions" 
              type="number" 
              value={form.deductions} 
              onChange={handleChange} 
              placeholder="Total Deductions ($)"
              style={styles.input}
            />
            <input 
              name="netPay" 
              type="number" 
              value={form.netPay} 
              onChange={handleChange} 
              placeholder="Net Pay (auto-calculated)"
              style={styles.input}
              readOnly
            />
            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} style={styles.select}>
              <option value="">Payment Method</option>
              <option value="cash">💵 Cash</option>
              <option value="bank">🏦 Bank Transfer</option>
              <option value="check">💳 Check</option>
            </select>
            <input 
              name="note" 
              value={form.note} 
              onChange={handleChange} 
              placeholder="Additional Notes"
              style={styles.input}
            />
          </div>
        </div>
      </EnhancedForm>

      {error && <p style={styles.error}>{error}</p>}

      {/* Summary Cards */}
      <div style={styles.summaryCards}>
        <div style={styles.card}>
          <h3>💰 Total Payroll</h3>
          <p>${getTotalPayroll().toFixed(2)}</p>
        </div>
        <div style={styles.card}>
          <h3>📅 This Month</h3>
          <p>${getCurrentMonthPayroll().toFixed(2)}</p>
        </div>
        <div style={styles.card}>
          <h3>🧾 Total Deductions</h3>
          <p>${getTotalDeductions().toFixed(2)}</p>
        </div>
      </div>

      <div style={styles.tableSection}>
        <h3 style={styles.sectionTitle}>📊 Payroll History</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Reference</th>
              <th style={styles.th}>Employee</th>
              <th style={styles.th}>Position</th>
              <th style={styles.th}>Pay Period</th>
              <th style={styles.th}>Hours</th>
              <th style={styles.th}>Gross Pay</th>
              <th style={styles.th}>Deductions</th>
              <th style={styles.th}>Net Pay</th>
              <th style={styles.th}>Method</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} style={styles.tr}>
                <td style={styles.td}>{e.date}</td>
                <td style={styles.td}>{e.referenceNumber}</td>
                <td style={styles.td}>{e.employeeName}</td>
                <td style={styles.td}>{e.position}</td>
                <td style={styles.td}>{e.payPeriod}</td>
                <td style={styles.td}>{e.hoursWorked + (e.overtimeHours || 0)}</td>
                <td style={styles.td}>${e.grossPay.toFixed(2)}</td>
                <td style={styles.td}>${e.deductions.toFixed(2)}</td>
                <td style={styles.td}>${e.netPay.toFixed(2)}</td>
                <td style={styles.td}>{e.paymentMethod}</td>
                <td style={styles.td}>
                  <button style={styles.actionButton} onClick={() => handleEdit(e)}>✏️</button>
                  <button style={styles.actionButton} onClick={() => handleDelete(e.id)}>🗑️</button>
                  <PayslipPDFButton data={e} />
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  section: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
  },
  sectionTitle: {
    color: '#374151',
    marginBottom: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '10px',
  },
  inputGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    marginBottom: '10px',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    margin: '20px 0',
  },
  card: {
    backgroundColor: '#1e40af',
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  tableSection: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '20px',
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
