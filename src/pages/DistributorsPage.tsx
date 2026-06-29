import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, Plus, Trash2, ChevronDown, ChevronUp, Trophy, Search, FileText } from 'lucide-react';
import { MoneyInput } from '../components/MoneyInput';
import { WeightInput } from '../components/WeightInput';
import api from '../api/axios';

const offerSchema = z.object({
  primaryProductId: z.string().min(1, "El producto es obligatorio"),
  offeredQuantityGrams: z.number().min(1, "La cantidad debe ser > 0"),
  offeredPricePesos: z.number().min(1, "El precio debe ser > 0")
});

const distributorSchema = z.object({
  name: z.string().min(3, "El nombre comercial es obligatorio"),
  contactPhone: z.string().min(3, "El teléfono es obligatorio"),
  contactEmail: z.string().email("Correo electrónico inválido").or(z.literal('')),
  initialProductId: z.string().optional(),
  initialQuantityGrams: z.number().optional(),
  initialPricePesos: z.number().optional(),
});

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Dummy data removed

export default function DistributorsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ranking' | 'directory'>('ranking');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Modals
  const [isNewDistributorModalOpen, setIsNewDistributorModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: distributors = [] } = useQuery({
    queryKey: ['distributors'],
    queryFn: async () => {
      const res = await api.get('/api/distributors');
      return res.data;
    }
  });

  const { data: primaryProducts = [] } = useQuery({
    queryKey: ['products', 'primary'],
    queryFn: async () => {
      const res = await api.get('/api/products/primary');
      return res.data;
    }
  });

  const offerForm = useForm<z.infer<typeof offerSchema>>({
    resolver: zodResolver(offerSchema),
    defaultValues: { primaryProductId: '', offeredQuantityGrams: 0, offeredPricePesos: 0 }
  });

  const distForm = useForm<z.infer<typeof distributorSchema>>({
    resolver: zodResolver(distributorSchema),
    defaultValues: { name: '', contactPhone: '', contactEmail: '', initialProductId: '', initialQuantityGrams: 0, initialPricePesos: 0 }
  });

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  const onAddOffer = (distributorId: string, data: z.infer<typeof offerSchema>) => {
    console.log("Mock offer added:", distributorId, data);
    offerForm.reset();
  };

  const onAddDistributor = (data: z.infer<typeof distributorSchema>) => {
    console.log("Mock distributor added with product link:", data);
    distForm.reset();
    setIsNewDistributorModalOpen(false);
    // Ideally after creating, redirect to Ranking to see the new addition
    setActiveTab('ranking');
  };

  const handleDownloadFullPDF = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/api/analytics/best-distributors/export-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ranking-completo-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading PDF", error);
      alert("Error de conexión con el servidor al descargar PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredRanking = React.useMemo(() => {
    const rankingMap = new Map();
    primaryProducts.forEach((p: any) => {
      rankingMap.set(p.id, { productName: p.name, distributors: [] });
    });

    distributors.forEach((d: any) => {
      if (d.offers && Array.isArray(d.offers)) {
        d.offers.forEach((o: any) => {
          if (rankingMap.has(o.primaryProductId)) {
            const cost = o.offeredQuantityGrams > 0 ? (o.offeredPricePesos / o.offeredQuantityGrams) : 0;
            rankingMap.get(o.primaryProductId).distributors.push({
              name: d.name,
              cost: cost.toFixed(2),
              rawCost: cost
            });
          }
        });
      }
    });

    const allRankings = Array.from(rankingMap.values())
      .filter(r => r.distributors.length > 0)
      .map(r => {
        r.distributors.sort((a: any, b: any) => a.rawCost - b.rawCost);
        r.distributors.forEach((dist: any, idx: number) => { dist.rank = idx + 1; });
        return r;
      });

    if (!searchTerm) return allRankings;
    return allRankings.filter(r => r.productName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [primaryProducts, distributors, searchTerm]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-ari-indigo flex items-center gap-3">
            <Truck className="text-ari-vermilion" size={32} />
            Gestión de Proveedores
          </h1>
          <p className="text-ari-mist mt-1">Directorio y Ranking de precios por ingrediente</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'ranking' ? (
            <button 
              onClick={handleDownloadFullPDF} 
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-ari-indigo rounded-full hover:bg-ari-indigo/90 active:scale-95 transition-all shadow-lg disabled:opacity-50"
            >
              {isExporting ? 'Generando PDF...' : <><FileText size={18} /> Exportar Ranking PDF</>}
            </button>
          ) : (
            <button 
              onClick={() => setIsNewDistributorModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg btn-hanko"
            >
              <Plus size={18} /> Nuevo Distribuidor
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-ari-line">
        <button 
          className={`pb-4 px-4 text-lg font-bold transition-all border-b-2 ${activeTab === 'ranking' ? 'border-ari-vermilion text-ari-vermilion' : 'border-transparent text-ari-ash hover:text-ari-indigo'}`}
          onClick={() => setActiveTab('ranking')}
        >
          Ranking por Producto
        </button>
        <button 
          className={`pb-4 px-4 text-lg font-bold transition-all border-b-2 ${activeTab === 'directory' ? 'border-ari-vermilion text-ari-vermilion' : 'border-transparent text-ari-ash hover:text-ari-indigo'}`}
          onClick={() => setActiveTab('directory')}
        >
          Directorio de Distribuidores
        </button>
      </div>

      {/* RANKING VIEW */}
      {activeTab === 'ranking' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ari-mist" size={20} />
            <input 
              type="text" 
              placeholder="Buscar ingrediente (ej. Tomate)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-ari-line focus:outline-none focus:ring-2 focus:ring-ari-vermilion/30 focus:border-ari-vermilion shadow-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRanking.map((product, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-ari-line overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-ari-cream/30 p-4 border-b border-ari-line flex items-center justify-between">
                  <h2 className="text-xl font-heading font-extrabold text-ari-indigo m-0">{product.productName}</h2>
                </div>
                
                <div className="p-0">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-ari-mist border-b border-ari-line">
                        <th className="p-4 font-semibold">Rango</th>
                        <th className="p-4 font-semibold">Proveedor</th>
                        <th className="p-4 font-semibold text-right">Costo/g</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ari-line">
                      {product.distributors.map(dist => {
                        const isWinner = dist.rank === 1;
                        return (
                          <tr key={dist.name} className={`${isWinner ? 'bg-amber-50/50' : 'hover:bg-ari-cream/10'}`}>
                            <td className="p-4">
                              {isWinner ? (
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 shadow-sm">
                                  <Trophy size={14} /> #1
                                </span>
                              ) : (
                                <span className="text-ari-ash font-bold px-3">#{dist.rank}</span>
                              )}
                            </td>
                            <td className={`p-4 font-medium ${isWinner ? 'text-amber-900 font-bold' : 'text-ari-ink'}`}>
                              {dist.name}
                            </td>
                            <td className={`p-4 text-right font-mono font-bold ${isWinner ? 'text-amber-600' : 'text-ari-ash'}`}>
                              ${dist.cost}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            
            {filteredRanking.length === 0 && (
              <div className="col-span-2 text-center p-12 text-ari-mist bg-white rounded-xl border border-ari-line border-dashed">
                No se encontraron ingredientes en el ranking.
              </div>
            )}
          </div>
        </div>
      )}

      {/* DIRECTORY VIEW */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-xl shadow-sm border border-ari-line overflow-hidden animate-in fade-in">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ari-cream/30 text-ari-mist uppercase text-xs tracking-wider border-b border-ari-line">
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Contacto</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ari-line text-ari-ink">
              {distributors.map((d: any) => (
                <React.Fragment key={d.id}>
                  <tr className="hover:bg-ari-cream/10 transition-colors">
                    <td className="px-6 py-4 font-medium text-lg text-ari-indigo">{d.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold">{d.contactPhone}</div>
                      <div className="text-xs text-ari-mist">{d.contactEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                        d.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {d.active ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleExpand(d.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-ari-indigo bg-ari-cream rounded-full hover:bg-ari-indigo/10 transition-colors shadow-sm"
                        >
                          {expandedId === d.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Agregar Precio de Compra
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedId === d.id && (
                    <tr className="bg-ari-cream/20 border-b border-ari-line shadow-inner">
                      <td colSpan={4} className="p-6">
                        <div className="bg-white p-6 rounded-xl border border-ari-line shadow-sm">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-ari-indigo mb-4 flex items-center gap-2">
                            <Plus size={16} className="text-ari-vermilion"/> Vincular Producto a este Distribuidor
                          </h4>
                          <form 
                            onSubmit={offerForm.handleSubmit((data) => onAddOffer(d.id, data))}
                            className="flex gap-4 items-end"
                          >
                            <div className="flex-[2]">
                              <label className="block text-xs font-semibold text-ari-ash mb-1">Materia Prima</label>
                              <Controller
                                name="primaryProductId"
                                control={offerForm.control}
                                render={({ field }) => (
                                  <select {...field} className="w-full border border-ari-line rounded-lg p-3 text-sm focus:outline-none focus:border-ari-vermilion">
                                    <option value="">Seleccionar ingrediente...</option>
                                    {primaryProducts.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                  </select>
                                )}
                              />
                            </div>
                            <div className="flex-1">
                              <Controller name="offeredQuantityGrams" control={offerForm.control} render={({ field }) => (
                                <WeightInput label="Gramos que Vende" value={field.value} onChange={field.onChange} />
                              )} />
                            </div>
                            <div className="flex-1">
                              <Controller name="offeredPricePesos" control={offerForm.control} render={({ field }) => (
                                <MoneyInput label="Precio Total" value={field.value} onChange={field.onChange} />
                              )} />
                            </div>
                            <div className="pb-1">
                              <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-ari-indigo rounded-full hover:bg-ari-indigo/90 active:scale-95 transition-all shadow-md">
                                Guardar en Ranking
                              </button>
                            </div>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* NEW DISTRIBUTOR MODAL */}
      {isNewDistributorModalOpen && (
        <div className="fixed inset-0 bg-ari-indigo/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-ari-line relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-heading font-bold text-ari-indigo mb-6 flex items-center gap-3">
              <Truck className="text-ari-vermilion" /> Nuevo Distribuidor
            </h2>
            
            <form onSubmit={distForm.handleSubmit(onAddDistributor)} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-ari-indigo border-b border-ari-line pb-2">1. Datos del Proveedor</h3>
                <div>
                  <label className="block text-sm font-semibold text-ari-ash mb-1">Nombre Comercial</label>
                  <Controller
                    name="name"
                    control={distForm.control}
                    render={({ field }) => (
                      <input {...field} type="text" placeholder="Ej: Carnes El Progreso" className="w-full border border-ari-line rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion" />
                    )}
                  />
                  {distForm.formState.errors.name && <span className="text-red-500 text-xs font-bold mt-1 block">{distForm.formState.errors.name.message}</span>}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-ari-ash mb-1">Teléfono / WhatsApp</label>
                    <Controller
                      name="contactPhone"
                      control={distForm.control}
                      render={({ field }) => (
                        <input {...field} type="text" placeholder="Ej: 300 123 4567" className="w-full border border-ari-line rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion" />
                      )}
                    />
                    {distForm.formState.errors.contactPhone && <span className="text-red-500 text-xs font-bold mt-1 block">{distForm.formState.errors.contactPhone.message}</span>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-ari-ash mb-1">Correo Electrónico</label>
                    <Controller
                      name="contactEmail"
                      control={distForm.control}
                      render={({ field }) => (
                        <input {...field} type="email" placeholder="ventas@empresa.com" className="w-full border border-ari-line rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion" />
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-ari-cream/30 p-4 rounded-xl border border-ari-line space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-ari-indigo mb-2">2. Vincular Primer Producto (Opcional)</h3>
                <p className="text-xs text-ari-mist leading-tight mb-3">Si sabes exactamente qué producto te vende, regístralo aquí para que ingrese directo al ranking.</p>
                
                <div>
                  <label className="block text-sm font-semibold text-ari-ash mb-1">Materia Prima</label>
                  <Controller
                    name="initialProductId"
                    control={distForm.control}
                    render={({ field }) => (
                      <select {...field} className="w-full border border-ari-line rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion">
                        <option value="">Seleccione el producto...</option>
                        {primaryProducts.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <Controller name="initialQuantityGrams" control={distForm.control} render={({ field }) => (
                      <WeightInput label="Gramos que Vende" value={field.value} onChange={field.onChange} />
                    )} />
                  </div>
                  <div className="flex-1">
                    <Controller name="initialPricePesos" control={distForm.control} render={({ field }) => (
                      <MoneyInput label="Precio Ofrecido" value={field.value} onChange={field.onChange} />
                    )} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsNewDistributorModalOpen(false)} 
                  className="flex-1 py-3 font-semibold text-ari-ash border border-ari-line rounded-full hover:bg-ari-cream transition-colors shadow-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 font-semibold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg btn-hanko"
                >
                  Registrar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
