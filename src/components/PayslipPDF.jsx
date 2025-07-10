// src/components/PayslipPDF.jsx
import React from 'react';
import { jsPDF } from 'jspdf';

export default function PayslipPDFButton({ data }) {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header - Company Information
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('THASKA BRICKS', 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Your Dreams Made Concrete', 105, 35, { align: 'center' });
    doc.text('Employee Payslip', 105, 45, { align: 'center' });
    
    // Draw line separator
    doc.line(20, 50, 190, 50);
    
    // Employee Information Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('EMPLOYEE INFORMATION', 20, 65);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Employee Name: ${data.name || 'N/A'}`, 20, 75);
    doc.text(`Employee ID: ${data.employeeId || 'N/A'}`, 20, 85);
    doc.text(`National ID: ${data.nationalId || 'N/A'}`, 20, 95);
    doc.text(`Date of Birth: ${data.dateOfBirth || 'N/A'}`, 20, 105);
    doc.text(`Position: ${data.position || 'N/A'}`, 20, 115);
    doc.text(`Pay Period: ${data.payPeriod || 'N/A'}`, 20, 125);
    doc.text(`Payment Date: ${data.date || 'N/A'}`, 120, 75);
    doc.text(`Reference Number: ${data.referenceNumber || 'N/A'}`, 120, 85);
    doc.text(`Payment Method: ${data.paymentMethod || 'N/A'}`, 120, 95);
    doc.text(`Payment Status: ${data.paymentStatus || 'Pending'}`, 120, 105);
    
    // Earnings Section
    let y = 145;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('EARNINGS', 20, y);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    y += 15;
    doc.text('Description', 25, y);
    doc.text('Amount', 160, y);
    
    // Draw line under headers
    doc.line(20, y + 2, 190, y + 2);
    
    y += 10;
    doc.text(data.salaryType === 'flat' ? 'Flat Salary' : 'Basic Pay', 25, y);
    doc.text(`$${Number(data.basicSalary || 0).toFixed(2)}`, 160, y);
    
    // Benefits (if any)
    if (data.benefits && data.benefits.length > 0) {
      data.benefits.forEach((benefit) => {
        y += 10;
        doc.text(benefit.label, 25, y);
        doc.text(`$${Number(benefit.amount || 0).toFixed(2)}`, 160, y);
      });
    }
    
    y += 15;
    doc.setFont(undefined, 'bold');
    doc.text('Total Earnings:', 25, y);
    doc.text(`$${Number(data.grossPay || 0).toFixed(2)}`, 160, y);
    
    // Deductions Section
    y += 25;
    doc.setFontSize(14);
    doc.text('DEDUCTIONS', 20, y);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    y += 15;
    doc.text('Description', 25, y);
    doc.text('Amount', 160, y);
    
    // Draw line under headers
    doc.line(20, y + 2, 190, y + 2);
    
    y += 10;
    if (data.deductions && data.deductions.length > 0) {
      data.deductions.forEach((deduction) => {
        doc.text(deduction.label, 25, y);
        doc.text(`$${Number(deduction.amount || 0).toFixed(2)}`, 160, y);
        y += 10;
      });
    } else if (data.totalDeductions > 0) {
      doc.text('Total Deductions', 25, y);
      doc.text(`$${Number(data.totalDeductions || 0).toFixed(2)}`, 160, y);
      y += 10;
    } else {
      doc.text('No deductions', 25, y);
      doc.text('$0.00', 160, y);
      y += 10;
    }
    
    y += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Total Deductions:', 25, y);
    doc.text(`$${Number(data.totalDeductions || 0).toFixed(2)}`, 160, y);
    
    // Net Pay Section
    y += 25;
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('NET PAY', 20, y);
    doc.text(`$${Number(data.netPay || 0).toFixed(2)}`, 160, y);
    
    // Draw border around net pay
    doc.rect(15, y - 8, 180, 15);
    
    // Footer
    y += 30;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('This is a computer-generated payslip and does not require a signature.', 105, y, { align: 'center' });
    
    y += 15;
    doc.text('Employee Signature: _________________________', 20, y);
    doc.text('Date: _____________', 130, y);
    
    // Save the PDF
    doc.save(`${data.name?.replace(/\s+/g, '_') || 'Employee'}_Payslip_${data.date || new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      title="Download PDF Payslip"
      style={{ 
        fontSize: '13px', 
        padding: '8px 12px', 
        cursor: 'pointer', 
        background: '#10b981', 
        color: 'white',
        border: 'none', 
        borderRadius: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: '500',
        transition: 'background-color 0.2s ease',
      }}
    >
      🧾 Payslip
    </button>
  );
}
