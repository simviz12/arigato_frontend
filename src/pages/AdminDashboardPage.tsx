import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, 
  PackageMinus, Activity, Calendar, BarChart3, Download, Truck
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<'dia'|'semana'|'mes'|'ano'>('mes');

  const getDates = React.useMemo(() => {
    const now = new Date();
    let from = new Date();
    let priorFrom = new Date();
    let priorTo = new Date();

    if (period === 'dia') {
      from.setHours(0,0,0,0);
      priorFrom.setDate(now.getDate() - 1);
      priorFrom.setHours(0,0,0,0);
      priorTo.setDate(now.getDate() - 1);
      priorTo.setHours(23,59,59,999);
      const chartFrom = new Date();
      chartFrom.setDate(now.getDate() - 7);
      chartFrom.setHours(0,0,0,0);
      return { 
        from: from.toISOString(), 
        to: now.toISOString(), 
        priorFrom: priorFrom.toISOString(), 
        priorTo: priorTo.toISOString(), 
        chartFrom: chartFrom.toISOString(), 
        chartTo: now.toISOString(), 
        granularity: 'day' 
      };
    } else if (period === 'semana') {
      from.setDate(now.getDate() - 7);
      from.setHours(0,0,0,0);
      priorFrom.setDate(now.getDate() - 14);
      priorFrom.setHours(0,0,0,0);
      priorTo.setDate(now.getDate() - 7);
      priorTo.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      return { 
        from: from.toISOString(), 
        to: now.toISOString(), 
        priorFrom: priorFrom.toISOString(), 
        priorTo: priorTo.toISOString(), 
        chartFrom: from.toISOString(), 
        chartTo: now.toISOString(), 
        granularity: 'day' 
      };
    } else if (period === 'mes') {
      from.setDate(now.getDate() - 30);
      from.setHours(0,0,0,0);
      priorFrom.setDate(now.getDate() - 60);
      priorFrom.setHours(0,0,0,0);
      priorTo.setDate(now.getDate() - 30);
      priorTo.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      return { 
        from: from.toISOString(), 
        to: now.toISOString(), 
        priorFrom: priorFrom.toISOString(), 
        priorTo: priorTo.toISOString(), 
        chartFrom: from.toISOString(), 
        chartTo: now.toISOString(), 
        granularity: 'day' 
      };
    } else {
      from.setMonth(now.getMonth() - 12);
      from.setHours(0,0,0,0);
      priorFrom.setMonth(now.getMonth() - 24);
      priorFrom.setHours(0,0,0,0);
      priorTo.setMonth(now.getMonth() - 12);
      priorTo.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      return { 
        from: from.toISOString(), 
        to: now.toISOString(), 
        priorFrom: priorFrom.toISOString(), 
        priorTo: priorTo.toISOString(), 
        chartFrom: from.toISOString(), 
        chartTo: now.toISOString(), 
        granularity: 'month' 
      };
    }
  }, [period]);

  const { data: currentSummary = { ingresos: 0, costo: 0, gasto: 0, rentabilidad: 0 } } = useQuery({
    queryKey: ['summary', getDates.from, getDates.to],
    queryFn: async () => {
      const res = await api.get(`/api/analytics/summary?from=${getDates.from}&to=${getDates.to}`);
      return res.data;
    }
  });

  const { data: priorSummary = { ingresos: 0, costo: 0, gasto: 0, rentabilidad: 0 } } = useQuery({
    queryKey: ['summary', getDates.priorFrom, getDates.priorTo],
    queryFn: async () => {
      const res = await api.get(`/api/analytics/summary?from=${getDates.priorFrom}&to=${getDates.priorTo}`);
      return res.data;
    }
  });

  const { data: timeseries = [] } = useQuery({
    queryKey: ['timeseries', getDates.chartFrom, getDates.chartTo, getDates.granularity],
    queryFn: async () => {
      const res = await api.get(`/api/analytics/timeseries?granularity=${getDates.granularity}&from=${getDates.chartFrom}&to=${getDates.chartTo}`);
      return res.data;
    }
  });

  const { data: snapshot = [] } = useQuery({
    queryKey: ['daily-snapshot'],
    queryFn: async () => {
      const res = await api.get('/api/inventory/daily-snapshot');
      return res.data;
    }
  });

  const { data: bestDistributors = [] } = useQuery({
    queryKey: ['best-distributors'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/best-distributors');
      return res.data;
    }
  });

  const calculateDelta = (curr: number, prior: number) => {
    if (prior === 0) {
      return { val: curr > 0 ? 100 : 0, isUp: curr >= 0 };
    }
    const val = ((curr - prior) / prior) * 100;
    return { val: Math.abs(Math.round(val * 10) / 10), isUp: val >= 0 };
  };

  const deltas = {
    ingresos: calculateDelta(currentSummary.ingresos, priorSummary.ingresos),
    costo: calculateDelta(currentSummary.costo, priorSummary.costo),
    gasto: calculateDelta(currentSummary.gasto, priorSummary.gasto),
    rentabilidad: calculateDelta(currentSummary.rentabilidad, priorSummary.rentabilidad)
  };

  const criticalAlerts = snapshot.filter((item: any) => item.productType === 'PRIMARY' && (item.currentStock || 0) === 0);
  const warningAlerts = snapshot.filter((item: any) => item.productType === 'PRIMARY' && (item.currentStock || 0) > 0 && (item.currentStock || 0) <= (item.minStock || 0));
  const healthyCount = snapshot.filter((item: any) => item.productType === 'PRIMARY' && (item.currentStock || 0) > (item.minStock || 0)).length;

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-ari-line border-t-4 border-t-green-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-ari-mist text-xs uppercase tracking-widest font-bold">Ingresos Totales</div>
              <div className="font-heading text-4xl font-extrabold mt-2 text-ari-indigo tracking-tight">
                ${Number(currentSummary.ingresos).toLocaleString('es-CO')}
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
          {renderDelta('ingresos', deltas.ingresos)}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-ari-line border-t-4 border-t-ari-vermilion hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-ari-mist text-xs uppercase tracking-widest font-bold">Costo (Materia Prima)</div>
              <div className="font-heading text-4xl font-extrabold mt-2 text-ari-indigo tracking-tight">
                ${Number(currentSummary.costo).toLocaleString('es-CO')}
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <ShoppingCart className="text-ari-vermilion" size={24} />
            </div>
          </div>
          {renderDelta('costo', deltas.costo)}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-ari-line border-t-4 border-t-orange-400 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-ari-mist text-xs uppercase tracking-widest font-bold">Gasto (Compras Extra)</div>
              <div className="font-heading text-4xl font-extrabold mt-2 text-ari-indigo tracking-tight">
                ${Number(currentSummary.gasto).toLocaleString('es-CO')}
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <PackageMinus className="text-orange-500" size={24} />
            </div>
          </div>
          {renderDelta('gasto', deltas.gasto)}
        </div>

        <div className={`p-6 rounded-xl shadow-sm border border-ari-line border-t-4 hover:shadow-md transition-shadow ${currentSummary.rentabilidad >= 0 ? 'bg-green-50/50 border-t-green-500' : 'bg-red-50/50 border-t-ari-vermilion'}`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-ari-ash text-xs uppercase tracking-widest font-bold">Rentabilidad Bruta</div>
              <div className={`font-heading text-4xl font-extrabold mt-2 tracking-tight ${currentSummary.rentabilidad >= 0 ? 'text-green-600' : 'text-ari-vermilion'}`}>
                ${Number(currentSummary.rentabilidad).toLocaleString('es-CO')}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${currentSummary.rentabilidad >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <BarChart3 className={currentSummary.rentabilidad >= 0 ? 'text-green-600' : 'text-ari-vermilion'} size={24} />
            </div>
          </div>
          {renderDelta('rentabilidad', deltas.rentabilidad)}
        </div>

      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-ari-line mb-8">
        <h2 className="text-xl font-heading font-bold text-ari-indigo mb-6 flex items-center gap-2 m-0">
          <Activity size={20} className="text-ari-vermilion animate-pulse" /> 
          Semáforo de Inventario (Alertas)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50 p-5 rounded-xl border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full bg-ari-vermilion animate-pulse shadow-[0_0_8px_rgba(230,57,70,0.8)]"></div>
              <h3 className="font-bold text-red-800 m-0 text-sm uppercase tracking-wider">Crítico (Sin Stock)</h3>
            </div>
            {criticalAlerts.length === 0 ? (
              <p className="text-sm font-semibold text-green-700 m-0 bg-white p-3 rounded border border-green-200">¡Ningún ingrediente agotado!</p>
            ) : (
              <ul className="space-y-3 m-0 p-0 list-none max-h-40 overflow-y-auto">
                {criticalAlerts.map((item: any) => (
                  <li key={item.productId} className="flex justify-between items-center text-sm bg-white p-2 rounded shadow-sm">
                    <span className="font-semibold text-ari-indigo">{item.productName}</span>
                    <span className="text-ari-vermilion font-bold text-xs bg-red-100 px-2 py-0.5 rounded">0g</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]"></div>
              <h3 className="font-bold text-yellow-800 m-0 text-sm uppercase tracking-wider">Advertencia (Bajo)</h3>
            </div>
            {warningAlerts.length === 0 ? (
              <p className="text-sm font-semibold text-green-700 m-0 bg-white p-3 rounded border border-green-200">Todo el stock está en niveles óptimos.</p>
            ) : (
              <ul className="space-y-3 m-0 p-0 list-none max-h-40 overflow-y-auto">
                {warningAlerts.map((item: any) => (
                  <li key={item.productId} className="flex justify-between items-center text-sm bg-white p-2 rounded shadow-sm">
                    <span className="font-semibold text-ari-indigo">{item.productName}</span>
                    <span className="text-yellow-600 font-bold text-xs bg-yellow-100 px-2 py-0.5 rounded">
                      {item.currentStock}g / {item.minStock}g
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-green-50 p-5 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
              <h3 className="font-bold text-green-800 m-0 text-sm uppercase tracking-wider">Saludable</h3>
            </div>
            <div className="flex flex-col items-center justify-center h-full pb-8">
              <span className="text-green-600 font-bold text-3xl">{healthyCount}</span>
              <span className="text-green-700/70 text-sm font-medium mt-1">Ingredientes con stock óptimo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-ari-line h-[500px]">
          <h2 className="text-xl font-heading font-bold text-ari-indigo mb-6 flex items-center gap-2 m-0">
            <Calendar size={20} className="text-ari-vermilion" /> 
            Tendencia de {period === 'dia' ? 'Hoy' : period === 'semana' ? 'Esta Semana' : period === 'mes' ? 'Este Mes' : 'Este Año'}
          </h2>
          
          <ResponsiveContainer width="100%" height="90%">
            <ComposedChart data={timeseries} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd6" vertical={false} />
              <XAxis dataKey="date" stroke="#6b6b6b" tick={{ fill: '#3d3d3d' }} />
              <YAxis stroke="#6b6b6b" tick={{ fill: '#3d3d3d' }} tickFormatter={(val) => `$${val/1000}k`} />
              <Tooltip 
                contentStyle={{ background: '#faf9f7', border: '1px solid #e2ddd6', borderRadius: '8px', color: '#1a1a1a', fontFamily: 'Inter' }}
                itemStyle={{ fontWeight: 'bold' }}
                formatter={(value: number) => [`$${value.toLocaleString('es-CO')}`, '']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              <Bar dataKey="costo" name="Costo (Materia Prima)" stackId="a" fill="#e63946" radius={[0, 0, 4, 4]} />
              <Bar dataKey="gasto" name="Gasto (Compras)" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
              
              <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#16a34a" strokeWidth={4} dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-1 bg-white p-8 rounded-xl shadow-sm border border-ari-line h-[500px] overflow-hidden flex flex-col">
          <h2 className="text-xl font-heading font-bold text-ari-indigo mb-6 flex items-center gap-2 m-0 shrink-0">
            <Truck size={20} className="text-ari-vermilion" /> 
            Ranking de Distribuidores
          </h2>
          <div className="overflow-y-auto pr-2 flex-grow">
            {bestDistributors.length === 0 ? (
              <div className="text-center text-ari-mist p-4 text-sm font-medium">No hay datos suficientes para el ranking.</div>
            ) : (
              <div className="space-y-4">
                {bestDistributors.map((dist: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-ari-indigo/10 text-ari-indigo flex items-center justify-center font-black text-lg">
                        #{i + 1}
                      </div>
                      <div>
                        <div className="font-bold text-ari-indigo text-sm uppercase tracking-wider">{dist.distributorName}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">{dist.productName}</div>
                      </div>
                    </div>
                    <div className="text-right bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                      <div className="font-bold text-green-700 text-sm font-mono">${dist.pricePerGram?.toFixed(2)}/g</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
