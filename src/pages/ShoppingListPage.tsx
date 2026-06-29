import React, { useState } from 'react';
import { ShoppingCart, AlertTriangle, Download, FileText, Check, Square, CheckSquare } from 'lucide-react';
import api from '../api/axios';

const MOCK_LOW_STOCK_LIST = [
  { productId: '1', productName: 'Carne Molida Premium', category: 'Carnes', currentStock: 2500, minStock: 5000, distributorId: 'd1', distributorName: 'Carnicería El Buen Corte', costPerGram: 25.5 },
  { productId: '2', productName: 'Tomate Chonto', category: 'Vegetales', currentStock: 800, minStock: 2000, distributorId: 'd2', distributorName: 'Verduras La Finca', costPerGram: 4.2 },
  { productId: '3', productName: 'Queso Cheddar', category: 'Lácteos', currentStock: 1500, minStock: 3000, distributorId: 'NONE', distributorName: 'Sin proveedor registrado', costPerGram: 0 }
];

export default function ShoppingListPage() {
  const [list, setList] = useState(MOCK_LOW_STOCK_LIST);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(MOCK_LOW_STOCK_LIST.map(i => i.productId)));
  const [isExporting, setIsExporting] = useState(false);

  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickPurchase = (item: any) => {
    setSelectedItem(item);
    setPurchaseModalOpen(true);
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === list.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(list.map(i => i.productId)));
  };

  const handleDownloadPDF = async () => {
    if (selectedIds.size === 0) return;
    setIsExporting(true);
    try {
      const productIds = Array.from(selectedIds);
      const response = await api.post('/api/analytics/best-distributors/export-pdf-custom', productIds, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lista-compras-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading PDF", error);
      alert("Error al descargar PDF. Validar backend.");
    } finally {
      setIsExporting(false);
    }
  };

  const submitPurchase = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setList(prev => prev.filter(i => i.productId !== selectedItem.productId));
      setIsSubmitting(false);
      setPurchaseModalOpen(false);
      setSelectedItem(null);
      setPurchaseAmount('');
    }, 800);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-ari-indigo flex items-center gap-3">
            <ShoppingCart className="text-ari-vermilion" size={32} />
            Lista de Compras (Faltantes)
          </h1>
          <p className="text-ari-mist mt-1">Ingredientes por debajo de su Alerta de Stock Mínimo</p>
        </div>
        <button 
          onClick={handleDownloadPDF} 
          disabled={selectedIds.size === 0 || isExporting}
          className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-ari-indigo rounded-full hover:bg-ari-indigo/90 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:active:scale-100"
        >
          {isExporting ? 'Generando PDF...' : <><Download size={18} /> Exportar Selección ({selectedIds.size})</>}
        </button>
      </div>

      <div className="bg-red-50 border-l-4 border-ari-vermilion p-4 rounded-r shadow-sm">
        <p className="flex items-center gap-2 text-red-800 font-semibold m-0">
          <AlertTriangle size={20} className="text-ari-vermilion" /> 
          Atención: Asegúrate de reabastecer estos ingredientes para no detener la cocina.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-ari-line overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-ari-cream/30 text-ari-mist uppercase text-xs tracking-wider border-b border-ari-line">
              <th className="p-4 w-12 cursor-pointer hover:bg-ari-cream/50 transition-colors" onClick={toggleAll}>
                {selectedIds.size === list.length && list.length > 0 ? <CheckSquare className="text-ari-indigo" /> : <Square />}
              </th>
              <th className="p-4 font-semibold">Ingrediente</th>
              <th className="p-4 font-semibold">Stock Actual / Mínimo</th>
              <th className="p-4 font-semibold">Mejor Proveedor</th>
              <th className="p-4 font-semibold">Precio Sug.</th>
              <th className="p-4 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ari-line text-ari-ink">
            {list.map(item => (
              <tr key={item.productId} className={`transition-colors ${selectedIds.has(item.productId) ? 'bg-ari-indigo/5' : 'hover:bg-ari-cream/10'}`}>
                <td className="p-4 cursor-pointer" onClick={() => toggleSelection(item.productId)}>
                  {selectedIds.has(item.productId) ? <CheckSquare className="text-ari-indigo" /> : <Square className="text-ari-mist" />}
                </td>
                <td className="p-4 font-bold text-lg">{item.productName}</td>
                <td className="p-4">
                  <span className="text-ari-vermilion font-semibold bg-red-50 px-2 py-1 rounded border border-red-100">
                    {item.currentStock}g
                  </span>
                  <span className="text-ari-mist mx-1">/</span>
                  <span className="text-ari-ash font-medium">{item.minStock}g</span>
                </td>
                <td className="p-4">
                  {item.distributorId === 'NONE' ? (
                    <span className="text-ari-vermilion font-bold text-sm bg-red-50 px-2 py-1 rounded">
                      {item.distributorName}
                    </span>
                  ) : (
                    <span className="font-medium">{item.distributorName}</span>
                  )}
                </td>
                <td className="p-4 text-ari-mist font-mono font-medium">
                  {item.costPerGram > 0 ? `$${item.costPerGram}/g` : '-'}
                </td>
                <td className="p-4 text-right">
                  {item.distributorId !== 'NONE' && (
                    <button 
                      onClick={() => handleQuickPurchase(item)}
                      className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-md btn-hanko"
                    >
                      Comprar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-green-700 bg-green-50/30">
                  <Check size={48} className="mx-auto mb-3 opacity-80" />
                  <span className="text-xl font-bold">¡Todo en orden!</span>
                  <p className="mt-1 text-green-600/80">El inventario está por encima del nivel mínimo.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* QUICK PURCHASE MODAL */}
      {purchaseModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-ari-indigo/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-ari-line relative">
            <h2 className="text-xl font-heading font-bold text-ari-indigo mb-6 flex items-center gap-2">
              <FileText className="text-ari-vermilion" /> Registrar Compra Rápida
            </h2>
            
            <div className="mb-6 p-4 bg-ari-cream/30 rounded-lg border border-ari-line">
              <div className="text-xs font-bold text-ari-mist uppercase tracking-widest mb-1">Proveedor (Sugerido)</div>
              <div className="font-bold text-lg text-ari-indigo mb-3">{selectedItem.distributorName}</div>
              
              <div className="text-xs font-bold text-ari-mist uppercase tracking-widest mb-1">Ingrediente a ingresar</div>
              <div className="font-bold text-lg text-ari-indigo">{selectedItem.productName}</div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-ari-ash mb-2">Cantidad Comprada (Gramos):</label>
              <input 
                type="number" 
                value={purchaseAmount} 
                onChange={e => setPurchaseAmount(e.target.value)}
                placeholder="Ej: 5000"
                className="w-full border border-ari-line rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-ari-vermilion/50 focus:border-ari-vermilion font-mono"
              />
            </div>

            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 font-semibold text-ari-ash border border-ari-line rounded-full hover:bg-ari-cream transition-colors" 
                onClick={() => setPurchaseModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                className="flex-1 py-3 font-semibold text-white bg-ari-vermilion rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg btn-hanko disabled:opacity-50 disabled:active:scale-100" 
                onClick={submitPurchase} 
                disabled={isSubmitting || !purchaseAmount}
              >
                {isSubmitting ? 'Procesando...' : 'Guardar Factura'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
