import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  PackageMinus, Activity, Calendar, BarChart3, Download
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const generateTimeSeries = (points: number) => {
  const data = [];
  let baseRevenue = 800000;
  for (let i = 0; i < points; i++) {
    const isWeekend = i % 7 === 5 || i % 7 === 6;
    const rev = baseRevenue * (isWeekend ? 1.5 : 1.0) * (0.8 + Math.random() * 0.4);
    const cost = rev * 0.35;
    const expense = 150000 + Math.random() * 50000;
    
    data.push({
      date: `2023-10-${(i+1).toString().padStart(2, '0')}`,
      ingresos: Math.round(rev),
      costo: Math.round(cost),
      gasto: Math.round(expense),
    });
  }
  return data;
};

const mockSummary = {
  ingresos: 24500000,
  costo: 8575000,
  gasto: 5200000,
  rentabilidad: 15925000,
  deltas: {
    ingresos: { val: 12.5, isUp: true },
    costo: { val: 4.2, isUp: true },
    gasto: { val: -2.1, isUp: false },
    rentabilidad: { val: 15.0, isUp: true }
  }
};

const mockDataMap = {
  dia: generateTimeSeries(24),
  semana: generateTimeSeries(7),
  mes: generateTimeSeries(30),
  ano: generateTimeSeries(12),
};

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<'dia'|'semana'|'mes'|'ano'>('mes');
  const data = mockDataMap[period];

  const renderDelta = (metric: string, delta: {val: number, isUp: boolean}) => {
    let colorClass = 'text-ari-ash';
    if (metric === 'ingresos' || metric === 'rentabilidad') {
      colorClass = delta.isUp ? 'text-green-600' : 'text-ari-vermilion';
    } else if (metric === 'costo' || metric === 'gasto') {
      colorClass = delta.isUp ? 'text-ari-vermilion' : 'text-green-600';
    }
    const Icon = delta.isUp ? TrendingUp : TrendingDown;
    return (
      <div className={`flex items-center gap-1 text-sm mt-2 font-bold ${colorClass}`}>
        <Icon size={16} />
        {delta.val}% vs periodo anterior
      </div>
    );
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto animate-fade-in">
      
      {/* HEADER & CONTROLS */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-extrabold text-ari-indigo flex items-center gap-3 m-0">
          <Activity className="text-ari-vermilion" size={32} />
          Dashboard Financiero
        </h1>

        <div className="flex gap-4 items-center">
          <div className="bg-white rounded-full p-1 shadow-sm border border-ari-line flex gap-1">
            {['dia', 'semana', 'mes', 'ano'].map(p => (
              <button
                key={p}
                className={`px-4 py-2 rounded-full font-semibold text-sm capitalize transition-all ${
                  period === p 
                    ? 'bg-ari-indigo text-white shadow-md' 
                    : 'text-ari-mist hover:text-ari-indigo hover:bg-ari-cream/50'
                }`}
                onClick={() => setPeriod(p as any)}
              >
                {p}
              </button>
            ))}
          </div>

          <button className="p-2.5 rounded-full border border-ari-line text-ari-mist hover:text-ari-vermilion hover:border-ari-vermilion transition-colors bg-white shadow-sm" title="Exportar Reporte">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS (The Big 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* INGRESOS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-ari-line border-t-4 border-t-green-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-ari-mist text-xs uppercase tracking-widest font-bold">Ingresos Totales</div>
              <div className="font-heading text-4xl font-extrabold mt-2 text-ari-indigo tracking-tight">
                ${mockSummary.ingresos.toLocaleString('es-CO')}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
          {renderDelta('ingresos', mockSummary.deltas.ingresos)}
        </div>

        {/* COSTO (COGS) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-ari-line border-t-4 border-t-ari-vermilion hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-ari-mist text-xs uppercase tracking-widest font-bold">Costo (Materia Prima)</div>
              <div className="font-heading text-4xl font-extrabold mt-2 text-ari-indigo tracking-tight">
                ${mockSummary.costo.toLocaleString('es-CO')}
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <ShoppingCart className="text-ari-vermilion" size={24} />
            </div>
          </div>
          {renderDelta('costo', mockSummary.deltas.costo)}
        </div>

        {/* GASTO (Purchases) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-ari-line border-t-4 border-t-orange-400 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-ari-mist text-xs uppercase tracking-widest font-bold">Gasto (Compras Extra)</div>
              <div className="font-heading text-4xl font-extrabold mt-2 text-ari-indigo tracking-tight">
                ${mockSummary.gasto.toLocaleString('es-CO')}
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <PackageMinus className="text-orange-500" size={24} />
            </div>
          </div>
          {renderDelta('gasto', mockSummary.deltas.gasto)}
        </div>

        {/* RENTABILIDAD */}
        <div className={`p-6 rounded-xl shadow-sm border border-ari-line border-t-4 hover:shadow-md transition-shadow ${mockSummary.rentabilidad >= 0 ? 'bg-green-50/50 border-t-green-500' : 'bg-red-50/50 border-t-ari-vermilion'}`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-ari-ash text-xs uppercase tracking-widest font-bold">Rentabilidad Bruta</div>
              <div className={`font-heading text-4xl font-extrabold mt-2 tracking-tight ${mockSummary.rentabilidad >= 0 ? 'text-green-600' : 'text-ari-vermilion'}`}>
                ${mockSummary.rentabilidad.toLocaleString('es-CO')}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${mockSummary.rentabilidad >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <BarChart3 className={mockSummary.rentabilidad >= 0 ? 'text-green-600' : 'text-ari-vermilion'} size={24} />
            </div>
          </div>
          {renderDelta('rentabilidad', mockSummary.deltas.rentabilidad)}
        </div>

      </div>

      {/* TRAFFIC LIGHT ALERTS (SEMAFORO) */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-ari-line mb-8">
        <h2 className="text-xl font-heading font-bold text-ari-indigo mb-6 flex items-center gap-2 m-0">
          <Activity size={20} className="text-ari-vermilion animate-pulse" /> 
          Semáforo de Inventario (Alertas)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* RED ALERT: Critical */}
          <div className="bg-red-50 p-5 rounded-xl border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full bg-ari-vermilion animate-pulse shadow-[0_0_8px_rgba(230,57,70,0.8)]"></div>
              <h3 className="font-bold text-red-800 m-0 text-sm uppercase tracking-wider">Crítico (Sin Stock)</h3>
            </div>
            <ul className="space-y-3 m-0 p-0 list-none">
              <li className="flex justify-between items-center text-sm bg-white p-2 rounded shadow-sm">
                <span className="font-semibold text-ari-indigo">Carne Molida Premium</span>
                <span className="text-ari-vermilion font-bold text-xs bg-red-100 px-2 py-0.5 rounded">0g</span>
              </li>
              <li className="flex justify-between items-center text-sm bg-white p-2 rounded shadow-sm">
                <span className="font-semibold text-ari-indigo">Queso Cheddar</span>
                <span className="text-ari-vermilion font-bold text-xs bg-red-100 px-2 py-0.5 rounded">0g</span>
              </li>
            </ul>
          </div>

          {/* YELLOW ALERT: Warning */}
          <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
              <h3 className="font-bold text-yellow-800 m-0 text-sm uppercase tracking-wider">Advertencia (Bajo)</h3>
            </div>
            <ul className="space-y-3 m-0 p-0 list-none">
              <li className="flex justify-between items-center text-sm bg-white p-2 rounded shadow-sm">
                <span className="font-semibold text-ari-indigo">Tomate Chonto</span>
                <span className="text-yellow-600 font-bold text-xs bg-yellow-100 px-2 py-0.5 rounded">800g / 2kg</span>
              </li>
              <li className="flex justify-between items-center text-sm bg-white p-2 rounded shadow-sm">
                <span className="font-semibold text-ari-indigo">Cerveza Asahi</span>
                <span className="text-yellow-600 font-bold text-xs bg-yellow-100 px-2 py-0.5 rounded">5 unds</span>
              </li>
            </ul>
          </div>

          {/* GREEN ALERT: Healthy */}
          <div className="bg-green-50 p-5 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
              <h3 className="font-bold text-green-800 m-0 text-sm uppercase tracking-wider">Saludable</h3>
            </div>
            <div className="flex flex-col items-center justify-center h-full pb-8">
              <span className="text-green-600 font-bold text-3xl">42</span>
              <span className="text-green-700/70 text-sm font-medium mt-1">Ingredientes con stock óptimo</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHART AREA */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-ari-line h-[500px]">
        <h2 className="text-xl font-heading font-bold text-ari-indigo mb-6 flex items-center gap-2 m-0">
          <Calendar size={20} className="text-ari-vermilion" /> 
          Tendencia de {period === 'dia' ? 'Hoy' : period === 'semana' ? 'Esta Semana' : period === 'mes' ? 'Este Mes' : 'Este Año'}
        </h2>
        
        <ResponsiveContainer width="100%" height="90%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd6" vertical={false} />
            <XAxis dataKey="date" stroke="#6b6b6b" tick={{ fill: '#3d3d3d' }} />
            <YAxis stroke="#6b6b6b" tick={{ fill: '#3d3d3d' }} tickFormatter={(val) => `$${val/1000}k`} />
            <Tooltip 
              contentStyle={{ background: '#faf9f7', border: '1px solid #e2ddd6', borderRadius: '8px', color: '#1a1a1a', fontFamily: 'Inter' }}
              itemStyle={{ fontWeight: 'bold' }}
              formatter={(value: number) => [`$${value.toLocaleString('es-CO')}`, '']}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            <Bar dataKey="costo" name="Costo (Materia Prima)" stackId="a" fill="#fdecea" stroke="#e63946" strokeWidth={1} radius={[0, 0, 4, 4]} />
            <Bar dataKey="gasto" name="Gasto (Compras)" stackId="a" fill="#ffedd5" stroke="#f97316" strokeWidth={1} radius={[4, 4, 0, 0]} />
            
            <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#16a34a" strokeWidth={4} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
