import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Trash2, Save, ArrowLeft, Utensils, AlertCircle } from 'lucide-react';
import { WeightInput } from '../components/WeightInput';
import { MoneyInput } from '../components/MoneyInput';

const componentSchema = z.object({
  type: z.enum(['PRIMARY', 'SUBPRODUCT']),
  primaryProductId: z.string().optional(),
  subproductId: z.string().optional(),
  quantityGrams: z.number().min(1, "Debe ser mayor a 0")
}).refine(data => {
  if (data.type === 'PRIMARY') return !!data.primaryProductId;
  if (data.type === 'SUBPRODUCT') return !!data.subproductId;
  return false;
}, { message: "Seleccione un producto", path: ['primaryProductId'] });

const finalProductSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  sellingPricePesos: z.number().min(0, "El precio no puede ser negativo"),
  category: z.string().min(1, "La categoría es obligatoria"),
  components: z.array(componentSchema).min(1, "Debe agregar al menos un componente")
});

type FinalProductForm = z.infer<typeof finalProductSchema>;

export default function FinalProductFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [liveCost, setLiveCost] = useState(0);

  // For live preview (simulated frontend calculation based on backend data)
  // In a real app, this would query a dedicated preview endpoint if logic is complex.
  const { data: primaryProducts = [] } = useQuery({ queryKey: ['primary-products'], queryFn: async () => (await api.get('/api/products/primary')).data });
  const { data: subproducts = [] } = useQuery({ queryKey: ['subproducts'], queryFn: async () => (await api.get('/api/subproducts')).data });

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FinalProductForm>({
    resolver: zodResolver(finalProductSchema),
    defaultValues: { name: '', sellingPricePesos: 0, category: 'GENERAL', components: [] }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'components' });

  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: FinalProductForm) => {
      const sanitizedComponents = data.components.map(comp => {
        return {
          primaryProductId: comp.type === 'PRIMARY' && comp.primaryProductId ? comp.primaryProductId : null,
          subproductId: comp.type === 'SUBPRODUCT' && comp.subproductId ? comp.subproductId : null,
          quantityGrams: comp.quantityGrams
        };
      });
      return api.post('/api/products/final', {
        name: data.name,
        sellingPricePesos: data.sellingPricePesos,
        category: data.category,
        components: sanitizedComponents
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['final-products'] });
      navigate('/admin/menu');
    },
    onError: (err: any) => {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ocurrió un error al publicar el plato. Revisa los datos.');
      }
    }
  });

  // Watch for margin calculation
  const watchedComponents = watch('components');
  const watchedSellingPrice = watch('sellingPricePesos') || 0;

  useEffect(() => {
    const handler = setTimeout(() => {
      let totalCost = 0;
      watchedComponents.forEach(comp => {
        if (comp.type === 'PRIMARY' && comp.primaryProductId) {
          const product = primaryProducts.find((p: any) => p.id === comp.primaryProductId);
          const costPerGram = product?.currentAverageCostPerGram || 0;
          totalCost += (comp.quantityGrams || 0) * costPerGram;
        } else if (comp.type === 'SUBPRODUCT' && comp.subproductId) {
          const sub = subproducts.find((s: any) => s.id === comp.subproductId);
          const costPerGram = sub?.costPerGram || sub?.currentCostPerGram || 0;
          totalCost += (comp.quantityGrams || 0) * costPerGram;
        }
      });
      setLiveCost(totalCost);
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [watchedComponents, primaryProducts, subproducts]);

  const marginAmount = watchedSellingPrice - liveCost;
  const marginPercentage = watchedSellingPrice > 0 ? (marginAmount / watchedSellingPrice) * 100 : 0;
  const isHealthyMargin = marginPercentage >= 30;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in flex flex-col lg:flex-row gap-8 relative">
      
      <div className="flex-[2] space-y-6">
        <button 
          className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-ari-indigo bg-white border border-ari-line rounded-full hover:bg-ari-cream shadow-sm transition-all" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Volver
        </button>

        <h1 className="text-3xl font-heading font-extrabold text-ari-indigo flex items-center gap-3">
          <Utensils className="text-ari-vermilion" size={36} /> 
          Construir Plato (Producto Final)
        </h1>
        <p className="text-ari-mist -mt-4">Combina materia prima y subproductos para calcular el costo real de tu menú.</p>

        <form onSubmit={handleSubmit((data) => { setError(null); createMutation.mutate(data); })} className="bg-white p-8 rounded-3xl shadow-lg border border-ari-line/50 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-ari-vermilion/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

          {error && (
            <div className="relative z-10 mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 shrink-0" size={24} />
              <div>
                <h3 className="text-red-800 font-bold text-sm">Error al guardar</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-ari-ash mb-2 uppercase tracking-wider">Nombre del Plato</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input {...field} placeholder="Ej. Costillas BBQ" className={`w-full border rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-ari-vermilion/20 focus:border-ari-vermilion text-lg shadow-sm transition-all ${errors.name ? 'border-red-500' : 'border-ari-line'}`} />
                )}
              />
              {errors.name && <span className="text-red-500 text-xs font-bold mt-2 block">{errors.name.message}</span>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-ari-ash mb-2 uppercase tracking-wider">Categoría</label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <select {...field} className="w-full border rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-ari-vermilion/20 focus:border-ari-vermilion text-lg shadow-sm transition-all bg-white border-ari-line">
                    <option value="GENERAL">General</option>
                    <option value="MAIN_COURSE">Plato Fuerte</option>
                    <option value="STARTER">Entrada</option>
                    <option value="DESSERT">Postre</option>
                  </select>
                )}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-ari-ash mb-2 uppercase tracking-wider">Precio de Venta al Público (COP)</label>
              <Controller
                name="sellingPricePesos"
                control={control}
                render={({ field }) => (
                  <MoneyInput value={field.value} onChange={field.onChange} />
                )}
              />
              <span className="text-xs text-ari-mist mt-2 block">
                El precio sugerido final lo defines tú.
              </span>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-ari-line">
            <h3 className="text-xl font-heading font-extrabold text-ari-indigo flex items-center gap-2 mb-6">
              Receta (Componentes)
            </h3>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const rowType = watch(`components.${index}.type`);
                return (
                  <div key={field.id} className="flex flex-col md:flex-row gap-4 items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow">
                    
                    <div className="w-full md:w-[180px]">
                      <label className="block text-xs font-bold text-ari-ash mb-1 uppercase tracking-wider">Tipo</label>
                      <Controller
                        name={`components.${index}.type`}
                        control={control}
                        render={({ field: typeField }) => (
                          <select {...typeField} className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion shadow-sm bg-white border-ari-line">
                            <option value="PRIMARY">Materia Prima</option>
                            <option value="SUBPRODUCT">Subproducto (Receta)</option>
                          </select>
                        )}
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-ari-ash mb-1 uppercase tracking-wider">Seleccionar Componente</label>
                      {rowType === 'PRIMARY' ? (
                        <Controller
                          name={`components.${index}.primaryProductId`}
                          control={control}
                          render={({ field: pField }) => (
                            <select 
                              {...pField} 
                              value={pField.value || ''} 
                              onChange={(e) => { 
                                pField.onChange(e); 
                                control._formValues.components[index].subproductId = undefined; 
                              }}
                              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion shadow-sm bg-white border-ari-line"
                            >
                              <option value="">Seleccionar materia prima...</option>
                              {primaryProducts.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          )}
                        />
                      ) : (
                        <Controller
                          name={`components.${index}.subproductId`}
                          control={control}
                          render={({ field: sField }) => (
                            <select 
                              {...sField} 
                              value={sField.value || ''} 
                              onChange={(e) => { 
                                sField.onChange(e); 
                                control._formValues.components[index].primaryProductId = undefined; 
                              }}
                              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion shadow-sm bg-white border-ari-line"
                            >
                              <option value="">Seleccionar subproducto...</option>
                              {subproducts.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          )}
                        />
                      )}
                    </div>

                    <div className="w-full md:w-[150px]">
                      <Controller
                        name={`components.${index}.quantityGrams`}
                        control={control}
                        render={({ field: qField }) => (
                          <WeightInput label="Cantidad (g)" value={qField.value} onChange={qField.onChange} />
                        )}
                      />
                    </div>

                    <button 
                      type="button" 
                      onClick={() => remove(index)} 
                      className="p-3 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-colors border border-transparent hover:border-red-600 self-end md:self-center mt-2 md:mt-6 shadow-sm"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>

            {errors.components?.root && <span className="text-red-500 text-sm font-bold mb-4 block mt-4">{errors.components.root.message}</span>}

            <button 
              type="button" 
              onClick={() => append({ type: 'PRIMARY', quantityGrams: 0 })} 
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 font-semibold text-ari-indigo bg-ari-cream rounded-full hover:bg-ari-indigo/10 transition-colors shadow-sm"
            >
              <Plus size={18} /> Agregar Componente
            </button>
          </div>

          <div className="relative z-10 pt-6 flex justify-end border-t border-ari-line">
            <button 
              type="submit" 
              disabled={createMutation.isPending || fields.length === 0}
              className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-xl btn-hanko disabled:opacity-50"
            >
              {createMutation.isPending ? 'Guardando...' : <><Save size={20} /> Publicar Plato</>}
            </button>
          </div>
        </form>
      </div>

      {/* Margin Dashboard Panel */}
      <div className="flex-1">
        <div className="bg-ari-indigo p-8 rounded-3xl shadow-2xl border border-ari-indigo/80 sticky top-8 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <h3 className="text-2xl font-heading font-extrabold text-white mb-2">Rentabilidad del Plato</h3>
          <p className="text-white/60 text-sm mb-8 leading-relaxed">
            Margen de ganancia calculado en tiempo real basándose en los costos de materia prima o recetas intermedias seleccionadas.
          </p>
          
          <div className="space-y-4">
            <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Costo de Producción</span>
              <div className="text-3xl font-black font-mono">
                $ {liveCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Precio de Venta</span>
              <div className="text-3xl font-black font-mono">
                $ {watchedSellingPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-colors duration-300 ${
              isHealthyMargin 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <span className={`text-xs font-bold uppercase tracking-widest mb-1 block ${
                isHealthyMargin ? 'text-green-400' : 'text-red-400'
              }`}>
                Margen Bruto {isHealthyMargin ? '(Saludable)' : '(Peligro)'}
              </span>
              <div className={`text-4xl font-black font-mono ${
                isHealthyMargin ? 'text-green-400' : 'text-red-400'
              }`}>
                {marginPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-white/50 mt-2 font-medium">
                Ganancia neta: $ {marginAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            
            {!isHealthyMargin && watchedSellingPrice > 0 && (
              <div className="flex gap-2 text-red-300 text-xs mt-2 bg-red-500/10 p-4 rounded-xl border border-red-500/20 leading-relaxed font-medium">
                <AlertCircle size={18} className="shrink-0" />
                <span>El margen sugerido por la industria es superior al 30%. Considera subir el precio o ajustar la receta.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
