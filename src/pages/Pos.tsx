import { useLogout } from '../hooks/useLogout';
import { ShoppingBag, LogOut } from 'lucide-react';

export default function Pos() {
  const logout = useLogout();
  return (
    <div className="min-h-screen bg-ari-cream flex flex-col items-center justify-center animate-fade-in p-8">
      <div className="absolute top-0 left-0 w-96 h-96 bg-ari-vermilion/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      
      <div className="bg-white p-12 rounded-[2rem] shadow-2xl border border-ari-line text-center max-w-md w-full relative z-10">
        <div className="mx-auto w-20 h-20 bg-ari-vermilion/10 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-ari-vermilion" />
        </div>
        
        <h1 className="text-3xl font-heading font-extrabold text-ari-indigo mb-2">Terminal de Punto de Venta</h1>
        <p className="text-ari-mist mb-8">Esta pantalla está en construcción. Aquí el cajero registrará las órdenes de los clientes.</p>
        
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-4 font-bold text-white bg-ari-indigo rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
        >
          <LogOut size={20} /> Salir del Sistema
        </button>
      </div>
    </div>
  );
}
