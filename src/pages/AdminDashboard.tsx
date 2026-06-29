import { useLogout } from '../hooks/useLogout';

export default function AdminDashboard() {
  const logout = useLogout();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Panel de Administración (SOLO ADMIN)</h1>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
