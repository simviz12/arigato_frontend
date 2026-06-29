import React from 'react';

interface WeightInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label: string;
  value: number; // in grams
  onChange: (value: number) => void;
  error?: string;
}

export const WeightInput: React.FC<WeightInputProps> = ({ label, value, onChange, error, ...props }) => {
  const kg = value ? (value / 1000).toFixed(2) : 0;

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <label>{label}</label>
        {value > 0 && <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>≈ {kg} kg</span>}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          {...props}
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : 0)}
          style={{ paddingRight: '3rem' }}
        />
        <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>g</span>
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};
