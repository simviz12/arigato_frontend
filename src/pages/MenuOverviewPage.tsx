import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LayoutGrid, Plus, Utensils } from 'lucide-react';

export default function MenuOverviewPage() {
  const navigate = useNavigate();

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['final-products-overview'],
    queryFn: async () => {
      const res = await api.get('/api/products/final');
      return res.data;
    }
  });

  if (isLoading) return <div style={{ padding: '2rem' }}>Cargando Menú...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
          <LayoutGrid className="text-accent" /> Rentabilidad del Menú
        </h1>
        <button onClick={() => navigate('/admin/menu/new')}>
          <Plus size={16} /> Construir Plato
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '2rem' 
      }}>
        {menuItems.map((item: any) => {
          const isHealthy = item.marginPercentage >= 30;
          
          return (
            <div key={item.id} className="glass-panel" style={{ 
              overflow: 'hidden',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
            >
              {/* Image Placeholder */}
              <div style={{ 
                height: '160px', 
                background: 'linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.1)'
              }}>
                <Utensils size={48} />
              </div>

              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>{item.name}</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Precio Venta</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                      $ {item.sellingPricePesos.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: isHealthy ? 'rgba(var(--success-rgb, 0,255,0), 0.15)' : 'rgba(var(--error-rgb, 255,0,0), 0.15)',
                    color: isHealthy ? 'var(--success)' : 'var(--error)'
                  }}>
                    {item.marginPercentage.toFixed(1)}% Margen
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
