import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { MoneyInput } from '../components/MoneyInput';
import { WeightInput } from '../components/WeightInput';
import { AlertTriangle, Plus, Package, Leaf, Trophy, Medal, Star } from 'lucide-react';

const purchaseSchema = z.object({
  distributorId: z.string().min(1, "Distributor is required"),
  quantityGrams: z.number().min(1, "Quantity must be greater than 0"),
  totalPricePesos: z.number().min(1, "Total price must be greater than 0")
});

const newProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  unitOfMeasure: z.string().min(1, "Unit of measure is required"),
  minimumStockAlert: z.number().min(1, "Minimum stock must be > 0"),
  distributorId: z.string().min(1, "Distributor is required"),
  initialQuantityGrams: z.number().min(1, "Quantity must be > 0"),
  initialPricePesos: z.number().min(1, "Total price must be > 0")
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;
type NewProductFormData = z.infer<typeof newProductSchema>;

export default function PrimaryProductsPage() {
  const queryClient = useQueryClient();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [newDistributorName, setNewDistributorName] = useState('');
  const [rankingProductId, setRankingProductId] = useState<string | null>(null);

  const { data: primaryProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', 'primary'],
    queryFn: async () => {
      const res = await api.get('/api/products/primary');
      return res.data;
    }
  });

  const { data: distributors = [], isLoading: isLoadingDistributors } = useQuery({
    queryKey: ['distributors'],
    queryFn: async () => {
      const res = await api.get('/api/distributors');
      return res.data;
    }
  });

  const { data: rankingData = [], isLoading: isLoadingRanking } = useQuery({
    queryKey: ['products', 'primary', rankingProductId, 'ranking'],
    queryFn: async () => {
      const res = await api.get(`/api/products/primary/${rankingProductId}/distributors/ranking`);
      return res.data;
    },
    enabled: !!rankingProductId
  });

  const purchaseForm = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { distributorId: '', quantityGrams: 0, totalPricePesos: 0 }
  });

  const newProductForm = useForm<NewProductFormData>({
    resolver: zodResolver(newProductSchema),
    defaultValues: { name: '', unitOfMeasure: 'Gramos', minimumStockAlert: 0, distributorId: '', initialQuantityGrams: 0, initialPricePesos: 0 }
  });

  const createDistributorMutation = useMutation({
    mutationFn: (name: string) => api.post('/api/distributors', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
    }
  });

  const createProductMutation = useMutation({
    mutationFn: (data: NewProductFormData) => api.post('/api/products/primary', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'primary'] });
      setIsNewProductModalOpen(false);
      newProductForm.reset();
      setNewDistributorName('');
    }
  });

  const purchaseMutation = useMutation({
    mutationFn: (data: PurchaseFormData & { productId: string }) => api.post(`/api/products/primary/${data.productId}/purchase`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'primary'] });
      setIsPurchaseModalOpen(false);
      purchaseForm.reset();
      setNewDistributorName('');
    }
  });

  const onPurchaseSubmit = async (data: PurchaseFormData) => {
    if (!selectedProductId) return;
    
    let distId = data.distributorId;
    if (distId === 'NEW') {
      const distRes = await createDistributorMutation.mutateAsync(newDistributorName);
      distId = distRes.data.id;
    }
    
    purchaseMutation.mutate({ ...data, distributorId: distId, productId: selectedProductId });
  };

  const onNewProductSubmit = async (data: NewProductFormData) => {
    if (data.distributorId === 'NEW') {
      const distRes = await createDistributorMutation.mutateAsync(newDistributorName);
      data.distributorId = distRes.data.id;
    }
    createProductMutation.mutate(data);
  };

  const openPurchaseModal = (productId: string) => {
    setSelectedProductId(productId);
    setIsPurchaseModalOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-ari-indigo flex items-center gap-3">
            <Leaf className="text-ari-vermilion" size={32} />
            Materia Prima
          </h1>
          <p className="text-ari-mist mt-1">Gestión de inventario base e ingredientes crudos</p>
        </div>
        <button 
          onClick={() => setIsNewProductModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg btn-hanko"
        >
          <Plus size={18} /> Nuevo Ingrediente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-ari-line overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-ari-cream/30 text-ari-mist uppercase text-xs tracking-wider border-b border-ari-line">
              <th className="px-6 py-4 font-semibold">Ingrediente</th>
              <th className="px-6 py-4 font-semibold">Stock Actual</th>
              <th className="px-6 py-4 font-semibold">Mínimo / Alerta</th>
              <th className="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ari-line text-ari-ink">
            {primaryProducts.map((p: any) => {
              const currentStockVal = p.currentStock?.grams ?? p.currentStockGrams ?? 0;
              const minStockVal = p.minimumStockAlert?.grams ?? p.minimumStockAlert ?? 0;
              const isLowStock = p.stockLow ?? (currentStockVal <= minStockVal);
              return (
                <tr key={p.id} className="hover:bg-ari-cream/10 transition-colors group">
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.currentStock?.grams ?? p.currentStockGrams ?? 0} {p.unitOfMeasure === 'GRAM' || p.unitOfMeasure === 'Gramos' ? 'g' : 'u'}</span>
                      <span className="text-sm text-ari-mist">
                        ({p.unitOfMeasure === 'GRAM' || p.unitOfMeasure === 'Gramos' ? ((p.currentStock?.grams ?? p.currentStockGrams ?? 0) / 1000).toFixed(2) + ' kg' : '-'})
                      </span>
                      {isLowStock && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-ari-vermilion text-xs font-bold border border-red-100">
                          <AlertTriangle size={12} /> BAJO
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-ari-mist">
                    {p.minimumStockAlert?.grams ?? p.minimumStockAlert ?? 0} {p.unitOfMeasure === 'GRAM' || p.unitOfMeasure === 'Gramos' ? 'g' : 'u'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => setRankingProductId(p.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-500 border border-ari-line rounded-full hover:border-amber-500 hover:bg-amber-50 transition-all shadow-sm"
                    >
                      <Trophy size={16} /> Ranking
                    </button>
                    <button 
                      onClick={() => openPurchaseModal(p.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-ari-indigo border border-ari-line rounded-full hover:border-ari-indigo hover:bg-ari-indigo/5 transition-all shadow-sm"
                    >
                      <Plus size={16} /> Reabastecer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RE-STOCK PURCHASE MODAL */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 bg-ari-indigo/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-ari-line relative">
            <h2 className="text-2xl font-heading font-bold text-ari-indigo mb-6">Registrar Compra</h2>
            
            <form onSubmit={purchaseForm.handleSubmit(onPurchaseSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ari-ash mb-1">Distribuidor</label>
                <Controller
                  name="distributorId"
                  control={purchaseForm.control}
                  render={({ field }) => (
                    <select {...field} className="w-full border border-ari-line rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion">
                      <option value="">Seleccione un distribuidor...</option>
                      {distributors.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                      <option value="NEW">+ Crear Nuevo Distribuidor</option>
                    </select>
                  )}
                />
                {purchaseForm.watch('distributorId') === 'NEW' && (
                  <input 
                    type="text" 
                    placeholder="Nombre del nuevo distribuidor" 
                    value={newDistributorName}
                    onChange={(e) => setNewDistributorName(e.target.value)}
                    className="w-full border border-ari-line rounded-xl p-3 mt-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion" 
                    required
                  />
                )}
                {purchaseForm.formState.errors.distributorId && <span className="text-red-500 text-xs font-bold mt-1 block">{purchaseForm.formState.errors.distributorId.message}</span>}
              </div>

              <Controller
                name="quantityGrams"
                control={purchaseForm.control}
                render={({ field }) => (
                  <WeightInput 
                    label="Cantidad Comprada (Gramos)" 
                    value={field.value} 
                    onChange={field.onChange} 
                    error={purchaseForm.formState.errors.quantityGrams?.message}
                  />
                )}
              />

              <Controller
                name="totalPricePesos"
                control={purchaseForm.control}
                render={({ field }) => (
                  <MoneyInput 
                    label="Precio Total (Pesos)" 
                    value={field.value} 
                    onChange={field.onChange}
                    error={purchaseForm.formState.errors.totalPricePesos?.message}
                  />
                )}
              />

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="flex-1 py-3 font-semibold text-ari-ash border border-ari-line rounded-full hover:bg-ari-cream transition-colors shadow-sm">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={purchaseMutation.isPending || (purchaseForm.watch('distributorId') === 'NEW' && createDistributorMutation.isPending)} 
                  className="flex-1 py-3 font-semibold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg btn-hanko disabled:opacity-50"
                >
                  {purchaseMutation.isPending || createDistributorMutation.isPending ? 'Confirmando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PRODUCT MODAL */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 bg-ari-indigo/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-ari-line relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-heading font-bold text-ari-indigo mb-6 flex items-center gap-3">
              <Leaf className="text-ari-vermilion" /> Nuevo Ingrediente
            </h2>
            
            <form onSubmit={newProductForm.handleSubmit(onNewProductSubmit)} className="space-y-6">
              
              <div className="bg-ari-cream/30 p-4 rounded-xl border border-ari-line space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-ari-indigo mb-2">1. Detalles del Producto</h3>
                <div>
                  <label className="block text-sm font-semibold text-ari-ash mb-2">Nombre del Ingrediente</label>
                  <Controller
                    name="name"
                    control={newProductForm.control}
                    render={({ field }) => (
                      <input {...field} type="text" placeholder="Ej: Cebolla Cabezona" className="w-full border border-ari-line rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion" />
                    )}
                  />
                  {newProductForm.formState.errors.name && <span className="text-red-500 text-xs font-bold mt-1 block">{newProductForm.formState.errors.name.message}</span>}
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-ari-ash mb-2">Unidad</label>
                    <Controller
                      name="unitOfMeasure"
                      control={newProductForm.control}
                      render={({ field }) => (
                        <select {...field} className="w-full border border-ari-line rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion">
                          <option value="Gramos">Gramos (g)</option>
                          <option value="Mililitros">Mililitros (ml)</option>
                          <option value="Unidades">Unidades (u)</option>
                        </select>
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <Controller name="minimumStockAlert" control={newProductForm.control} render={({ field }) => (
                      <WeightInput label="Alerta Mínima" value={field.value} onChange={field.onChange} />
                    )} />
                  </div>
                </div>
              </div>

              <div className="bg-ari-cream/30 p-4 rounded-xl border border-ari-line space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-ari-indigo mb-2">2. Primera Compra</h3>
                <div>
                  <label className="block text-sm font-semibold text-ari-ash mb-2">Distribuidor</label>
                  <Controller
                    name="distributorId"
                    control={newProductForm.control}
                    render={({ field }) => (
                      <select {...field} className="w-full border border-ari-line rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion">
                        <option value="">Seleccione a quién se lo compró...</option>
                        {distributors.map((d: any) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                        <option value="NEW">+ Crear Nuevo Distribuidor</option>
                      </select>
                    )}
                  />
                  {newProductForm.watch('distributorId') === 'NEW' && (
                    <input 
                      type="text" 
                      placeholder="Nombre del nuevo distribuidor" 
                      value={newDistributorName}
                      onChange={(e) => setNewDistributorName(e.target.value)}
                      className="w-full border border-ari-line rounded-xl p-3 mt-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion" 
                      required
                    />
                  )}
                  {newProductForm.formState.errors.distributorId && <span className="text-red-500 text-xs font-bold mt-1 block">{newProductForm.formState.errors.distributorId.message}</span>}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <Controller name="initialQuantityGrams" control={newProductForm.control} render={({ field }) => (
                      <WeightInput label="Cantidad Comprada" value={field.value} onChange={field.onChange} />
                    )} />
                  </div>
                  <div className="flex-1">
                    <Controller name="initialPricePesos" control={newProductForm.control} render={({ field }) => (
                      <MoneyInput label="Precio Total" value={field.value} onChange={field.onChange} />
                    )} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsNewProductModalOpen(false)} 
                  className="flex-1 py-3 font-semibold text-ari-ash border border-ari-line rounded-full hover:bg-ari-cream transition-colors shadow-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={createProductMutation.isPending || (newProductForm.watch('distributorId') === 'NEW' && createDistributorMutation.isPending)}
                  className="flex-1 py-3 font-semibold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg btn-hanko disabled:opacity-50"
                >
                  {createProductMutation.isPending || createDistributorMutation.isPending ? 'Guardando...' : 'Guardar Ingrediente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RANKING MODAL */}
      {rankingProductId && (
        <div className="fixed inset-0 bg-ari-indigo/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200" onClick={() => setRankingProductId(null)}>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/40 relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-extrabold text-ari-indigo flex items-center gap-3">
                <Trophy className="text-amber-500" size={32} />
                Ranking Proveedores
              </h2>
            </div>
            
            <p className="text-sm text-ari-ash mb-6">
              Distribuidores ordenados automáticamente por el mejor precio promedio (basado en historial de compras).
            </p>

            <div className="space-y-4">
              {isLoadingRanking ? (
                <div className="text-center text-ari-mist py-8 animate-pulse">Analizando compras históricas...</div>
              ) : rankingData.length === 0 ? (
                <div className="text-center text-ari-mist py-8">No hay compras registradas para este ingrediente.</div>
              ) : (
                rankingData.map((dist: any, index: number) => {
                  const isFirst = index === 0;
                  const isSecond = index === 1;
                  const isThird = index === 2;
                  
                  let badge = null;
                  let cardStyle = "bg-white border-ari-line text-ari-ash";
                  
                  if (isFirst) {
                    badge = <Medal className="text-amber-400" size={24} />;
                    cardStyle = "bg-gradient-to-r from-amber-50 to-white border-amber-200 text-amber-900 shadow-sm transform scale-[1.02] z-10";
                  } else if (isSecond) {
                    badge = <Medal className="text-slate-400" size={20} />;
                    cardStyle = "bg-gradient-to-r from-slate-50 to-white border-slate-200 text-slate-800";
                  } else if (isThird) {
                    badge = <Medal className="text-orange-400" size={20} />;
                    cardStyle = "bg-gradient-to-r from-orange-50 to-white border-orange-200 text-orange-900";
                  }

                  return (
                    <div key={dist.distributorId} className={`relative p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${cardStyle}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 flex justify-center font-extrabold text-xl opacity-80">
                          {isFirst || isSecond || isThird ? badge : `#${index + 1}`}
                        </div>
                        <div>
                          <h4 className={`font-bold ${isFirst ? 'text-lg' : ''}`}>{dist.distributorName}</h4>
                          <p className="text-xs opacity-70 flex items-center gap-1">
                            <Star size={10} /> {dist.totalPurchases} compras previas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-extrabold ${isFirst ? 'text-amber-600 text-lg' : ''}`}>
                          ${dist.averagePricePerGram.toFixed(1)} <span className="text-xs font-normal opacity-70">/g</span>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button 
              onClick={() => setRankingProductId(null)}
              className="mt-8 w-full py-3 font-semibold text-ari-ash border border-ari-line rounded-full hover:bg-ari-cream transition-colors shadow-sm"
            >
              Cerrar Ranking
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
