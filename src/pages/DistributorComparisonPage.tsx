import React, { useState } from 'react';
import { Trophy, Download, Search, Truck } from 'lucide-react';
import api from '../api/axios';

const MOCK_COMPARISON_DATA = [
  {
    productName: "Carne Molida Premium",
    distributors: [
      { name: "Carnicería El Buen Corte", cost: 25.5, rank: 1, lastUpdated: "2026-06-25" },
      { name: "Frigorífico Central", cost: 28.0, rank: 2, lastUpdated: "2026-06-10" },
      { name: "Carnes Juan", cost: 31.2, rank: 3, lastUpdated: "2026-05-01" }
    ]
  },
  {
    productName: "Tomate Chonto",
    distributors: [
      { name: "Verduras La Finca", cost: 4.2, rank: 1, lastUpdated: "2026-06-27" },
      { name: "Abastos Regional", cost: 4.5, rank: 2, lastUpdated: "2026-06-26" }
    ]
  }
];

export default function DistributorComparisonPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const filteredData = MOCK_COMPARISON_DATA.filter(item => 
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadFullPDF = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/api/analytics/best-distributors/export-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ranking-completo-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading PDF", error);
      alert("Error al descargar PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
          <Truck color="var(--accent)" /> Ranking de Proveedores
        </h1>
        <button 
          className="primary" 
          onClick={handleDownloadFullPDF} 
          disabled={isExporting}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {isExporting ? 'Generando PDF...' : <><Download size={18} /> Descargar Catálogo Completo</>}
        </button>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
          <input 
            type="text" 
            placeholder="Buscar ingrediente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {filteredData.map((product, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--accent)' }}>{product.productName}</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Rango</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Proveedor</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Costo / Gramo</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Última Actualización</th>
                </tr>
              </thead>
              <tbody>
                {product.distributors.map(dist => {
                  const isWinner = dist.rank === 1;
                  return (
                    <tr key={dist.name} style={{ 
                      background: isWinner ? 'rgba(255, 215, 0, 0.05)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <td style={{ padding: '1rem' }}>
                        {isWinner ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 215, 0, 0.2)', color: '#ffd700', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 'bold' }}>
                            <Trophy size={16} /> #1
                          </div>
                        ) : (
                          <span style={{ padding: '0.2rem 0.6rem', color: '#888' }}>#{dist.rank}</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: isWinner ? 'bold' : 'normal', color: isWinner ? '#ffd700' : 'var(--text)' }}>
                        {dist.name}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>${dist.cost}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{dist.lastUpdated}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No se encontraron ingredientes con ese nombre.
          </div>
        )}
      </div>

    </div>
  );
}
