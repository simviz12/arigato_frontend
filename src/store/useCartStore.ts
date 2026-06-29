import { create } from 'zustand';

export interface CartLine {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export type DiscountType = 'NONE' | 'PERCENTAGE' | 'FIXED';

interface CartState {
  lines: CartLine[];
  discountType: DiscountType;
  discountValue: number;
  
  addItem: (product: { id: string, name: string, price: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  setDiscount: (type: DiscountType, value: number) => void;
  clearCart: () => void;
  
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  discountType: 'NONE',
  discountValue: 0,
  
  addItem: (product) => set((state) => {
    const existingLine = state.lines.find(l => l.productId === product.id);
    if (existingLine) {
      return {
        lines: state.lines.map(l => 
          l.productId === product.id 
            ? { ...l, quantity: l.quantity + 1 } 
            : l
        )
      };
    }
    return {
      lines: [...state.lines, { 
        productId: product.id, 
        productName: product.name, 
        unitPrice: product.price, 
        quantity: 1 
      }]
    };
  }),

  removeItem: (productId) => set((state) => ({
    lines: state.lines.filter(l => l.productId !== productId)
  })),

  updateQuantity: (productId, delta) => set((state) => ({
    lines: state.lines.map(l => {
      if (l.productId === productId) {
        const newQty = Math.max(1, l.quantity + delta);
        return { ...l, quantity: newQty };
      }
      return l;
    })
  })),

  setDiscount: (type, value) => set({ discountType: type, discountValue: value }),

  clearCart: () => set({ lines: [], discountType: 'NONE', discountValue: 0 }),

  getSubtotal: () => {
    const state = get();
    return state.lines.reduce((acc, line) => acc + (line.unitPrice * line.quantity), 0);
  },

  getDiscountAmount: () => {
    const state = get();
    const subtotal = state.getSubtotal();
    if (state.discountType === 'PERCENTAGE') {
      return Math.round(subtotal * (state.discountValue / 100));
    }
    if (state.discountType === 'FIXED') {
      return Math.min(subtotal, state.discountValue); // Never exceed subtotal
    }
    return 0;
  },

  getFinalTotal: () => {
    const state = get();
    return Math.max(0, state.getSubtotal() - state.getDiscountAmount());
  }
}));
