import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isStamping, setIsStamping] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStamping(true);
    
    // Simulate the stamp animation duration before making the request
    setTimeout(async () => {
      try {
        const response = await api.post('/api/auth/login', { username, password });
        const { accessToken } = response.data;
        const decoded = jwtDecode<DecodedToken>(accessToken);
        setAuth(accessToken, decoded.role);
        
        if (decoded.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/pos');
        }
      } catch (err: any) {
        setError('Usuario o contraseña incorrectos');
      } finally {
        setIsStamping(false);
      }
    }, 400); // 400ms matches the hankoStamp CSS animation
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle at center, var(--accent), var(--sidebar))',
      color: 'var(--paper)'
    }}>
      <div className="card-solid" style={{ 
        width: '400px', 
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--line)',
        boxShadow: 'none',
        color: 'var(--ink)'
      }}>
        <h1 className="title-large" style={{ textAlign: 'center', marginBottom: '2rem' }}>Arigato</h1>
        
        {error && <div className="bg-danger-soft text-danger" style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '2px', fontSize: '0.9rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--ash)', fontSize: '0.9rem', fontWeight: 600 }}>Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin o cashier1"
              required
            />
          </div>
          <div className="mb-4">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--ash)', fontSize: '0.9rem', fontWeight: 600 }}>Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            className={`btn btn-hanko ${isStamping ? 'stamping' : ''}`}
            style={{ width: '100%', fontSize: '1.1rem' }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
