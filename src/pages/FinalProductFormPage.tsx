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

  const createMutation = useMutation({
    mutationFn: (data: FinalProductForm) => api.post('/api/products/final', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['final-products'] });
      navigate('/admin/menu');
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
          // Assuming subproducts API returns estimated cost per gram
          const sub = subproducts.find((s: any) => s.id === comp.subproductId);
          const costPerGram = sub?.currentCostPerGram || 0;
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
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '2rem' }}>
      <div style={{ flex: 2 }}>
        <button className="outline" onClick={() => navigate(-1)} style={{ marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Volver
        </button>

        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Utensils className="text-accent" /> Construir Plato (Producto Final)
        </h1>

        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="glass-panel" style={{ padding: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label>Nombre del Plato</label>
              <Controller name="name" control={control} render={({ field }) => (
                <input {...field} placeholder="Ej. Costillas BBQ" className={errors.name ? 'error' : ''} />
              )} />
              {errors.name && <span className="error-text">{errors.name.message}</span>}
            </div>
            <div>
              <label>Categoría</label>
              <Controller name="category" control={control} render={({ field }) => (
                <select {...field} className={errors.category ? 'error' : ''}>
                  <option value="GENERAL">General</option>
                  <option value="MAIN_COURSE">Plato Fuerte</option>
                  <option value="STARTER">Entrada</option>
                  <option value="DESSERT">Postre</option>
                </select>
              )} />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label>Precio de Venta al Público (COP)</label>
            <Controller name="sellingPricePesos" control={control} render={({ field }) => (
              <MoneyInput value={field.value} onChange={field.onChange} />
            )} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              El sistema no calculará esto por ti. Tú decides el precio final.
            </span>
          </div>

          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '2rem 0' }} />
          <h3>Receta (Componentes)</h3>

          {fields.map((field, index) => {
            const rowType = watch(`components.${index}.type`);
            return (
              <div key={field.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                
                <Controller name={`components.${index}.type`} control={control} render={({ field: typeField }) => (
                  <select {...typeField} style={{ width: '150px' }}>
                    <option value="PRIMARY">Materia Prima</option>
                    <option value="SUBPRODUCT">Subproducto (Receta)</option>
                  </select>
                )} />

                <div style={{ flex: 2 }}>
                  {rowType === 'PRIMARY' ? (
                    <Controller name={`components.${index}.primaryProductId`} control={control} render={({ field: pField }) => (
                      <select {...pField} value={pField.value || ''} onChange={(e) => { pField.onChange(e); control._formValues.components[index].subproductId = undefined; }}>
                        <option value="">Seleccionar materia prima...</option>
                        {primaryProducts.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    )} />
                  ) : (
                    <Controller name={`components.${index}.subproductId`} control={control} render={({ field: sField }) => (
                      <select {...sField} value={sField.value || ''} onChange={(e) => { sField.onChange(e); control._formValues.components[index].primaryProductId = undefined; }}>
                        <option value="">Seleccionar subproducto...</option>
                        {subproducts.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    )} />
                  )}
                </div>

                <div style={{ width: '150px' }}>
                  <Controller name={`components.${index}.quantityGrams`} control={control} render={({ field: qField }) => (
                    <WeightInput value={qField.value} onChange={qField.onChange} />
                  )} />
                </div>

                <button type="button" className="outline" onClick={() => remove(index)} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            );
          })}

          {errors.components?.root && <span className="error-text" style={{ display: 'block', marginBottom: '1rem' }}>{errors.components.root.message}</span>}

          <button type="button" className="outline" onClick={() => append({ type: 'PRIMARY', quantityGrams: 0 })} style={{ marginBottom: '2rem' }}>
            <Plus size={16} /> Agregar Componente
          </button>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={createMutation.isPending || fields.length === 0}>
              {createMutation.isPending ? 'Guardando...' : <><Save size={16} /> Publicar Plato</>}
            </button>
          </div>
        </form>
      </div>

      {/* Margin Dashboard Panel */}
      <div style={{ flex: 1 }}>
        <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
          <h3 style={{ marginTop: 0 }}>Rentabilidad del Plato</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Costo de Producción</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>$ {liveCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Precio de Venta</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>$ {watchedSellingPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>

            <div style={{ 
              padding: '1rem', 
              background: isHealthyMargin ? 'rgba(var(--success-rgb, 0,255,0), 0.1)' : 'rgba(var(--error-rgb, 255,0,0), 0.1)', 
              borderRadius: '8px',
              border: `1px solid ${isHealthyMargin ? 'var(--success)' : 'var(--error)'}`
            }}>
              <span style={{ fontSize: '0.85rem', color: isHealthyMargin ? 'var(--success)' : 'var(--error)' }}>
                Margen Bruto {isHealthyMargin ? '(Saludable)' : '(Peligro)'}
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: isHealthyMargin ? 'var(--success)' : 'var(--error)' }}>
                {marginPercentage.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Ganancia neta: $ {marginAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            
            {!isHealthyMargin && watchedSellingPrice > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--error)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>El margen sugerido por la industria es superior al 30%. Considera subir el precio o ajustar la receta.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
