// src/PayrollInput.jsx
import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import { generateReferenceNumber } from './utils/helpers.js';
import PayslipPDFButton from './components/PayslipPDF';

export default function PayrollInput() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    id: null,
    date: '',
    referenceNumber: '',
    employeeFullName: '',
    employeeSurname: '',
    employeeId: '',
    dateOfBirth: '',
    nationalId: '',
    position: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    salaryType: 'flat', // 'flat' or 'hourly'
    flatSalary: '',
    hoursWorked: '',
    hourlyRate: '',
    overtimeHours: '',
    overtimeRate: '',
    // Benefits
    transportBenefit: '',
    housingBenefit: '',
    otherBenefits: '',
    // Deductions  
    loanRepayment: '',
    otherDeductions: '',
    grossPay: '',
    totalDeductions: '',
    netPay: '',
    paymentMethod: '',
    paymentStatus: 'pending', // 'pending', 'paid', 'cancelled'
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

  // Auto-calculate gross pay and totals when values change
  useEffect(() => {
    let gross = 0;
    
    if (form.salaryType === 'flat') {
      gross = Number(form.flatSalary) || 0;
    } else {
      const regular = Number(form.hoursWorked) * Number(form.hourlyRate) || 0;
      const overtime = Number(form.overtimeHours) * Number(form.overtimeRate) || 0;
      gross = regular + overtime;
    }
    
    // Add benefits to gross pay
    const transport = Number(form.transportBenefit) || 0;
    const housing = Number(form.housingBenefit) || 0;
    const otherBen = Number(form.otherBenefits) || 0;
    gross += transport + housing + otherBen;
    
    // Calculate total deductions
    const loan = Number(form.loanRepayment) || 0;
    const otherDed = Number(form.otherDeductions) || 0;
    const totalDeductions = loan + otherDed;
    
    const net = gross - totalDeductions;
    
    setForm(prev => ({
      ...prev,
      grossPay: gross.toFixed(2),
      totalDeductions: totalDeductions.toFixed(2),
      netPay: net.toFixed(2)
    }));
  }, [form.salaryType, form.flatSalary, form.hoursWorked, form.hourlyRate, form.overtimeHours, form.overtimeRate, 
      form.transportBenefit, form.housingBenefit, form.otherBenefits, form.loanRepayment, form.otherDeductions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    const { date, employeeFullName, employeeSurname, nationalId, position, payPeriodStart, payPeriodEnd, grossPay, paymentMethod } = form;
    if (!date || !employeeFullName || !employeeSurname || !nationalId || !position || !payPeriodStart || !payPeriodEnd || !grossPay || !paymentMethod) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    
    const newEntry = {
      ...form,
      referenceNumber: form.referenceNumber || generateReferenceNumber('payroll'),
      flatSalary: Number(form.flatSalary) || 0,
      hoursWorked: Number(form.hoursWorked) || 0,
      hourlyRate: Number(form.hourlyRate) || 0,
      overtimeHours: Number(form.overtimeHours) || 0,
      overtimeRate: Number(form.overtimeRate) || 0,
      transportBenefit: Number(form.transportBenefit) || 0,
      housingBenefit: Number(form.housingBenefit) || 0,
      otherBenefits: Number(form.otherBenefits) || 0,
      loanRepayment: Number(form.loanRepayment) || 0,
      otherDeductions: Number(form.otherDeductions) || 0,
      grossPay: Number(form.grossPay) || 0,
      totalDeductions: Number(form.totalDeductions) || 0,
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
      employeeFullName: '',
      employeeSurname: '',
      employeeId: '',
      dateOfBirth: '',
      nationalId: '',
      position: '',
      payPeriodStart: '',
      payPeriodEnd: '',
      salaryType: 'flat',
      flatSalary: '',
      hoursWorked: '',
      hourlyRate: '',
      overtimeHours: '',
      overtimeRate: '',
      transportBenefit: '',
      housingBenefit: '',
      otherBenefits: '',
      loanRepayment: '',
      otherDeductions: '',
      grossPay: '',
      totalDeductions: '',
      netPay: '',
      paymentMethod: '',
      paymentStatus: 'pending',
      note: '',
    });
  };

  const handleEdit = (item) => setForm(item);
  
  const handleDelete = (id) => {
    const entryToDelete = entries.find(e => e.id === id);
    const confirmMessage = `Are you sure you want to delete this payroll entry?\n\nEmployee: ${entryToDelete?.employeeFullName || entryToDelete?.employeeName || 'Unknown'}\nNet Pay: $${entryToDelete?.netPay || 0}\nDate: ${entryToDelete?.date || 'Unknown'}\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      setEntries(entries.filter((e) => e.id !== id));
    }
  };

  const getTotalPayroll = () => {
    return entries.reduce((sum, e) => sum + e.netPay, 0);
  };

  const getTotalDeductions = () => {
    return entries.reduce((sum, e) => sum + (e.totalDeductions || e.deductions || 0), 0);
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

  const getStatusStyle = (status) => {
    switch(status) {
      case 'paid':
        return { color: '#10b981', fontWeight: 'bold' };
      case 'cancelled':
        return { color: '#ef4444', fontWeight: 'bold' };
      default:
        return { color: '#f59e0b', fontWeight: 'bold' };
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👥 Payroll Management</h2>
      
      <div style={styles.formGrid}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📅 Pay Period Details</h3>
          <input 
            name="date" 
            type="date" 
            value={form.date} 
            onChange={handleChange} 
            style={styles.input}
            required
          />
          {form.referenceNumber && (
            <div style={styles.referenceDisplay}>
              <strong>Reference: {form.referenceNumber}</strong>
            </div>
          )}
          <div style={styles.inputGroup}>
            <input 
              name="payPeriodStart" 
              type="date"
              value={form.payPeriodStart} 
              onChange={handleChange} 
              placeholder="Pay Period Start"
              style={styles.input}
              required
            />
            <input 
              name="payPeriodEnd" 
              type="date"
              value={form.payPeriodEnd} 
              onChange={handleChange} 
              placeholder="Pay Period End"
              style={styles.input}
              required
            />
          </div>
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>👤 Employee Information</h3>
          <div style={styles.inputGroup}>
            <input 
              name="employeeFullName" 
              value={form.employeeFullName} 
              onChange={handleChange} 
              placeholder="First Name"
              style={styles.input}
              required
            />
            <input 
              name="employeeSurname" 
              value={form.employeeSurname} 
              onChange={handleChange} 
              placeholder="Surname"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <input 
              name="nationalId" 
              value={form.nationalId} 
              onChange={handleChange} 
              placeholder="National ID Number"
              style={styles.input}
              required
            />
            <input 
              name="dateOfBirth" 
              type="date"
              value={form.dateOfBirth} 
              onChange={handleChange} 
              placeholder="Date of Birth"
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <input 
              name="employeeId" 
              value={form.employeeId} 
              onChange={handleChange} 
              placeholder="Employee ID"
              style={styles.input}
            />
            <input 
              name="position" 
              value={form.position} 
              onChange={handleChange} 
              placeholder="Position/Role"
              style={styles.input}
              required
            />
          </div>
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>💼 Salary & Hours</h3>
          <select name="salaryType" value={form.salaryType} onChange={handleChange} style={styles.select}>
            <option value="flat">💵 Flat Rate Salary</option>
            <option value="hourly">⏰ Hourly Rate</option>
          </select>
          
          {form.salaryType === 'flat' ? (
            <input 
              name="flatSalary" 
              type="number" 
              step="0.01"
              value={form.flatSalary} 
              onChange={handleChange} 
              placeholder="Flat Salary Amount ($)"
              style={styles.input}
            />
          ) : (
            <>
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
                  step="0.01"
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
                  step="0.01"
                  value={form.overtimeRate} 
                  onChange={handleChange} 
                  placeholder="Overtime Rate ($)"
                  style={styles.input}
                />
              </div>
            </>
          )}
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🎁 Benefits</h3>
          <input 
            name="transportBenefit" 
            type="number" 
            step="0.01"
            value={form.transportBenefit} 
            onChange={handleChange} 
            placeholder="Transport Allowance ($)"
            style={styles.input}
          />
          <input 
            name="housingBenefit" 
            type="number" 
            step="0.01"
            value={form.housingBenefit} 
            onChange={handleChange} 
            placeholder="Housing Allowance ($)"
            style={styles.input}
          />
          <input 
            name="otherBenefits" 
            type="number" 
            step="0.01"
            value={form.otherBenefits} 
            onChange={handleChange} 
            placeholder="Other Benefits ($)"
            style={styles.input}
          />
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>➖ Deductions</h3>
          <input 
            name="loanRepayment" 
            type="number" 
            step="0.01"
            value={form.loanRepayment} 
            onChange={handleChange} 
            placeholder="Loan Repayment ($)"
            style={styles.input}
          />
          <input 
            name="otherDeductions" 
            type="number" 
            step="0.01"
            value={form.otherDeductions} 
            onChange={handleChange} 
            placeholder="Other Deductions ($)"
            style={styles.input}
          />
        </div>
        
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>💰 Payment Summary</h3>
          <div style={styles.summaryBox}>
            <div style={styles.summaryItem}>
              <strong>Gross Pay: ${form.grossPay || '0.00'}</strong>
            </div>
            <div style={styles.summaryItem}>
              <strong>Total Deductions: ${form.totalDeductions || '0.00'}</strong>
            </div>
            <div style={styles.summaryItem}>
              <strong style={styles.netPayHighlight}>Net Pay: ${form.netPay || '0.00'}</strong>
            </div>
          </div>
          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} style={styles.select} required>
            <option value="">Payment Method</option>
            <option value="cash">💵 Cash</option>
            <option value="bank">🏦 Bank Transfer</option>
            <option value="ecocash">📱 EcoCash</option>
          </select>
          <select name="paymentStatus" value={form.paymentStatus} onChange={handleChange} style={styles.select}>
            <option value="pending">⏳ Pending Payment</option>
            <option value="paid">✅ Paid</option>
            <option value="cancelled">❌ Cancelled</option>
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

      <div style={styles.submitSection}>
        <button onClick={handleSubmit} style={styles.submitButton}>
          {form.id !== null ? '✏️ Update Payroll' : '➕ Add Payroll Entry'}
        </button>
      </div>

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
        <h3 style={styles.sectionTitle}>📊 Payroll History ({entries.length} entries)</h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Reference</th>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>National ID</th>
                <th style={styles.th}>Position</th>
                <th style={styles.th}>Gross Pay</th>
                <th style={styles.th}>Deductions</th>
                <th style={styles.th}>Net Pay</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="11" style={styles.noDataCell}>
                    No payroll entries recorded yet. Add your first payroll entry above!
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} style={styles.tr}>
                    <td style={styles.td}>{e.date}</td>
                    <td style={styles.td}>{e.referenceNumber}</td>
                    <td style={styles.td}>
                      {`${e.employeeFullName || e.employeeName || ''} ${e.employeeSurname || ''}`.trim()}
                    </td>
                    <td style={styles.td}>{e.nationalId}</td>
                    <td style={styles.td}>{e.position}</td>
                    <td style={styles.td}>${Number(e.grossPay || 0).toFixed(2)}</td>
                    <td style={styles.td}>${Number(e.totalDeductions || e.deductions || 0).toFixed(2)}</td>
                    <td style={styles.td}>${Number(e.netPay || 0).toFixed(2)}</td>
                    <td style={styles.td}>
                      <span style={getStatusStyle(e.paymentStatus)}>
                        {e.paymentStatus === 'paid' ? '✅ Paid' : 
                         e.paymentStatus === 'cancelled' ? '❌ Cancelled' : '⏳ Pending'}
                      </span>
                    </td>
                    <td style={styles.td}>{e.paymentMethod}</td>
                    <td style={styles.td}>
                      <button style={styles.editButton} onClick={() => handleEdit(e)} title="Edit this payroll entry">
                        ✏️ Edit
                      </button>
                      <button style={styles.deleteButton} onClick={() => handleDelete(e.id)} title="Delete this payroll entry (cannot be undone)">
                        🗑️ Delete
                      </button>
                      <PayslipPDFButton data={{
                        name: `${e.employeeFullName || e.employeeName || ''} ${e.employeeSurname || ''}`.trim(),
                        employeeId: e.employeeId,
                        nationalId: e.nationalId,
                        dateOfBirth: e.dateOfBirth,
                        date: e.date,
                        position: e.position,
                        payPeriod: e.payPeriodStart && e.payPeriodEnd 
                          ? `${e.payPeriodStart} to ${e.payPeriodEnd}`
                          : e.payPeriod,
                        salaryType: e.salaryType,
                        basicSalary: e.salaryType === 'flat' ? e.flatSalary : 
                                   (Number(e.hoursWorked || 0) * Number(e.hourlyRate || 0)) + 
                                   (Number(e.overtimeHours || 0) * Number(e.overtimeRate || 0)),
                        benefits: [
                          ...(e.transportBenefit ? [{ label: 'Transport', amount: e.transportBenefit }] : []),
                          ...(e.housingBenefit ? [{ label: 'Housing', amount: e.housingBenefit }] : []),
                          ...(e.otherBenefits ? [{ label: 'Other Benefits', amount: e.otherBenefits }] : [])
                        ],
                        totalBenefits: (Number(e.transportBenefit || 0) + Number(e.housingBenefit || 0) + Number(e.otherBenefits || 0)),
                        deductions: [
                          ...(e.loanRepayment ? [{ label: 'Loan Repayment', amount: e.loanRepayment }] : []),
                          ...(e.otherDeductions ? [{ label: 'Other Deductions', amount: e.otherDeductions }] : [])
                        ],
                        totalDeductions: e.totalDeductions || e.deductions || 0,
                        grossPay: e.grossPay || 0,
                        netPay: e.netPay || 0,
                        paymentMethod: e.paymentMethod,
                        paymentStatus: e.paymentStatus,
                        referenceNumber: e.referenceNumber,
                        note: e.note
                      }} />
                    </td>
                  </tr>
                ))
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
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  section: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    minHeight: '200px',
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
    boxSizing: 'border-box',
  },
  inputGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '10px',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    marginBottom: '10px',
    boxSizing: 'border-box',
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
  referenceDisplay: {
    padding: '10px',
    backgroundColor: '#f0f9ff',
    borderRadius: '4px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#0369a1',
    border: '1px solid #0284c7',
    marginBottom: '10px',
  },
  submitSection: {
    textAlign: 'center',
    margin: '30px 0',
  },
  submitButton: {
    padding: '12px 30px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    minWidth: '150px',
  },
  tableContainer: {
    overflowX: 'auto',
    maxWidth: '100%',
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
  summaryBox: {
    backgroundColor: '#f0f9ff',
    border: '2px solid #0284c7',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  summaryItem: {
    margin: '10px 0',
    fontSize: '16px',
    color: '#0369a1',
  },
  netPayHighlight: {
    color: '#10b981',
    fontSize: '18px',
  },
};
