import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LayoutGrid, Plus, Utensils, AlertCircle } from 'lucide-react';

export default function MenuOverviewPage() {
  const navigate = useNavigate();

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['final-products-overview'],
    queryFn: async () => {
      const res = await api.get('/api/products/final');
      return res.data;
    }
  });

  if (isLoading) return (
    <div className="p-8 max-w-7xl mx-auto flex justify-center items-center h-64 text-ari-mist animate-pulse">
      <div className="text-xl font-semibold">Cargando Menú...</div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-ari-line">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-ari-indigo flex items-center gap-3">
            <LayoutGrid className="text-ari-vermilion" size={32} />
            Rentabilidad del Menú
          </h1>
          <p className="text-ari-mist mt-1">Análisis de costos y márgenes de ganancia de tus platos.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/menu/new')}
          className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg btn-hanko"
        >
          <Plus size={20} /> Construir Plato
        </button>
      </div>

      {menuItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-ari-line shadow-sm flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-ari-cream rounded-full flex items-center justify-center text-ari-vermilion mb-2">
            <Utensils size={48} />
          </div>
          <h2 className="text-2xl font-bold text-ari-indigo">Tu menú está vacío</h2>
          <p className="text-ari-mist max-w-md mx-auto">
            Aún no has creado ningún producto final. Construye un plato combinando tus materias primas y recetas para ver su rentabilidad.
          </p>
          <button 
            onClick={() => navigate('/admin/menu/new')}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-ari-vermilion rounded-full hover:bg-red-600 transition-all shadow-md btn-hanko"
          >
            <Plus size={18} /> Crear mi primer plato
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item: any) => {
            const isHealthy = item.marginPercentage >= 30;
            
            return (
              <div 
                key={item.id} 
                className="bg-white rounded-3xl shadow-sm border border-ari-line hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden cursor-pointer flex flex-col h-full"
              >
                {/* Image Placeholder */}
                <div className="h-40 bg-ari-cream/30 flex items-center justify-center text-ari-vermilion relative overflow-hidden group-hover:bg-ari-cream/50 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
                  <Utensils size={48} className="opacity-80 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-ari-indigo shadow-sm uppercase tracking-wider">
                    {item.category === 'MAIN_COURSE' ? 'Plato Fuerte' : item.category === 'STARTER' ? 'Entrada' : item.category === 'BEVERAGE' ? 'Bebida' : item.category === 'DESSERT' ? 'Postre' : 'General'}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-ari-indigo mb-4 line-clamp-2">{item.name}</h3>
                  
                  <div className="mt-auto flex justify-between items-end">
                    <div>
                      <div className="text-xs font-semibold text-ari-mist uppercase tracking-wide mb-1">Precio Venta</div>
                      <div className="text-2xl font-black text-ari-indigo">
                        $ {item.sellingPricePesos.toLocaleString()}
                      </div>
                    </div>

                    <div className={`px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-1.5 ${isHealthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isHealthy ? <span className="w-2 h-2 rounded-full bg-green-500"></span> : <AlertCircle size={14} />}
                      {item.marginPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
