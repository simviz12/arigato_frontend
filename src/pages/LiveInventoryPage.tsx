import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Activity, Search, Filter, Box } from 'lucide-react';
import { ProductMovementHistoryModal } from '../components/ProductMovementHistoryModal';

export default function LiveInventoryPage() {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<{id: string, name: string} | null>(null);

  // CQRS-Lite Query with 30s automated polling
  const { data: snapshot = [], isLoading } = useQuery({
    queryKey: ['daily-snapshot'],
    queryFn: async () => {
      const res = await api.get('/api/inventory/daily-snapshot');
      return res.data;
    },
    refetchInterval: 30000 // Real-time automated refresh every 30s
  });

  const getUnitSuffix = (type: string) => {
    if (type === 'PRIMARY_UNIT' || type === 'FINAL') return ' un';
    return ' g';
  };

  const getBadgeStyle = (type: string) => {
    switch(type) {
      case 'FINAL': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'SUBPRODUCT': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PRIMARY': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PRIMARY_UNIT': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredData = snapshot.filter((item: any) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || item.productType.includes(typeFilter);
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-ari-indigo flex items-center gap-3 mb-1">
            <Activity className="text-ari-vermilion" size={32} /> 
            Inventario en Vivo
          </h1>
          <p className="text-ari-mist">Métricas de inventario actualizadas matemáticamente cada 30s</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ari-mist" />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-12 pr-4 py-3 bg-white border border-ari-line rounded-full focus:outline-none focus:ring-2 focus:ring-ari-vermilion/30 focus:border-ari-vermilion transition-all shadow-sm"
            />
          </div>
          
          <div className="relative">
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)} 
              className="w-full sm:w-auto appearance-none bg-white border border-ari-line rounded-full px-6 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-ari-indigo/30 focus:border-ari-indigo text-ari-indigo font-bold shadow-sm cursor-pointer"
            >
              <option value="ALL">Todas las Categorías</option>
              <option value="FINAL">Platos (Menú)</option>
              <option value="PRIMARY">Materia Prima</option>
              <option value="SUBPRODUCT">Recetas / Lotes</option>
            </select>
            <Filter size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-ari-mist pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-ari-line overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ari-vermilion/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-ari-indigo/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="overflow-x-auto relative z-10 p-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-ari-mist border-b-2 border-ari-line">
                <th className="px-6 py-5 font-bold">Producto</th>
                <th className="px-6 py-5 font-bold">Categoría</th>
                <th className="px-6 py-5 font-bold text-right">Stock Inicial (Hoy)</th>
                <th className="px-6 py-5 font-bold text-right">Stock Actual</th>
                <th className="px-6 py-5 font-bold text-right">Consumido / Vendido</th>
                <th className="px-6 py-5 font-bold text-right">Ingreso Bruto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ari-line text-ari-ink">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-ari-mist gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ari-vermilion"></div>
                      <span className="font-semibold">Calculando matriz de inventario...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-ari-mist gap-3">
                      <Box size={32} className="opacity-50" />
                      <span className="font-semibold">No se encontraron productos con estos filtros.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item: any) => {
                  const badgeClass = getBadgeStyle(item.productType);
                  const suffix = getUnitSuffix(item.productType);
                  const isMenu = item.productType === 'FINAL';
                  
                  return (
                    <tr 
                      key={item.productId} 
                      className="hover:bg-ari-cream/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedProduct({ id: item.productId, name: item.productName })}
                    >
                      <td className="px-6 py-4 font-bold text-ari-indigo group-hover:text-ari-vermilion transition-colors text-lg">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${badgeClass}`}>
                          {item.productType === 'FINAL' ? 'PLATO' : item.productType === 'PRIMARY' || item.productType === 'PRIMARY_UNIT' ? 'MATERIA PRIMA' : 'SUBPRODUCTO'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-ari-ash">
                        {!isMenu ? `${item.startOfDayStock.toLocaleString()}${suffix}` : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-ari-ink text-lg">
                        {!isMenu ? `${item.currentStock.toLocaleString()}${suffix}` : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200">Bajo Demanda</span>}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono font-bold text-lg ${item.totalSoldToday > 0 ? 'text-ari-vermilion' : 'text-ari-ash'}`}>
                        {item.totalSoldToday > 0 ? '+' : ''}{item.totalSoldToday.toLocaleString()}{suffix}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono text-lg ${item.totalSoldTodayRevenue > 0 ? 'font-black text-green-600' : 'text-ari-ash'}`}>
                        {item.totalSoldTodayRevenue > 0 ? `$ ${item.totalSoldTodayRevenue.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProduct && (
        <ProductMovementHistoryModal 
          productId={selectedProduct.id} 
          productName={selectedProduct.name} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
