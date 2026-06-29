import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { UtensilsCrossed, Plus, AlertTriangle, Box, ArrowRight, Info, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { WeightInput } from '../components/WeightInput';

export default function BatchPreparationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSubproduct, setSelectedSubproduct] = useState<any>(null);
  const [quantityToPrepare, setQuantityToPrepare] = useState(0);

  const { data: subproducts = [], isLoading } = useQuery({
    queryKey: ['subproducts'],
    queryFn: async () => {
      const res = await api.get('/api/subproducts');
      return res.data;
    }
  });

  const prepareMutation = useMutation({
    mutationFn: async (data: { id: string, quantity: number }) => {
       return api.post(`/api/subproducts/${data.id}/prepare`, { quantity: data.quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subproducts'] });
      setSelectedSubproduct(null);
      setQuantityToPrepare(0);
    }
  });

  const getGaugeColor = (current: number, target: number) => {
    const ratio = current / target;
    if (ratio >= 0.8) return 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]';
    if (ratio >= 0.4) return 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]';
    return 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]';
  };

  const handleConfirmPrepare = () => {
    if (selectedSubproduct && quantityToPrepare > 0) {
      // The user inputs the number of batches, but the backend expects grams
      prepareMutation.mutate({ id: selectedSubproduct.id, quantity: quantityToPrepare * selectedSubproduct.totalYieldGrams });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-ari-vermilion/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-ari-vermilion border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 relative">
      {/* Premium Background Blobs */}
      <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-gradient-to-br from-ari-vermilion/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-gradient-to-tr from-ari-indigo/5 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <div className="flex gap-5 items-center">
          <div className="p-4 bg-gradient-to-br from-ari-indigo to-indigo-800 rounded-2xl shadow-xl shadow-ari-indigo/20 text-white transform hover:scale-105 transition-transform duration-300">
            <UtensilsCrossed size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-4xl font-heading font-extrabold bg-gradient-to-r from-ari-indigo to-indigo-600 bg-clip-text text-transparent tracking-tight">
              Producción de Lotes
            </h1>
            <p className="text-ari-mist mt-1 text-sm font-medium flex items-center gap-2">
              <Activity size={16} /> Monitorea y reabastece tus subproductos
            </p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/admin/recipes/new')}
          className="group relative overflow-hidden inline-flex items-center gap-2 px-8 py-4 font-bold text-white bg-ari-vermilion rounded-2xl hover:bg-red-600 active:scale-95 transition-all shadow-[0_8px_20px_rgba(255,87,87,0.3)] hover:shadow-[0_12px_25px_rgba(255,87,87,0.4)]"
        >
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
          <span className="relative z-10 flex items-center gap-2">
            <Plus size={20} strokeWidth={2.5} /> Nueva Receta
          </span>
        </button>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
        {subproducts.map((sp: any) => {
          const ratio = Math.min((sp.currentBatchStockGrams / sp.totalYieldGrams) * 100, 100);
          const colorClass = getGaugeColor(sp.currentBatchStockGrams, sp.totalYieldGrams);
          
          return (
            <div 
              key={sp.id} 
              className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col relative overflow-hidden"
            >
              {/* Card Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/60 transition-colors"></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-ari-indigo/5 rounded-2xl group-hover:bg-ari-vermilion/10 group-hover:rotate-6 transition-all duration-300 border border-ari-indigo/10 group-hover:border-ari-vermilion/20">
                  <Box className="text-ari-indigo group-hover:text-ari-vermilion transition-colors" size={24} />
                </div>
                {ratio < 40 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100 shadow-sm animate-pulse">
                    <AlertTriangle size={14} /> BAJO
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-heading font-extrabold text-slate-800 mb-1 group-hover:text-ari-indigo transition-colors relative z-10 tracking-tight">{sp.name}</h3>
              <p className="text-xs text-slate-500 mb-8 flex-grow font-medium relative z-10">
                Rendimiento óptimo: <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md ml-1">{sp.totalYieldGrams}g</span>
              </p>
              
              <div className="mb-8 relative z-10 bg-white/50 p-4 rounded-2xl border border-white/60">
                <div className="flex justify-between text-sm font-extrabold text-slate-700 mb-3">
                  <span className="uppercase tracking-wider text-xs text-slate-500">Stock Actual</span>
                  <span className="text-ari-indigo text-base">{sp.currentBatchStockGrams}g</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100/80 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${ratio}%` }}
                  />
                </div>
              </div>

              <button 
                onClick={() => setSelectedSubproduct(sp)}
                className="w-full py-4 rounded-2xl bg-white border-2 border-slate-100 text-ari-indigo font-bold hover:border-ari-indigo/30 hover:bg-ari-indigo/5 hover:text-indigo-700 transition-all flex items-center justify-between px-6 shadow-sm group-hover:shadow-md relative z-10"
              >
                <span>Preparar Lote</span>
                <ChevronRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Premium Modal */}
      {selectedSubproduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedSubproduct(null)}></div>
          
          <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.2)] w-full max-w-xl overflow-hidden border border-white relative z-10 animate-in zoom-in-95 duration-300 slide-in-from-bottom-4">
            
            <div className="bg-gradient-to-br from-ari-indigo to-indigo-900 p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-ari-vermilion/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
              
              <div className="relative z-10 flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                  <UtensilsCrossed className="text-white" size={28}/> 
                </div>
                <h2 className="text-3xl font-heading font-extrabold tracking-tight">
                  Preparar Lote
                </h2>
              </div>
              <p className="text-indigo-100 text-lg relative z-10 font-medium">
                Nueva producción para <strong className="text-white font-bold">{selectedSubproduct.name}</strong>
              </p>
            </div>
            
            <div className="p-10">
              <div className="mb-10">
                <label className="block text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">¿Cuántos lotes preparaste hoy?</label>
                <div className="transform origin-left transition-all hover:scale-[1.02]">
                  <input 
                    type="number"
                    min="1"
                    step="1"
                    value={quantityToPrepare === 0 ? '' : quantityToPrepare}
                    onChange={(e) => setQuantityToPrepare(Number(e.target.value))}
                    className="w-full text-2xl font-bold p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ari-indigo text-slate-700 bg-white shadow-sm"
                    placeholder="Ej. 2"
                  />
                </div>
              </div>

              <div className="min-h-[160px]">
                {quantityToPrepare > 0 ? (
                  <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-3xl border border-rose-100 shadow-[0_8px_24px_rgba(244,63,94,0.06)] animate-in slide-in-from-bottom-4 fade-in duration-500 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-rose-100/50 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
                    <h4 className="flex items-center gap-2 text-rose-600 font-extrabold mb-5 uppercase tracking-wider text-xs">
                      <Info size={16} strokeWidth={3} /> Descuento de Bodega
                    </h4>
                    <ul className="space-y-3 relative z-10">
                      {selectedSubproduct.recipe?.map((ing: any, i: number) => {
                        const batches = quantityToPrepare;
                        const deducted = ing.quantityGrams * batches;
                        return (
                          <li key={i} className="flex justify-between items-center text-sm border-b border-rose-100/60 pb-3 last:border-0 last:pb-0 group">
                            <span className="text-slate-600 font-medium flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 group-hover:scale-150 transition-transform"></div>
                              {ing.primaryProductName}
                            </span>
                            <span className="font-extrabold text-rose-600 bg-rose-100/50 px-3 py-1 rounded-lg">
                              -{deducted.toFixed(0)}g
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center gap-4 text-slate-400">
                    <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100">
                      <Info size={28} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-medium">Ingresa la cantidad de lotes en la parte superior para previsualizar el impacto en tu inventario principal.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  type="button" 
                  className="flex-1 py-4 font-bold text-slate-600 bg-slate-50 border-2 border-slate-200 rounded-2xl hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95" 
                  onClick={() => {
                    setSelectedSubproduct(null);
                    setQuantityToPrepare(0);
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={handleConfirmPrepare}
                  disabled={!quantityToPrepare || prepareMutation.isPending}
                  className="flex-[2] py-4 font-bold text-white bg-gradient-to-r from-ari-vermilion to-rose-500 rounded-2xl hover:from-red-600 hover:to-rose-600 active:scale-95 transition-all shadow-[0_8px_20px_rgba(255,87,87,0.3)] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 flex items-center justify-center gap-2 overflow-hidden relative group"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
                  <span className="relative z-10 flex items-center gap-2">
                    {prepareMutation.isPending ? 'Procesando...' : <><CheckCircle2 size={22} strokeWidth={2.5}/> Confirmar Lote</>}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
