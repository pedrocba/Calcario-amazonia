import React from 'react';

/**
 * Componente que aplica um estilo CSS global para formatar a impressão
 * de tickets, simulando uma impressora de recibos.
 */
export default function PrintTicketStyle() {
  return (
    <style>{`
      @media print {
        @page {
          size: auto; /* Ajusta a altura da página ao conteúdo */
          margin: 0mm;  /* Remove margens da página */
        }
        
        body {
            margin: 0;
        }

        /* Esconde tudo que não for o ticket */
        body * {
          visibility: hidden;
        }
        .printable-ticket, .printable-ticket * {
          visibility: visible;
        }
        /* Define a área de impressão */
        .printable-ticket {
          position: absolute;
          left: 0;
          top: 0;
          width: 72mm; /* Largura mais reduzida para garantir */
          font-size: 8.5pt; /* Fonte levemente menor */
          font-family: 'Courier New', Courier, monospace;
          color: #000;
          overflow-wrap: break-word; /* Força a quebra de palavras longas */
          padding-left: 2mm; /* Adiciona margem à esquerda */
          box-sizing: border-box; /* Garante que o padding não aumente a largura total */
        }
      }
    `}</style>
  );
}