import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Trash2, Save, ArrowLeft, ChefHat, Beaker } from 'lucide-react';
import { WeightInput } from '../components/WeightInput';

const recipeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  totalYieldGrams: z.number().min(1, "El rendimiento debe ser mayor a 0"),
  preparationMode: z.enum(['BATCH', 'ON_THE_FLY']),
  ingredients: z.array(z.object({
    primaryProductId: z.string().min(1, "Seleccione un producto"),
    quantityGrams: z.number().min(1, "La cantidad debe ser mayor a 0")
  })).min(1, "Debe agregar al menos 1 ingrediente")
});

type RecipeForm = z.infer<typeof recipeSchema>;

export default function SubproductFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [estimatedCost, setEstimatedCost] = useState(0);

  // Fetch primary products to populate the selects AND to calculate live cost
  const { data: primaryProducts = [] } = useQuery({
    queryKey: ['products', 'primary'],
    queryFn: async () => {
      const res = await api.get('/api/products/primary');
      return res.data || [];
    }
  });

  const { control, handleSubmit, watch, formState: { errors } } = useForm<RecipeForm>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      totalYieldGrams: 0,
      preparationMode: 'BATCH',
      ingredients: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients'
  });

  const createMutation = useMutation({
    mutationFn: (data: RecipeForm) => api.post('/api/subproducts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subproducts'] });
      navigate('/admin/recipes');
    }
  });

  // Watch ingredients to calculate live cost preview
  const watchedIngredients = watch('ingredients');
  const watchedYield = watch('totalYieldGrams');

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!watchedYield || watchedYield <= 0 || !watchedIngredients.length || !primaryProducts.length) {
        setEstimatedCost(0);
        return;
      }

      let totalRecipeCost = 0;
      watchedIngredients.forEach(ing => {
        const product = primaryProducts.find((p: any) => p.id === ing.primaryProductId);
        const costPerGram = product?.currentAverageCostPerGram || 0; 
        totalRecipeCost += (ing.quantityGrams || 0) * costPerGram;
      });

      setEstimatedCost(totalRecipeCost / watchedYield);
    }, 400); // 400ms Debounce

    return () => clearTimeout(handler);
  }, [watchedIngredients, watchedYield, primaryProducts]);

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
          <ChefHat className="text-ari-vermilion" size={36} /> 
          Crear Nueva Receta
        </h1>
        <p className="text-ari-mist -mt-4">Define la composición exacta de tus subproductos para un costeo perfecto.</p>

        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="bg-white p-8 rounded-3xl shadow-lg border border-ari-line/50 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-ari-vermilion/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-ari-ash mb-2 uppercase tracking-wider">Nombre de la Receta / Subproducto</label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input {...field} placeholder="Ej. Salsa BBQ de la casa" className={`w-full border rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-ari-vermilion/20 focus:border-ari-vermilion text-lg shadow-sm transition-all ${errors.name ? 'border-red-500' : 'border-ari-line'}`} />
                )}
              />
              {errors.name && <span className="text-red-500 text-xs font-bold mt-2 block">{errors.name.message}</span>}
            </div>

            <div className="col-span-2 md:col-span-1">
              <Controller
                name="totalYieldGrams"
                control={control}
                render={({ field }) => (
                  <WeightInput label="Rendimiento Total (Gramos producidos)" value={field.value} onChange={field.onChange} error={errors.totalYieldGrams?.message} />
                )}
              />
            </div>
          </div>

          <div className="relative z-10 bg-ari-cream/30 p-6 rounded-2xl border border-ari-line">
            <label className="block text-sm font-bold text-ari-indigo mb-4 uppercase tracking-wider">Modo de Preparación</label>
            <div className="flex flex-col md:flex-row gap-4">
              <label className="flex-1 flex items-start gap-3 p-4 bg-white rounded-xl border border-ari-line cursor-pointer hover:border-ari-vermilion hover:shadow-md transition-all group">
                <input type="radio" value="BATCH" {...control.register('preparationMode')} className="mt-1 w-5 h-5 accent-ari-vermilion" />
                <div>
                  <strong className="block text-ari-indigo group-hover:text-ari-vermilion transition-colors">POR LOTE (Batch)</strong>
                  <p className="m-0 text-xs text-ari-mist mt-1 leading-relaxed">
                    Se prepara en grandes cantidades de antemano y se guarda en bodega.
                  </p>
                </div>
              </label>
              
              <label className="flex-1 flex items-start gap-3 p-4 bg-white rounded-xl border border-ari-line cursor-pointer hover:border-ari-indigo hover:shadow-md transition-all group">
                <input type="radio" value="ON_THE_FLY" {...control.register('preparationMode')} className="mt-1 w-5 h-5 accent-ari-indigo" />
                <div>
                  <strong className="block text-ari-indigo group-hover:text-ari-indigo transition-colors">AL INSTANTE (On The Fly)</strong>
                  <p className="m-0 text-xs text-ari-mist mt-1 leading-relaxed">
                    Se prepara al instante. Los ingredientes crudos se descuentan directo al vender.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-ari-line">
            <h3 className="text-xl font-heading font-extrabold text-ari-indigo flex items-center gap-2 mb-6">
              <Beaker className="text-ari-vermilion"/> Ingredientes (Fórmula)
            </h3>
            
            {errors.ingredients?.root && <span className="text-red-500 text-sm font-bold mb-4 block">{errors.ingredients.root.message}</span>}

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row gap-4 items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow">
                  <div className="flex-[2] w-full">
                    <label className="block text-xs font-bold text-ari-ash mb-1 uppercase tracking-wider">Materia Prima</label>
                    <Controller
                      name={`ingredients.${index}.primaryProductId`}
                      control={control}
                      render={({ field: selectField }) => (
                        <select {...selectField} className={`w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion shadow-sm bg-white ${errors.ingredients?.[index]?.primaryProductId ? 'border-red-500' : 'border-ari-line'}`}>
                          <option value="">Seleccionar ingrediente crudo...</option>
                          {primaryProducts.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  
                  <div className="flex-1 w-full">
                    <Controller
                      name={`ingredients.${index}.quantityGrams`}
                      control={control}
                      render={({ field: weightField }) => (
                        <WeightInput label="Cantidad (g)" value={weightField.value} onChange={weightField.onChange} />
                      )}
                    />
                  </div>

                  <button type="button" className="p-3 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-colors border border-transparent hover:border-red-600 self-end md:self-center mt-2 md:mt-6 shadow-sm" onClick={() => remove(index)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="mt-6 inline-flex items-center gap-2 px-6 py-3 font-semibold text-ari-indigo bg-ari-cream rounded-full hover:bg-ari-indigo/10 transition-colors shadow-sm" onClick={() => append({ primaryProductId: '', quantityGrams: 0 })}>
              <Plus size={18} /> Agregar Ingrediente
            </button>
          </div>

          <div className="relative z-10 pt-6 flex justify-end border-t border-ari-line">
            <button type="submit" disabled={createMutation.isPending || fields.length === 0} className="inline-flex items-center gap-2 px-8 py-4 font-bold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-xl btn-hanko disabled:opacity-50 disabled:active:scale-100">
              {createMutation.isPending ? 'Guardando...' : <><Save size={20} /> Guardar Receta</>}
            </button>
          </div>
        </form>
      </div>

      {/* Live Cost Preview Panel */}
      <div className="flex-1">
        <div className="bg-ari-indigo p-8 rounded-3xl shadow-2xl border border-ari-indigo/80 sticky top-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <h3 className="text-2xl font-heading font-extrabold text-white mb-2">Costo Estimado</h3>
          <p className="text-white/60 text-sm mb-8 leading-relaxed">
            Arigato calcula matemáticamente el costo de tu receta usando el promedio actual de compra de todos tus ingredientes.
          </p>

          <div className="space-y-4">
            <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Costo por Gramo</span>
              <div className="text-4xl font-black text-ari-vermilion font-mono">
                $ {estimatedCost.toFixed(2)}
              </div>
            </div>

            <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Costo Total del Lote ({watchedYield || 0}g)</span>
              <div className="text-4xl font-black text-white font-mono">
                $ {(estimatedCost * (watchedYield || 0)).toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
