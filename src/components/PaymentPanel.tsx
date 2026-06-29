import React, { useState, useEffect } from 'react';
import { Banknote, CreditCard, Wallet } from 'lucide-react';

interface PaymentPanelProps {
  totalAmount: number;
  onCompleteSale: (paymentData: any) => void;
}

export function PaymentPanel({ totalAmount, onCompleteSale }: PaymentPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'NEQUI' | 'MIXED' | null>(null);
  
  // Cash State
  const [cashReceivedStr, setCashReceivedStr] = useState<string>('');
  
  // Mixed State
  const [mixedCashStr, setMixedCashStr] = useState<string>('');
  const [mixedNequiStr, setMixedNequiStr] = useState<string>('');

  // Reset inputs when total changes
  useEffect(() => {
    setCashReceivedStr('');
    setMixedCashStr('');
    setMixedNequiStr('');
  }, [totalAmount]);

  // Clean strings to numbers
  const cashReceived = parseInt(cashReceivedStr.replace(/\D/g, '') || '0', 10);
  const mixedCash = parseInt(mixedCashStr.replace(/\D/g, '') || '0', 10);
  const mixedNequi = parseInt(mixedNequiStr.replace(/\D/g, '') || '0', 10);

  // Constants
  const DENOMINATIONS = [10000, 20000, 50000, 100000];

  const handleQuickCash = (amount: number) => {
    setCashReceivedStr(amount.toString());
  };

  const handleCashInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCashReceivedStr(raw);
  };

  const renderEfectivo = () => {
    const change = cashReceived - totalAmount;
    const isSufficient = cashReceived >= totalAmount;

    return (
      <div className="mt-4 flex flex-col gap-4 animate-fade-in">
        <div>
          <label className="block text-sm text-ari-mist font-semibold mb-2">Efectivo Recibido</label>
          <input 
            type="text" 
            value={cashReceivedStr ? `$${parseInt(cashReceivedStr).toLocaleString('es-CO')}` : ''}
            onChange={handleCashInput}
            placeholder="$0"
            className="w-full text-2xl font-bold p-4 text-right rounded-xl border border-ari-line focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 bg-white shadow-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button 
            className="flex-1 py-3 px-2 text-sm font-semibold text-ari-indigo border border-ari-line rounded-full hover:bg-ari-cream transition-colors bg-white shadow-sm" 
            onClick={() => handleQuickCash(totalAmount)}
          >
            Exacto
          </button>
          {DENOMINATIONS.map(den => {
            if (den < totalAmount) return null; // Smart filtering
            return (
              <button 
                key={den} 
                className="flex-1 py-3 px-2 text-sm font-semibold text-ari-indigo border border-ari-line rounded-full hover:bg-ari-cream transition-colors bg-white shadow-sm"
                onClick={() => handleQuickCash(den)}
              >
                ${(den/1000).toLocaleString('es-CO')}k
              </button>
            );
          })}
        </div>

        <div className={`p-4 rounded-xl text-center border transition-colors duration-300 ${isSufficient ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="text-sm text-ari-mist font-bold uppercase tracking-wider mb-1">Cambio a devolver</div>
          <div className={`text-2xl font-extrabold ${isSufficient ? 'text-green-600' : 'text-ari-vermilion'}`}>
            {isSufficient ? `$${change.toLocaleString('es-CO')}` : 'Monto Insuficiente'}
          </div>
        </div>

        <button 
          className="w-full py-4 text-lg font-bold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg btn-hanko disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
          disabled={!isSufficient}
          onClick={() => {
            onCompleteSale({ method: 'CASH', received: cashReceived, change });
          }}
        >
          Completar Venta
        </button>
      </div>
    );
  };

  const renderNequi = () => (
    <div className="mt-4 flex flex-col gap-4 animate-fade-in">
      <div className="p-6 text-center bg-white border border-ari-line rounded-xl shadow-sm">
        <p className="m-0 text-ari-mist font-bold uppercase tracking-widest text-sm">Monto exacto a transferir:</p>
        <h3 className="m-0 mt-3 text-4xl font-heading font-extrabold text-ari-indigo">${totalAmount.toLocaleString('es-CO')}</h3>
      </div>
      <button 
        className="w-full py-4 text-lg font-bold text-white bg-ari-indigo rounded-full hover:bg-ari-indigo/90 active:scale-95 transition-all shadow-lg btn-hanko"
        onClick={() => {
          onCompleteSale({ method: 'NEQUI' });
        }}
      >
        Confirmar Nequi & Cobrar
      </button>
    </div>
  );

  const renderMixto = () => {
    const sum = mixedCash + mixedNequi;
    const isExact = sum === totalAmount;

    return (
      <div className="mt-4 flex flex-col gap-4 animate-fade-in">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-ari-mist font-semibold mb-2">Efectivo</label>
            <input 
              type="text" 
              value={mixedCashStr ? `$${parseInt(mixedCashStr).toLocaleString('es-CO')}` : ''}
              onChange={(e) => setMixedCashStr(e.target.value.replace(/\D/g, ''))}
              placeholder="$0"
              className="w-full text-lg p-3 rounded-xl border border-ari-line focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 bg-white shadow-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-ari-mist font-semibold mb-2">Nequi</label>
            <input 
              type="text" 
              value={mixedNequiStr ? `$${parseInt(mixedNequiStr).toLocaleString('es-CO')}` : ''}
              onChange={(e) => setMixedNequiStr(e.target.value.replace(/\D/g, ''))}
              placeholder="$0"
              className="w-full text-lg p-3 rounded-xl border border-ari-line focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 bg-white shadow-sm"
            />
          </div>
        </div>

        <div className={`p-4 rounded-xl text-center border transition-colors duration-300 ${isExact ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="text-sm font-bold uppercase tracking-wider text-ari-mist mb-1">Suma Total</div>
          <div className={`text-2xl font-extrabold ${isExact ? 'text-green-600' : 'text-ari-vermilion'}`}>
            ${sum.toLocaleString('es-CO')}
          </div>
          {!isExact && (
            <div className="text-sm font-semibold text-ari-vermilion mt-2">
              Faltan ${(totalAmount - sum).toLocaleString('es-CO')}
            </div>
          )}
        </div>

        <button 
          className="w-full py-4 text-lg font-bold text-white bg-purple-600 rounded-full hover:bg-purple-700 active:scale-95 transition-all shadow-lg btn-hanko disabled:opacity-50 disabled:active:scale-100"
          disabled={!isExact}
          onClick={() => onCompleteSale({ method: 'MIXED', cash: mixedCash, nequi: mixedNequi })}
        >
          Completar Venta Mixta
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Segmented Control */}
      <div className="flex gap-2 bg-ari-cream/50 p-2 rounded-xl border border-ari-line">
        <button 
          className={`flex-1 py-3 px-2 flex justify-center items-center gap-2 rounded-full font-bold text-sm transition-all shadow-sm ${paymentMethod === 'CASH' ? 'bg-ari-vermilion text-white shadow-md' : 'bg-white text-ari-mist hover:text-ari-indigo'}`}
          onClick={() => setPaymentMethod('CASH')}
        >
          <Banknote size={18} /> Efectivo
        </button>
        <button 
          className={`flex-1 py-3 px-2 flex justify-center items-center gap-2 rounded-full font-bold text-sm transition-all shadow-sm ${paymentMethod === 'NEQUI' ? 'bg-ari-indigo text-white shadow-md' : 'bg-white text-ari-mist hover:text-ari-indigo'}`}
          onClick={() => setPaymentMethod('NEQUI')}
        >
          <CreditCard size={18} /> Nequi
        </button>
        <button 
          className={`flex-1 py-3 px-2 flex justify-center items-center gap-2 rounded-full font-bold text-sm transition-all shadow-sm ${paymentMethod === 'MIXED' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-ari-mist hover:text-ari-indigo'}`}
          onClick={() => setPaymentMethod('MIXED')}
        >
          <Wallet size={18} /> Mixto
        </button>
      </div>

      {!paymentMethod && (
        <div className="p-8 text-center text-ari-mist font-semibold italic bg-ari-cream/30 rounded-xl border border-ari-line/50 border-dashed">
          Seleccione un método de pago arriba
        </div>
      )}

      {paymentMethod === 'CASH' && renderEfectivo()}
      {paymentMethod === 'NEQUI' && renderNequi()}
      {paymentMethod === 'MIXED' && renderMixto()}

    </div>
  );
}
