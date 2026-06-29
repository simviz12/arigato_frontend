import React from 'react';
import { Printer, X } from 'lucide-react';
import { CartLine, DiscountType } from '../store/useCartStore';

interface ReceiptModalProps {
  saleId: string;
  lines: CartLine[];
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  cashReceived?: number;
  nequiReceived?: number;
  changeOwed: number;
  onClose: () => void;
}

export function ReceiptModal({
  saleId, lines, subtotal, discountType, discountValue, discountAmount, 
  total, paymentMethod, cashReceived, nequiReceived, changeOwed, onClose
}: ReceiptModalProps) {
  
  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleString('es-CO');

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="receipt-container" style={{
        background: '#fff', color: '#000', width: '350px', padding: '1.5rem',
        fontFamily: 'monospace', borderRadius: '8px', position: 'relative'
      }}>
        
        <button className="no-print icon-btn" onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', color: '#000' }}>
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px dashed #000', paddingBottom: '1rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>RESTAURANTE ARIGATO</h2>
          <div style={{ fontSize: '0.9rem' }}>NIT: 900.123.456-7</div>
          <div style={{ fontSize: '0.9rem' }}>Fecha: {today}</div>
          <div style={{ fontSize: '0.9rem' }}>Ticket #: {saleId.split('-')[0]}</div>
          <div style={{ fontSize: '0.9rem' }}>Cajero: Admin</div>
        </div>

        <table style={{ width: '100%', fontSize: '0.9rem', marginBottom: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px dashed #000' }}>
              <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Cant/Desc</th>
              <th style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(line => (
              <tr key={line.productId}>
                <td style={{ paddingTop: '0.5rem' }}>
                  {line.quantity}x {line.productName}<br/>
                  <small>${line.unitPrice.toLocaleString()} c/u</small>
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '0.5rem' }}>
                  ${(line.unitPrice * line.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderTop: '1px dashed #000', paddingTop: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span>SUBTOTAL:</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>DESCUENTO:</span>
              <span>-${discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            <span>TOTAL:</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #000', paddingTop: '1rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Forma de pago:</span>
            <span>{paymentMethod}</span>
          </div>
          {cashReceived !== undefined && cashReceived > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Efectivo recibido:</span>
              <span>${cashReceived.toLocaleString()}</span>
            </div>
          )}
          {nequiReceived !== undefined && nequiReceived > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Nequi recibido:</span>
              <span>${nequiReceived.toLocaleString()}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '0.5rem' }}>
            <span>CAMBIO:</span>
            <span>${changeOwed.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
          ¡Gracias por su compra!<br/>
          Regrese pronto.
        </div>

        <button className="primary no-print" onClick={handlePrint} style={{ width: '100%', marginTop: '2rem', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <Printer size={20} /> Imprimir Ticket (80mm)
        </button>

      </div>
    </div>
  );
}
