import React from 'react';
import { Package, Plus, ChefHat, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export default function SubproductsListPage() {
  const { data: subproducts = [], isLoading } = useQuery({
    queryKey: ['subproducts'],
    queryFn: async () => {
      const res = await api.get('/api/subproducts');
      return res.data;
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-ari-indigo flex items-center gap-3">
            <ChefHat className="text-ari-vermilion" size={32} />
            Recetas (Subproductos)
          </h1>
          <p className="text-ari-mist mt-1">Gestión de preparaciones intermedias y sus costos</p>
        </div>
        <Link 
          to="/admin/recipes/new"
          className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg btn-hanko"
        >
          <Plus size={18} /> Crear Nueva Receta
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-ari-line flex items-center gap-4">
          <div className="bg-ari-indigo/10 p-3 rounded-lg text-ari-indigo">
            <Package size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-ari-mist uppercase tracking-wider">Recetas Activas</div>
            <div className="text-2xl font-extrabold text-ari-indigo mt-1">{subproducts.length}</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-ari-line flex items-center gap-4">
          <div className="bg-ari-vermilion/10 p-3 rounded-lg text-ari-vermilion">
            <Scale size={24} />
          </div>
          <div>
            <div className="text-sm font-bold text-ari-mist uppercase tracking-wider">Costo Promedio</div>
            <div className="text-2xl font-extrabold text-ari-indigo mt-1">En vivo</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-ari-line overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-ari-mist font-bold">Cargando recetas...</div>
        ) : subproducts.length === 0 ? (
          <div className="p-8 text-center text-ari-mist font-bold">No hay recetas creadas aún. ¡Crea tu primera receta!</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ari-cream/30 text-ari-mist uppercase text-xs tracking-wider border-b border-ari-line">
                <th className="px-6 py-4 font-semibold">Nombre de Receta</th>
                <th className="px-6 py-4 font-semibold">Modo Preparación</th>
                <th className="px-6 py-4 font-semibold">Rendimiento (Lote)</th>
                <th className="px-6 py-4 font-semibold text-right">Costo por Gramo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ari-line text-ari-ink">
              {subproducts.map((item: any) => (
                <tr key={item.id} className="hover:bg-ari-cream/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-lg text-ari-indigo">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border border-ari-line bg-ari-cream/50 text-ari-ash">
                      {item.preparationMode === 'BATCH' ? 'Lote (Batch)' : 'Al Instante'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-ari-ash">{item.totalYield?.grams || 0}g</td>
                  <td className="px-6 py-4 text-right font-mono font-medium">
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                      {(() => {
                        if (item.costPerGram !== undefined && item.costPerGram !== null) return `$${Number(item.costPerGram).toFixed(2)}`;
                        let totalCost = 0;
                        if (item.recipe && Array.isArray(item.recipe)) {
                          totalCost = item.recipe.reduce((acc: number, ing: any) => {
                             const ingCost = ing.cost !== undefined ? ing.cost : (ing.calculatedCost !== undefined ? ing.calculatedCost : (ing.quantityGrams * (ing.primaryProduct?.costPerGram || 0)));
                             return acc + ingCost;
                          }, 0);
                        }
                        const yieldGrams = item.totalYield?.grams || item.totalYieldGrams || 1;
                        return `$${(totalCost / yieldGrams).toFixed(2)}`;
                      })()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
