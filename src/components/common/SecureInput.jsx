import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';

// Sanitização e validação de entrada
const sanitizeInput = (value, type = 'text') => {
  if (typeof value !== 'string') return value;
  
  switch (type) {
    case 'sql':
      // Previne SQL injection
      return value.replace(/['"\\;]/g, '');
    case 'html':
      // Previne XSS
      return value.replace(/<[^>]*>/g, '');
    case 'number':
      // Apenas números e pontos/vírgulas
      return value.replace(/[^0-9.,\-]/g, '');
    case 'email':
      // Validação básica de email
      return value.toLowerCase().trim();
    default:
      // Sanitização geral
      return value.trim();
  }
};

const validateInput = (value, rules = {}) => {
  const errors = [];
  
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push('Campo obrigatório');
  }
  
  if (rules.minLength && value && value.toString().length < rules.minLength) {
    errors.push(`Mínimo ${rules.minLength} caracteres`);
  }
  
  if (rules.maxLength && value && value.toString().length > rules.maxLength) {
    errors.push(`Máximo ${rules.maxLength} caracteres`);
  }
  
  if (rules.pattern && value && !rules.pattern.test(value.toString())) {
    errors.push('Formato inválido');
  }
  
  return errors;
};

export default function SecureInput({ 
  value, 
  onChange, 
  validation = {},
  sanitizationType = 'text',
  realTimeValidation = true,
  ...props 
}) {
  const [errors, setErrors] = useState([]);
  const [hasBlurred, setHasBlurred] = useState(false);

  const handleChange = (e) => {
    const rawValue = e.target.value;
    const sanitizedValue = sanitizeInput(rawValue, sanitizationType);
    
    if (realTimeValidation && hasBlurred) {
      const validationErrors = validateInput(sanitizedValue, validation);
      setErrors(validationErrors);
    }
    
    onChange({ ...e, target: { ...e.target, value: sanitizedValue } });
  };

  const handleBlur = (e) => {
    setHasBlurred(true);
    const validationErrors = validateInput(e.target.value, validation);
    setErrors(validationErrors);
    if (props.onBlur) props.onBlur(e);
  };

  return (
    <div>
      <Input
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={errors.length > 0 ? 'border-red-500' : props.className}
      />
      {errors.length > 0 && (
        <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
          <AlertTriangle className="w-3 h-3" />
          {errors[0]}
        </div>
      )}
    </div>
  );
}