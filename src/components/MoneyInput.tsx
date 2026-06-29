import React, { useState } from 'react';

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label: string;
  value: number; // Internal value in cents/pesos
  onChange: (value: number) => void;
  error?: string;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({ label, value, onChange, error, ...props }) => {
  const [displayValue, setDisplayValue] = useState(
    value ? new Intl.NumberFormat('es-CO').format(value) : ''
  );

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let rawStr = e.target.value.replace(/\D/g, '');
    const num = rawStr ? parseInt(rawStr, 10) : 0;
    setDisplayValue(num ? new Intl.NumberFormat('es-CO').format(num) : '');
    onChange(num);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and dots
    let rawStr = e.target.value.replace(/[^0-9.]/g, '');
    setDisplayValue(rawStr);
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>$</span>
        <input
          {...props}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{ paddingLeft: '2rem' }}
        />
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};
