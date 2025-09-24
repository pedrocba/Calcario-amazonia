import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { usePrint } from '../../hooks/usePrint';

const PrintButton = ({ 
  elementId, 
  className = '', 
  variant = 'default',
  size = 'default',
  children = 'Imprimir',
  useStyles = true 
}) => {
  const { printElement, printWithStyles } = usePrint();

  const handlePrint = () => {
    if (useStyles) {
      printWithStyles(elementId);
    } else {
      printElement(elementId);
    }
  };

  return (
    <Button 
      onClick={handlePrint}
      className={`print-button ${className}`}
      variant={variant}
      size={size}
    >
      <Printer className="w-4 h-4 mr-2" />
      {children}
    </Button>
  );
};

export default PrintButton;







