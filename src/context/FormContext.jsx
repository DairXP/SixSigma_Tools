import React, { createContext, useContext, useState, useCallback } from 'react';

const FormContext = createContext();

export function FormProvider({ children }) {
  const [formData, setFormData] = useState({
    id: '',
    timestamp: new Date(),
    type: '',
    phase: '',
    description: '',
    impact: '',
    rootCause: '',
    priority: '',
    dmaic: 'define'
  });
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [formErrors]);

  const clearForm = useCallback(() => {
    setFormData({
      id: '',
      timestamp: new Date(),
      type: '',
      phase: '',
      description: '',
      impact: '',
      rootCause: '',
      priority: '',
      dmaic: 'define'
    });
    setFormErrors({});
  }, []);

  return (
    <FormContext.Provider value={{
      formData,
      setFormData,
      formErrors,
      setFormErrors,
      handleInputChange,
      clearForm
    }}>
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
}
