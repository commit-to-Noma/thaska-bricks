// src/components/PayslipPDF.jsx
import React from 'react';
import { jsPDF } from 'jspdf';

export default function PayslipPDFButton({ data }) {
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Payslip for ${data.name}`, 20, 20);

    doc.setFontSize(12);
    doc.text(`Date: ${data.date}`, 20, 30);
    doc.text(`Employee: ${data.name}`, 20, 40);
    doc.text(`Position: ${data.position}`, 20, 50);
    doc.text(`Basic Salary: $${Number(data.basicSalary).toFixed(2)}`, 20, 60);

    let y = 70;
    doc.text('Benefits:', 20, y);
    data.benefits.forEach((b) => {
      y += 10;
      doc.text(`${b.label}: $${Number(b.amount).toFixed(2)}`, 30, y);
    });

    y += 10;
    doc.text(`Total Benefits: $${data.totalBenefits.toFixed(2)}`, 20, y);

    y += 10;
    doc.text('Deductions:', 20, y);
    data.deductions.forEach((d) => {
      y += 10;
      doc.text(`${d.label}: $${Number(d.amount).toFixed(2)}`, 30, y);
    });

    y += 10;
    doc.text(`Total Deductions: $${data.totalDeductions.toFixed(2)}`, 20, y);

    y += 10;
    doc.setFontSize(14);
    doc.text(`Net Pay: $${data.netPay.toFixed(2)}`, 20, y + 10);

    doc.save(`${data.name}_Payslip.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      title="Download PDF Payslip"
      style={{ 
        fontSize: '0.875rem', 
        padding: '0.5rem 0.75rem', 
        cursor: 'pointer', 
        background: '#fff', 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      🧾 Download Payslip
    </button>
  );
}
