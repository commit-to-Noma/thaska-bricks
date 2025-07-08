// src/utils/helpers.js
import localforage from 'localforage';

// Generate auto-reference numbers
export function generateReferenceNumber(tabName) {
  const timestamp = Date.now();
  return `TX-${tabName.toUpperCase()}-${timestamp}`;
}

// Auto-categorization rules
export function autoCategorizeCost(description, amount) {
  const desc = description.toLowerCase();
  
  // COGS/Production costs
  if (desc.includes('cement') || desc.includes('sand') || desc.includes('aggregate') || 
      desc.includes('water') || desc.includes('brick') || desc.includes('mold') ||
      desc.includes('raw material') || desc.includes('production')) {
    return { category: 'COGS', usedInProduction: true };
  }
  
  // Operating expenses
  if (desc.includes('fuel') || desc.includes('electricity') || desc.includes('rent') ||
      desc.includes('utility') || desc.includes('office') || desc.includes('maintenance') ||
      desc.includes('repair') || desc.includes('transport') || desc.includes('delivery')) {
    return { category: 'Operating', usedInProduction: false };
  }
  
  // Equipment/Asset purchases (typically larger amounts)
  if (amount > 5000 || desc.includes('equipment') || desc.includes('machinery') ||
      desc.includes('vehicle') || desc.includes('computer') || desc.includes('furniture')) {
    return { category: 'Asset', usedInProduction: false };
  }
  
  // Default to operating
  return { category: 'Operating', usedInProduction: false };
}

export function autoCategorizeCapital(description, amount) {
  const desc = description.toLowerCase();
  
  if (desc.includes('loan') || desc.includes('borrow') || desc.includes('credit')) {
    return { type: 'Loan', category: 'Financing' };
  }
  
  if (desc.includes('investment') || desc.includes('capital') || desc.includes('equity')) {
    return { type: 'Investment', category: 'Financing' };
  }
  
  if (desc.includes('equipment') || desc.includes('machinery') || desc.includes('vehicle')) {
    return { type: 'Equipment', category: 'Investment' };
  }
  
  return { type: 'Equipment', category: 'Investment' };
}

export function autoCategorizeMisc(description, amount) {
  const desc = description.toLowerCase();
  
  if (desc.includes('repair') || desc.includes('maintenance') || desc.includes('fix')) {
    return { expenseType: 'Repair', recurring: false };
  }
  
  if (desc.includes('equipment') || desc.includes('machinery') || amount > 5000) {
    return { expenseType: 'Asset', recurring: false };
  }
  
  if (desc.includes('monthly') || desc.includes('quarterly') || desc.includes('annual') ||
      desc.includes('subscription') || desc.includes('rent') || desc.includes('insurance')) {
    return { expenseType: 'Operating', recurring: true };
  }
  
  return { expenseType: 'Operating', recurring: false };
}

// Template management
export async function saveTemplate(templateName, templateData, category) {
  const templates = await localforage.getItem('templates') || {};
  if (!templates[category]) templates[category] = {};
  templates[category][templateName] = templateData;
  await localforage.setItem('templates', templates);
}

export async function loadTemplate(templateName, category) {
  const templates = await localforage.getItem('templates') || {};
  return templates[category] && templates[category][templateName];
}

export async function getTemplates(category) {
  const templates = await localforage.getItem('templates') || {};
  return templates[category] || {};
}

export async function deleteTemplate(templateName, category) {
  const templates = await localforage.getItem('templates') || {};
  if (templates[category] && templates[category][templateName]) {
    delete templates[category][templateName];
    await localforage.setItem('templates', templates);
  }
}

// Double-entry validation
export function validateDoubleEntry(transaction, type) {
  const errors = [];
  
  // Check basic required fields
  if (!transaction.date || !transaction.description) {
    errors.push('Date and description are required');
  }
  
  // Type-specific validations
  switch (type) {
    case 'sales':
      if (!transaction.paid || !transaction.paidVia) {
        errors.push('Payment status and method must be specified');
      }
      if (transaction.paid === 'no' && !transaction.paidVia) {
        errors.push('Unpaid sales should create accounts receivable');
      }
      break;
      
    case 'costs':
      if (!transaction.paidVia) {
        errors.push('Payment method must be specified');
      }
      if (!transaction.category) {
        errors.push('Cost category must be specified (COGS/Operating/Asset)');
      }
      break;
      
    case 'payroll':
      if (!transaction.name || !transaction.position) {
        errors.push('Employee name and position are required');
      }
      break;
      
    case 'capital':
      if (!transaction.type || !transaction.category) {
        errors.push('Capital type and category must be specified');
      }
      break;
  }
  
  return errors;
}

