import React from 'react';

export function Alert({ children, className = '', variant = 'default' }) {
  const variantClasses = {
    default: 'bg-blue-50 text-blue-700',
    destructive: 'bg-red-50 text-red-700',
    success: 'bg-green-50 text-green-700',
  };

  return (
    <div className={`rounded-lg p-4 ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function AlertTitle({ children, className = '' }) {
  return (
    <h3 className={`text-sm font-medium mb-2 ${className}`}>
      {children}
    </h3>
  );
}

export function AlertDescription({ children, className = '' }) {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  );
}
