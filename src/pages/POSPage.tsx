import React, { useState } from 'react';
import { useCartStore, DiscountType } from '../store/useCartStore';
import { PaymentPanel } from '../components/PaymentPanel';
import { ReceiptModal } from '../components/ReceiptModal';
import { useDoubleClick } from '../utils/useDoubleClick';
import { Search, Plus, Minus, Trash2, ShoppingCart, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axios';

import { useQuery } from '@tanstack/react-query';

function ProductCard({ product }: { product: any }) {
  const addItem = useCartStore(state => state.addItem);
  const handleInteraction = useDoubleClick(() => addItem(product));

  return (
    <div 
      className="bg-white border border-ari-line rounded-xl p-4 shadow-sm hover:shadow-md hover:border-ari-indigo/30 transition-all cursor-pointer active:scale-95 select-none"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <div className="font-bold text-lg leading-tight text-ari-indigo">{product.name}</div>
      <div className="text-xs font-semibold uppercase tracking-widest text-ari-ash mt-1">{product.category}</div>
      <div className="text-xl font-extrabold text-ari-vermilion mt-3">
        ${product.price.toLocaleString('es-CO')}
      </div>
    </div>
  );
}

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Receipt Data State
  const [receiptData, setReceiptData] = useState<any | null>(null);

  const { data: finalProducts = [] } = useQuery({
    queryKey: ['final-products-pos'],
    queryFn: async () => {
      const res = await api.get('/api/products/final');
      return res.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.sellingPricePesos,
        category: p.category
      }));
    }
  });

  const cartLines = useCartStore(state => state.lines);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const clearCart = useCartStore(state => state.clearCart);
  
  const discountType = useCartStore(state => state.discountType);
  const discountValue = useCartStore(state => state.discountValue);
  const setDiscount = useCartStore(state => state.setDiscount);
  
  const getSubtotal = useCartStore(state => state.getSubtotal);
  const getDiscountAmount = useCartStore(state => state.getDiscountAmount);
  const getFinalTotal = useCartStore(state => state.getFinalTotal);

  const filteredProducts = finalProducts.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompleteSale = async (paymentData: any) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        paymentMethod: paymentData.method,
        discountPesos: getDiscountAmount(),
        lines: cartLines.map(line => ({
          finalProductId: line.productId.length > 10 ? line.productId : '00000000-0000-0000-0000-000000000000',
          quantity: line.quantity
        }))
      };

      const response = await api.post('/api/sales', payload);
      
      setReceiptData({
        saleId: response.data.saleId,
        lines: [...cartLines],
        subtotal: getSubtotal(),
        discountType,
        discountValue,
        discountAmount: getDiscountAmount(),
        total: getFinalTotal(),
        paymentMethod: paymentData.method,
        cashReceived: paymentData.received || paymentData.cash,
        nequiReceived: paymentData.nequi,
        changeOwed: paymentData.change || 0
      });
      
      clearCart();

    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrorMessage("⚠️ Alguien más acaba de vender el último inventario disponible de uno de los platos. Por favor, revisa el stock y vuelve a intentarlo.");
      } else {
        setErrorMessage("Error de conexión. Intente nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-6 p-6 relative bg-ari-cream/30">
      
      {/* LOADING BLOCKER OVERLAY */}
      {isSubmitting && (
        <div className="absolute inset-0 z-50 bg-ari-indigo/80 backdrop-blur-sm flex items-center justify-center flex-col animate-in fade-in">
          <div className="w-16 h-16 border-4 border-ari-vermilion border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <h2 className="mt-4 text-2xl font-heading font-bold text-white shadow-sm">Procesando Venta...</h2>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {receiptData && (
        <ReceiptModal 
          {...receiptData} 
          onClose={() => setReceiptData(null)} 
        />
      )}

      {/* LEFT PANE (Products) */}
      <div className="flex-[3] flex flex-col gap-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ari-mist" size={24} />
          <input 
            type="text" 
            placeholder="Buscar platos o categorías..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xl pl-14 pr-6 py-4 rounded-full border border-ari-line focus:outline-none focus:ring-4 focus:ring-ari-vermilion/30 focus:border-ari-vermilion shadow-sm transition-all"
          />
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
          {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>

      {/* RIGHT PANE: Cart Area */}
      <div className="flex-[2] min-w-[400px] flex flex-col bg-white rounded-2xl shadow-xl border border-ari-line overflow-hidden">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 text-red-800 p-4 border-b border-red-200 flex gap-3 items-center">
            <AlertCircle size={24} className="text-ari-vermilion shrink-0" />
            <span className="font-semibold text-sm">{errorMessage}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {cartLines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-ari-mist opacity-80">
              <ShoppingCart size={64} className="mb-4" />
              <p className="text-lg font-semibold m-0">El carrito está vacío</p>
              <p className="text-sm mt-1">Haz doble clic en los productos para agregarlos.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartLines.map(line => (
                <div key={line.productId} className="flex justify-between items-center pb-4 border-b border-ari-line last:border-0">
                  <div className="flex-1 pr-4">
                    <div className="font-bold text-ari-indigo leading-tight">{line.productName}</div>
                    <div className="text-ari-vermilion font-semibold mt-1">${line.unitPrice.toLocaleString('es-CO')}</div>
                  </div>
                  <div className="flex items-center gap-3 bg-ari-cream p-1.5 rounded-full border border-ari-line">
                    <button className="p-1.5 rounded-full bg-white shadow-sm text-ari-ash hover:text-ari-vermilion transition-colors active:scale-90" onClick={() => updateQuantity(line.productId, -1)}><Minus size={16} /></button>
                    <span className="font-bold w-6 text-center text-ari-indigo">{line.quantity}</span>
                    <button className="p-1.5 rounded-full bg-white shadow-sm text-ari-ash hover:text-green-600 transition-colors active:scale-90" onClick={() => updateQuantity(line.productId, 1)}><Plus size={16} /></button>
                    <button className="p-1.5 rounded-full bg-red-100 shadow-sm text-ari-vermilion hover:bg-red-600 hover:text-white transition-colors active:scale-90 ml-2" onClick={() => removeItem(line.productId)}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DISCOUNT & TOTALS SECTION */}
        <div className="p-6 bg-ari-cream/30 border-t border-ari-line">
          
          <div className="flex items-center gap-4 mb-6 bg-white p-3 rounded-xl border border-ari-line shadow-sm">
            <div className="p-2 bg-ari-cream rounded-full text-ari-mist"><Tag size={20} /></div>
            <select 
              value={discountType} 
              onChange={(e) => setDiscount(e.target.value as DiscountType, 0)}
              className="font-bold text-ari-indigo bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="NONE">Sin Descuento</option>
              <option value="PERCENTAGE">Descuento (%)</option>
              <option value="FIXED">Descuento ($)</option>
            </select>
            {discountType !== 'NONE' && (
              <input 
                type="number" 
                value={discountValue || ''}
                onChange={(e) => setDiscount(discountType, parseFloat(e.target.value) || 0)}
                placeholder={discountType === 'PERCENTAGE' ? 'Ej: 10' : 'Ej: 5000'}
                className="flex-1 text-right font-bold bg-ari-cream px-3 py-2 rounded-lg border border-transparent focus:border-ari-vermilion focus:bg-white transition-all outline-none"
              />
            )}
          </div>

          <div className="flex flex-col gap-2 mb-6 pb-6 border-b border-ari-line/50 border-dashed">
            <div className="flex justify-between text-ari-ash font-semibold text-lg">
              <span>Subtotal</span>
              <span>${getSubtotal().toLocaleString('es-CO')}</span>
            </div>
            {getDiscountAmount() > 0 && (
              <div className="flex justify-between text-orange-500 font-bold text-lg">
                <span>Descuento Aplicado</span>
                <span>- ${getDiscountAmount().toLocaleString('es-CO')}</span>
              </div>
            )}
            <div className="flex justify-between items-end mt-4">
              <span className="text-xl text-ari-mist font-bold">TOTAL VENTA</span>
              <span className="text-5xl font-extrabold text-ari-indigo font-heading tracking-tight leading-none">
                ${getFinalTotal().toLocaleString('es-CO')}
              </span>
            </div>
          </div>
          
          {cartLines.length > 0 && (
            <PaymentPanel totalAmount={getFinalTotal()} onCompleteSale={handleCompleteSale} />
          )}
        </div>

      </div>
    </div>
  );
}