// Validation alerts
export function getValidationAlerts(data) {
  const alerts = [];
  
  // Check for duplicate entries (same date, amount, description)
  const entries = Object.values(data).flat();
  const duplicates = entries.filter((item, index) => 
    entries.findIndex(other => 
      other.date === item.date && 
      other.amount === item.amount && 
      other.description === item.description
    ) !== index
  );
  
  if (duplicates.length > 0) {
    alerts.push({
      type: 'warning',
      message: `${duplicates.length} potential duplicate transactions found`,
      details: duplicates.map(d => `${d.date}: ${d.description} - $${d.amount}`)
    });
  }
  
  // Check for large amounts without proper categorization
  const largeCosts = (data.costs || []).filter(cost => 
    cost.amount > 5000 && cost.category === 'Operating'
  );
  
  if (largeCosts.length > 0) {
    alerts.push({
      type: 'warning',
      message: `${largeCosts.length} large costs may need reclassification as assets`,
      details: largeCosts.map(c => `${c.date}: ${c.description} - $${c.amount}`)
    });
  }
  
  // Check for unpaid sales older than 30 days
  const oldUnpaidSales = (data.sales || []).filter(sale => {
    if (sale.paid === 'no') {
      const saleDate = new Date(sale.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return saleDate < thirtyDaysAgo;
    }
    return false;
  });
  
  if (oldUnpaidSales.length > 0) {
    alerts.push({
      type: 'error',
      message: `${oldUnpaidSales.length} overdue receivables (>30 days)`,
      details: oldUnpaidSales.map(s => `${s.date}: ${s.description} - $${s.amount}`)
    });
  }
  
  return alerts;
}

// Validation functions
export function checkForDuplicateTransactions(transactions) {
  const duplicates = [];
  const seen = new Map();
  
  transactions.forEach(transaction => {
    const key = `${transaction.date}-${transaction.description}-${transaction.amount}`;
    if (seen.has(key)) {
      duplicates.push(transaction);
    } else {
      seen.set(key, transaction);
    }
  });
  
  return duplicates;
}

export function checkForLargeCosts(costs) {
  const largeCosts = [];
  const averageCost = costs.reduce((sum, c) => sum + c.amount, 0) / costs.length;
  const threshold = averageCost * 3; // 3x average is considered large
  
  costs.forEach(cost => {
    if (cost.amount > threshold && cost.amount > 1000) {
      largeCosts.push(cost);
    }
  });
  
  return largeCosts;
}

export function checkForOverdueReceivables(sales) {
  const overdue = [];
  const today = new Date();
  
  sales.forEach(sale => {
    if (sale.paid === 'no') {
      const saleDate = new Date(sale.date);
      const daysDiff = Math.floor((today - saleDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 30) { // 30 days overdue
        overdue.push({
          ...sale,
          daysOverdue: daysDiff
        });
      }
    }
  });
  
  return overdue;
}

export function validateDoubleEntry(transactions) {
  const issues = [];
  
  // Check for missing reference numbers
  transactions.forEach(transaction => {
    if (!transaction.referenceNumber) {
      issues.push({
        message: `Missing reference number for ${transaction.description}`,
        transaction
      });
    }
  });
  
  // Check for unbalanced entries (simplified check)
  const totalDebits = transactions
    .filter(t => t.cashFlowType === 'operating' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalCredits = transactions
    .filter(t => t.cashFlowType === 'operating' && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    issues.push({
      message: `Unbalanced entries: Debits $${totalDebits.toFixed(2)} vs Credits $${totalCredits.toFixed(2)}`,
      transaction: null
    });
  }
  
  return issues;
}

// Inventory auto-update functions
export async function updateInventoryFromCost(costEntry) {
  if (!costEntry.usedInProduction) return;
  
  const inventory = await localforage.getItem('inventory') || [];
  const newInventoryEntry = {
    id: Date.now(),
    referenceNumber: generateReferenceNumber('INV'),
    date: costEntry.date,
    type: 'Raw Material',
    name: costEntry.description,
    quantityIn: costEntry.quantity || 1,
    quantityOut: 0,
    unit: costEntry.unit || 'units',
    sourceReference: costEntry.referenceNumber,
    useReference: null,
    notes: `Auto-added from cost entry: ${costEntry.description}`
  };
  
  inventory.push(newInventoryEntry);
  await localforage.setItem('inventory', inventory);
}

export async function updateInventoryFromSale(saleEntry) {
  const inventory = await localforage.getItem('inventory') || [];
  const newInventoryEntry = {
    id: Date.now(),
    referenceNumber: generateReferenceNumber('INV'),
    date: saleEntry.date,
    type: 'Finished Goods',
    name: saleEntry.description,
    quantityIn: 0,
    quantityOut: saleEntry.quantity || 1,
    unit: saleEntry.unit || 'units',
    sourceReference: null,
    useReference: saleEntry.referenceNumber,
    notes: `Auto-added from sale: ${saleEntry.description}`
  };
  
  inventory.push(newInventoryEntry);
  await localforage.setItem('inventory', inventory);
}
