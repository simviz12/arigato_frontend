import React from 'react';
import { Package, Truck, LayoutGrid, GlassWater, Activity, ShoppingBag, Wallet, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navigation() {
  return (
    <nav className="w-64 bg-ari-indigo flex flex-col border-r border-ari-indigo/20 shadow-2xl relative z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 bg-black/20">
        <h2 className="text-2xl font-heading font-extrabold text-white tracking-wide">
          <span className="text-ari-vermilion">ARIGATO</span> ADMIN
        </h2>
        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest text-white/70 bg-white/10 uppercase">
          Portal Interno
        </div>
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
        <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-ari-mist hover:text-white hover:bg-white/5 transition-colors group">
          <Activity size={18} className="group-hover:text-ari-vermilion transition-colors" /> 
          <span className="font-medium text-sm">Panel de Control</span>
        </Link>

        <Link to="/admin/shopping-list" className="flex items-center gap-3 px-4 py-3 rounded-lg text-ari-mist hover:text-white hover:bg-white/5 transition-colors group">
          <ShoppingCart size={18} className="group-hover:text-ari-vermilion transition-colors" /> 
          <span className="font-medium text-sm">Lista de Compras</span>
        </Link>
        
        <Link to="/admin/pos" className="mt-2 mb-2 mx-2 flex items-center justify-center gap-2 bg-ari-vermilion text-white px-4 py-3 rounded-lg font-bold shadow-lg hover:bg-red-600 active:scale-95 transition-all btn-hanko">
          <ShoppingBag size={18} /> 
          <span>Punto de Venta</span>
        </Link>

        <Link to="/admin/cashier-summary" className="flex items-center gap-3 px-4 py-3 rounded-lg text-ari-mist hover:text-white hover:bg-white/5 transition-colors group">
          <Wallet size={18} className="group-hover:text-ari-vermilion transition-colors" /> 
          <span className="font-medium text-sm">Resumen de Caja</span>
        </Link>

        <Link to="/admin/live-inventory" className="flex items-center gap-3 px-4 py-3 rounded-lg text-ari-mist hover:text-white hover:bg-white/5 transition-colors group">
          <Activity size={18} className="group-hover:text-ari-vermilion transition-colors" /> 
          <span className="font-medium text-sm">Inventario en Vivo</span>
        </Link>

        <div className="mt-6 mb-2 px-4 text-xs font-bold tracking-wider text-white/30 uppercase">Cocina & Preparación</div>

        <Link to="/admin/recipes" className="flex items-center gap-3 px-4 py-3 rounded-lg text-ari-mist hover:text-white hover:bg-white/5 transition-colors group">
          <Package size={18} className="group-hover:text-ari-vermilion transition-colors" /> 
          <span className="font-medium text-sm">Recetas (Subproductos)</span>
        </Link>

        <Link to="/admin/batches" className="flex items-center gap-3 px-4 py-3 rounded-lg text-ari-mist hover:text-white hover:bg-white/5 transition-colors group">
          <Activity size={18} className="group-hover:text-ari-vermilion transition-colors" /> 
          <span className="font-medium text-sm">Lotes de Preparación</span>
        </Link>

        <div className="mt-6 mb-2 px-4 text-xs font-bold tracking-wider text-white/30 uppercase">Catálogo Final</div>

        <Link to="/admin/menu" className="flex items-center gap-3 px-4 py-3 rounded-lg text-ari-mist hover:text-white hover:bg-white/5 transition-colors group">
          <LayoutGrid size={18} className="group-hover:text-ari-vermilion transition-colors" /> 
          <span className="font-medium text-sm">Menú & Rentabilidad</span>
        </Link>

        <Link to="/admin/resale" className="flex items-center gap-3 px-4 py-3 rounded-lg text-ari-mist hover:text-white hover:bg-white/5 transition-colors group">
          <GlassWater size={18} className="group-hover:text-ari-vermilion transition-colors" /> 
          <span className="font-medium text-sm">Inv. Bebidas</span>
        </Link>

        <Link to="/admin/inventory" className="flex items-center gap-3 px-4 py-3 rounded-lg text-ari-mist hover:text-white hover:bg-white/5 transition-colors group">
          <Package size={18} className="group-hover:text-ari-vermilion transition-colors" /> 
          <span className="font-medium text-sm">Materia Prima</span>
        </Link>

        <Link to="/admin/distributors" className="flex items-center gap-3 px-4 py-3 rounded-lg text-ari-mist hover:text-white hover:bg-white/5 transition-colors group">
          <Truck size={18} className="group-hover:text-ari-vermilion transition-colors" /> 
          <span className="font-medium text-sm">Distribuidores</span>
        </Link>
      </div>

      {/* User Profile Area */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-ari-vermilion/20 border border-ari-vermilion/50 flex items-center justify-center text-ari-vermilion font-bold text-sm">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">Administrador</span>
            <span className="text-xs text-ari-mist">admin@arigato.com</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
