// src/components/EnhancedForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  generateReferenceNumber, 
  autoCategorizeCost, 
  autoCategorizeCapital, 
  autoCategorizeMisc,
  saveTemplate, 
  getTemplates, 
  loadTemplate,
  validateDoubleEntry 
} from '../utils/helpers.js';

export default function EnhancedForm({ 
  formType, 
  form, 
  setForm, 
  onSubmit, 
  children,
  customFields = [] 
}) {
  const [templates, setTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [autoSuggestions, setAutoSuggestions] = useState({});

  useEffect(() => {
    loadTemplatesForType();
  }, [formType]);

  useEffect(() => {
    // Auto-categorize when description or amount changes
    if (form.description || form.amount) {
      handleAutoSuggestions();
    }
  }, [form.description, form.amount]);

  const loadTemplatesForType = async () => {
    const templateData = await getTemplates(formType);
    setTemplates(templateData);
  };

  const handleAutoSuggestions = () => {
    let suggestions = {};
    
    switch (formType) {
      case 'costs':
        suggestions = autoCategorizeCost(form.description || '', Number(form.amount || 0));
        break;
      case 'capital':
        suggestions = autoCategorizeCapital(form.description || '', Number(form.amount || 0));
        break;
      case 'miscellaneous':
        suggestions = autoCategorizeMisc(form.description || '', Number(form.amount || 0));
        break;
    }
    
    setAutoSuggestions(suggestions);
  };

  const handleLoadTemplate = async (templateKey) => {
    if (!templateKey) return;
    
    const template = await loadTemplate(templateKey, formType);
    if (template) {
      setForm({ ...form, ...template, id: null });
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    
    const templateData = { ...form };
    delete templateData.id;
    delete templateData.date;
    delete templateData.referenceNumber;
    
    await saveTemplate(templateName, templateData, formType);
    await loadTemplatesForType();
    setTemplateName('');
    setShowSaveTemplate(false);
  };

  const handleSubmitWithValidation = () => {
    // Generate reference number if not exists
    if (!form.referenceNumber) {
      setForm({ ...form, referenceNumber: generateReferenceNumber(formType) });
    }
    
    // Validate double-entry
    const errors = validateDoubleEntry(form, formType);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      onSubmit();
    }
  };

  const applyAutoSuggestion = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div style={styles.container}>
      {/* Template Section */}
      <div style={styles.templateSection}>
        <div style={styles.templateRow}>
          <select 
            value={selectedTemplate} 
            onChange={(e) => {
              setSelectedTemplate(e.target.value);
              handleLoadTemplate(e.target.value);
            }}
            style={styles.templateSelect}
          >
            <option value="">📄 Load Template</option>
            {Object.keys(templates).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
          
          <button 
            type="button"
            onClick={() => setShowSaveTemplate(!showSaveTemplate)}
            style={styles.saveTemplateButton}
          >
            💾 Save Template
          </button>
        </div>
        
        {showSaveTemplate && (
          <div style={styles.saveTemplateRow}>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
              style={styles.templateNameInput}
            />
            <button onClick={handleSaveTemplate} style={styles.confirmButton}>
              Save
            </button>
            <button onClick={() => setShowSaveTemplate(false)} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Auto-suggestions */}
      {Object.keys(autoSuggestions).length > 0 && (
        <div style={styles.suggestionsSection}>
          <h4 style={styles.suggestionsTitle}>🧠 Smart Suggestions</h4>
          {Object.entries(autoSuggestions).map(([field, value]) => (
            <div key={field} style={styles.suggestion}>
              <span>Suggested {field}: <strong>{value}</strong></span>
              <button 
                onClick={() => applyAutoSuggestion(field, value)}
                style={styles.applySuggestionButton}
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div style={styles.errorsSection}>
          <h4 style={styles.errorsTitle}>🚨 Validation Errors</h4>
          {validationErrors.map((error, index) => (
            <div key={index} style={styles.error}>{error}</div>
          ))}
        </div>
      )}

      {/* Form Content */}
      <div style={styles.formContent}>
        {children}
      </div>

      {/* Enhanced Submit Button */}
      <button 
        onClick={handleSubmitWithValidation}
        style={styles.enhancedSubmitButton}
      >
        {form.id ? 'Update' : 'Add'} {formType.charAt(0).toUpperCase() + formType.slice(1)}
      </button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  templateSection: {
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e5e7eb',
  },
  templateRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  templateSelect: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: 'white',
  },
  saveTemplateButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  saveTemplateRow: {
    marginTop: '10px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  templateNameInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
  },
  confirmButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  suggestionsSection: {
    backgroundColor: '#dbeafe',
    border: '1px solid #93c5fd',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '15px',
  },
  suggestionsTitle: {
    margin: '0 0 10px 0',
    color: '#1e40af',
    fontSize: '14px',
  },
  suggestion: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    fontSize: '14px',
  },
  applySuggestionButton: {
    padding: '4px 12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  errorsSection: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '15px',
  },
  errorsTitle: {
    margin: '0 0 10px 0',
    color: '#dc2626',
    fontSize: '14px',
  },
  error: {
    color: '#dc2626',
    fontSize: '14px',
    marginBottom: '5px',
  },
  formContent: {
    marginBottom: '15px',
  },
  enhancedSubmitButton: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
};
