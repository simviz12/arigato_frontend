import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';
import { useInventoryAlerts } from '../providers/WebSocketProvider';

export function AlertBell() {
  const { alerts, unreadCount, markAllRead, clearAlerts } = useInventoryAlerts();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleOpen = () => {
    setOpen(prev => !prev);
    if (!open) markAllRead(); // Mark as read when opening
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-ari-mist hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        title="Alertas de Inventario"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-ari-vermilion text-white text-[10px] font-extrabold animate-pulse shadow-lg shadow-ari-vermilion/50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-ari-indigo border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell size={14} className="text-ari-vermilion" />
              Alertas de Inventario
            </h3>
            <div className="flex gap-1">
              {alerts.length > 0 && (
                <>
                  <button
                    onClick={markAllRead}
                    className="p-1.5 text-ari-mist hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck size={14} />
                  </button>
                  <button
                    onClick={clearAlerts}
                    className="p-1.5 text-ari-mist hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                    title="Borrar todas"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-ari-mist hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Alert List */}
          <div className="max-h-72 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-ari-mist">
                <Bell size={28} className="opacity-40" />
                <p className="text-xs font-semibold opacity-60">Sin alertas recientes</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`px-4 py-3 border-b border-white/5 last:border-0 transition-colors ${!alert.read ? 'bg-ari-vermilion/10' : ''}`}
                >
                  <p className="text-xs text-white/90 leading-relaxed">{alert.message}</p>
                  <span className="text-[10px] text-ari-mist mt-1 block">
                    {alert.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
