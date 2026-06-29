import React, { useState } from 'react';
import { Package, Plus, GlassWater } from 'lucide-react';
import { MoneyInput } from '../components/MoneyInput';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export default function ResaleItemsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    primaryProductId: '',
    distributorId: '',
    quantityUnits: 0,
    totalPricePesos: 0
  });

  const { data: resaleItems = [] } = useQuery({
    queryKey: ['products', 'resale'],
    queryFn: async () => {
      const res = await api.get('/api/products/primary/resale');
      return res.data;
    }
  });

  const { data: distributors = [] } = useQuery({
    queryKey: ['distributors'],
    queryFn: async () => {
      const res = await api.get('/api/distributors');
      return res.data;
    }
  });

  const purchaseMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post(`/api/products/primary/${data.primaryProductId}/purchase`, {
        distributorId: data.distributorId,
        quantity: data.quantityUnits, // DTO expects quantity to map to unitOfMeasure which is UNIT
        totalPricePesos: data.totalPricePesos
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'resale'] });
      setIsModalOpen(false);
      setPurchaseForm({ primaryProductId: '', distributorId: '', quantityUnits: 0, totalPricePesos: 0 });
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-ari-indigo flex items-center gap-3">
            <GlassWater className="text-ari-vermilion" size={32} />
            Inventario Bebidas
          </h1>
          <p className="text-ari-mist mt-1">Gestión de productos de reventa (Bebidas, Postres)</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg btn-hanko"
        >
          <Plus size={18} /> Ingresar Compra
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-ari-line overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-ari-cream/30 text-ari-mist uppercase text-xs tracking-wider border-b border-ari-line">
              <th className="px-6 py-4 font-semibold">Producto</th>
              <th className="px-6 py-4 font-semibold">Stock Físico (Unidades)</th>
              <th className="px-6 py-4 font-semibold text-right">Costo Promedio Unidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ari-line text-ari-ink">
            {resaleItems.map((item: any) => (
              <tr key={item.id} className="hover:bg-ari-cream/10 transition-colors">
                <td className="px-6 py-4 font-medium text-lg">{item.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${
                    item.currentStockUnits > 10 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-ari-vermilion border-red-200 animate-pulse'
                  }`}>
                    {item.currentStockUnits} unidades
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono text-ari-ash font-medium">
                  $ {(item.currentAverageCostPerGram || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-ari-indigo/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-ari-line relative">
            <h2 className="text-xl font-heading font-bold text-ari-indigo mb-6">Registrar Compra de Bebidas</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-ari-ash mb-1">Producto</label>
                <select 
                  className="w-full border border-ari-line rounded p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion"
                  value={purchaseForm.primaryProductId} 
                  onChange={e => setPurchaseForm({...purchaseForm, primaryProductId: e.target.value})}
                >
                  <option value="">Seleccionar bebida...</option>
                  {resaleItems.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ari-ash mb-1">Distribuidor</label>
                <select 
                  className="w-full border border-ari-line rounded p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion"
                  value={purchaseForm.distributorId} 
                  onChange={e => setPurchaseForm({...purchaseForm, distributorId: e.target.value})}
                >
                  <option value="">Seleccionar distribuidor...</option>
                  {distributors.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ari-ash mb-1">Unidades Compradas</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full border border-ari-line rounded p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion"
                  value={purchaseForm.quantityUnits || ''} 
                  onChange={e => setPurchaseForm({...purchaseForm, quantityUnits: parseInt(e.target.value) || 0})}
                  placeholder="Ej. 24"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ari-ash mb-1">Precio Total (Factura)</label>
                <MoneyInput 
                  value={purchaseForm.totalPricePesos} 
                  onChange={val => setPurchaseForm({...purchaseForm, totalPricePesos: val})} 
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" disabled={purchaseMutation.isPending} className="flex-1 py-3 font-semibold text-ari-ash border border-ari-line rounded-full hover:bg-ari-cream transition-colors shadow-sm" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button 
                type="button" 
                className="flex-1 py-3 font-semibold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:active:scale-100"
                onClick={() => purchaseMutation.mutate(purchaseForm)}
                disabled={purchaseMutation.isPending || !purchaseForm.primaryProductId || !purchaseForm.distributorId || purchaseForm.quantityUnits <= 0 || purchaseForm.totalPricePesos <= 0}
              >
                {purchaseMutation.isPending ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
