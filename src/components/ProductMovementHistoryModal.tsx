import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { X, ArrowUpRight, ArrowDownRight, RefreshCw, ShoppingBag, Package } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MovementModalProps {
  productId: string;
  productName: string;
  onClose: () => void;
}

export function ProductMovementHistoryModal({ productId, productName, onClose }: MovementModalProps) {
  
  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['movements', productId],
    queryFn: async () => (await api.get(`/api/inventory/${productId}/movements`)).data
  });

  const getMovementIcon = (type: string) => {
    switch(type) {
      case 'PURCHASE_IN': return <ArrowUpRight size={20} className="text-emerald-500" />;
      case 'SALE_OUT': return <ArrowDownRight size={20} className="text-red-500" />;
      case 'BATCH_IN': return <RefreshCw size={20} className="text-ari-indigo" />;
      case 'BATCH_OUT': return <Package size={20} className="text-amber-500" />;
      default: return <RefreshCw size={20} className="text-ari-mist" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch(type) {
      case 'PURCHASE_IN': return 'bg-emerald-50 border-emerald-100';
      case 'SALE_OUT': return 'bg-red-50 border-red-100';
      case 'BATCH_IN': return 'bg-indigo-50 border-indigo-100';
      case 'BATCH_OUT': return 'bg-amber-50 border-amber-100';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  const getMovementLabel = (type: string) => {
    switch(type) {
      case 'PURCHASE_IN': return 'Compra (Ingreso)';
      case 'SALE_OUT': return 'Venta (Egreso)';
      case 'BATCH_IN': return 'Preparación (Ingreso)';
      case 'BATCH_OUT': return 'Preparación (Egreso)';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-ari-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-white/20 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-ari-indigo/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="flex justify-between items-center p-8 pb-6 border-b border-ari-line relative z-10">
          <div>
            <h2 className="text-2xl font-heading font-extrabold text-ari-indigo flex items-center gap-3">
              <ShoppingBag className="text-ari-vermilion" size={28} /> 
              Historial de Movimientos
            </h2>
            <div className="text-ari-ash font-medium mt-1">
              Producto: <span className="font-bold text-ari-ink">{productName}</span>
            </div>
          </div>
          <button 
            className="p-3 bg-ari-cream/50 text-ari-mist hover:text-ari-vermilion hover:bg-red-50 rounded-full transition-colors active:scale-95" 
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-8 relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-ari-mist gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ari-vermilion"></div>
              <span className="font-bold">Cargando historial...</span>
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-ari-cream w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-ari-mist">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-xl font-bold text-ari-indigo mb-2">Sin Movimientos</h3>
              <p className="text-ari-mist">Aún no hay movimientos registrados para este producto.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {movements.map((mov: any) => (
                <div 
                  key={mov.id} 
                  className={`flex gap-4 items-center p-4 rounded-2xl border ${getMovementColor(mov.movementType)} transition-all hover:shadow-md`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    {getMovementIcon(mov.movementType)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-bold text-ari-indigo text-lg">{getMovementLabel(mov.movementType)}</div>
                    <div className="text-sm font-medium text-ari-ash mt-0.5 capitalize">
                      {format(new Date(mov.timestamp), "d 'de' MMMM, HH:mm", { locale: es })}
                    </div>
                  </div>
                  
                  <div className={`text-2xl font-mono font-black ${mov.movementType.includes('OUT') ? 'text-red-500' : 'text-emerald-500'}`}>
                    {mov.movementType.includes('OUT') ? '-' : '+'}{mov.quantity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
