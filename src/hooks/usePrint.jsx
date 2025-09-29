import { useCallback } from 'react';

/**
 * Hook personalizado para funcionalidades de impressão
 */
export const usePrint = () => {
  const printDocument = useCallback(() => {
    // Verificar se estamos em um ambiente de navegador
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  const printElement = useCallback((elementId) => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(elementId);
      if (element) {
        const originalContent = document.body.innerHTML;
        const elementContent = element.innerHTML;
        
        document.body.innerHTML = `
          <div class="printable-area">
            ${elementContent}
          </div>
        `;
        
        window.print();
        
        document.body.innerHTML = originalContent;
      }
    }
  }, []);

  const printWithStyles = useCallback((elementId) => {
    if (typeof window !== 'undefined') {
      const element = document.getElementById(elementId);
      if (element) {
        const printWindow = window.open('', '_blank');
        const printContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Impressão</title>
              <style>
                @import url('${window.location.origin}/src/print.css');
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .printable-area { max-width: none; margin: 0; padding: 0; }
              </style>
            </head>
            <body>
              <div class="printable-area">
                ${element.innerHTML}
              </div>
            </body>
          </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  }, []);

  return {
    printDocument,
    printElement,
    printWithStyles
  };
};














