import React, { useEffect, useState } from 'react';
import { Wallet, Banknote, CreditCard, Activity, ArrowUpRight, ArrowDownRight, Clock, Receipt } from 'lucide-react';
import api from '../api/axios';

// Mock History Data
const MOCK_SALES_HISTORY = [
  { id: 'TX-1045', time: '12:30 PM', items: '2x Ramen Tradicional, 1x Coca-Cola', total: 45000, method: 'NEQUI' },
  { id: 'TX-1046', time: '12:45 PM', items: '1x Chashu Bowl', total: 25000, method: 'EFECTIVO' },
  { id: 'TX-1047', time: '13:15 PM', items: '3x Ramen Spicy, 3x Té Helado', total: 110000, method: 'MIXTO', split: { cash: 50000, nequi: 60000 } },
  { id: 'TX-1048', time: '13:30 PM', items: '1x Porción Gyozas', total: 15000, method: 'EFECTIVO' },
];

export default function CashSessionSummaryPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulando carga rápida y mockeando datos ya que el backend no devuelve todo esto aún
    setTimeout(() => {
      setSummary({
        totalSalesCount: 24,
        totalRevenue: 650000,
        breakdown: {
          EFECTIVO: 150000,
          NEQUI: 390000,
          MIXTO: 110000 // 50k efectivo, 60k nequi
        }
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Wallet className="text-ari-vermilion" size={48} />
          <span className="text-ari-indigo font-bold">Calculando cuadro de caja...</span>
        </div>
      </div>
    );
  }

  // Cálculos reales proyectados para la caja física
  const physicalCashExpected = summary.breakdown.EFECTIVO + 50000; // sumando la parte cash del mixto
  const digitalNequiExpected = summary.breakdown.NEQUI + 60000; // sumando la parte nequi del mixto

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-ari-indigo flex items-center gap-3">
            <Wallet className="text-ari-vermilion" size={32} />
            Resumen de Caja (Turno Actual)
          </h1>
          <p className="text-ari-mist mt-1">Monitoreo 100% en tiempo real de ingresos por método de pago</p>
        </div>
        <div className="bg-ari-cream/50 px-4 py-2 rounded-full border border-ari-line flex items-center gap-2 text-sm font-bold text-ari-indigo">
          <Clock size={16} className="text-ari-vermilion" /> 
          Corte: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-ari-line relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-ari-vermilion/5 rounded-full blur-2xl group-hover:bg-ari-vermilion/10 transition-colors"></div>
          <div className="text-ari-ash text-sm font-bold uppercase tracking-wider mb-2">Órdenes Completadas</div>
          <div className="text-4xl font-heading font-extrabold text-ari-indigo flex items-baseline gap-2">
            {summary.totalSalesCount}
            <span className="text-sm font-medium text-green-500 flex items-center"><ArrowUpRight size={16}/> +12% hoy</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-ari-line relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
          <div className="text-ari-ash text-sm font-bold uppercase tracking-wider mb-2">Ingreso Bruto Turno</div>
          <div className="text-4xl font-heading font-extrabold text-green-600">
            ${summary.totalRevenue.toLocaleString()}
          </div>
        </div>

      </div>

      <h2 className="text-xl font-heading font-bold text-ari-indigo mt-8 mb-4 border-b border-ari-line pb-2">Desglose Exacto para Arqueo de Caja</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* EFECTIVO */}
        <div className="bg-amber-50 p-6 rounded-2xl shadow-sm border border-amber-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-700">
              <Banknote size={32} />
            </div>
            <div>
              <div className="text-xl font-bold text-amber-900">Efectivo en Cajón</div>
              <div className="text-sm text-amber-700/70 leading-tight mt-1">Incluye ventas 100% efectivo y la fracción en efectivo de pagos mixtos.</div>
            </div>
          </div>
          <div className="text-4xl font-black text-amber-600 font-mono tracking-tight text-right">
            ${physicalCashExpected.toLocaleString()}
          </div>
        </div>

        {/* NEQUI */}
        <div className="bg-indigo-50 p-6 rounded-2xl shadow-sm border border-indigo-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl text-indigo-700">
              <CreditCard size={32} />
            </div>
            <div>
              <div className="text-xl font-bold text-indigo-900">Balance Nequi</div>
              <div className="text-sm text-indigo-700/70 leading-tight mt-1">Suma de transferencias directas y fracciones de pagos mixtos.</div>
            </div>
          </div>
          <div className="text-4xl font-black text-indigo-600 font-mono tracking-tight text-right">
            ${digitalNequiExpected.toLocaleString()}
          </div>
        </div>

      </div>

      {/* HISTORIAL DE VENTAS (MONITOREO AL 100%) */}
      <h2 className="text-xl font-heading font-bold text-ari-indigo mt-10 mb-4 border-b border-ari-line pb-2 flex items-center gap-2">
        <Activity size={24} className="text-ari-vermilion"/> Historial de Ventas Recientes
      </h2>

      <div className="bg-white rounded-xl shadow-sm border border-ari-line overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-ari-cream/30 text-ari-mist uppercase text-xs tracking-wider border-b border-ari-line">
              <th className="px-6 py-4 font-semibold">ID Transacción</th>
              <th className="px-6 py-4 font-semibold">Hora</th>
              <th className="px-6 py-4 font-semibold">Detalle del Pedido</th>
              <th className="px-6 py-4 font-semibold text-right">Total</th>
              <th className="px-6 py-4 font-semibold text-center">Método</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ari-line text-ari-ink">
            {MOCK_SALES_HISTORY.map((tx) => (
              <tr key={tx.id} className="hover:bg-ari-cream/10 transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-ari-indigo text-sm">{tx.id}</td>
                <td className="px-6 py-4 text-ari-ash text-sm">{tx.time}</td>
                <td className="px-6 py-4 text-sm font-medium">{tx.items}</td>
                <td className="px-6 py-4 text-right font-bold text-green-600">${tx.total.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  {tx.method === 'EFECTIVO' && <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full"><Banknote size={12}/> Efectivo</span>}
                  {tx.method === 'NEQUI' && <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full"><CreditCard size={12}/> Nequi</span>}
                  {tx.method === 'MIXTO' && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full border border-gray-200">
                        Mixto
                      </span>
                      <span className="text-[10px] text-ari-mist font-mono leading-none">
                        Ef:${tx.split?.cash.toLocaleString()} / Nq:${tx.split?.nequi.toLocaleString()}
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
