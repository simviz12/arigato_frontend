import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

interface InventoryAlert {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface WebSocketContextValue {
  alerts: InventoryAlert[];
  unreadCount: number;
  markAllRead: () => void;
  clearAlerts: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  alerts: [],
  unreadCount: 0,
  markAllRead: () => {},
  clearAlerts: () => {},
});

export const useInventoryAlerts = () => useContext(WebSocketContext);

interface Props {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: Props) {
  const { role, accessToken } = useAuthStore();
  const clientRef = useRef<Client | null>(null);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  const clearAlerts = () => setAlerts([]);

  useEffect(() => {
    // Only connect if we are an ADMIN and have a valid token
    if (role !== 'ADMIN' || !accessToken) return;

    const client = new Client({
      // Use SockJS factory for the WebSocket connection
      webSocketFactory: () => new SockJS('/ws/alerts'),
      reconnectDelay: 5000, // Automatically reconnect after 5 seconds
      onConnect: () => {
        console.log('[WebSocket] Connected to inventory alerts channel');
        // Subscribe to the inventory alerts topic
        client.subscribe('/topic/inventory-alerts', (message: IMessage) => {
          try {
            const body = JSON.parse(message.body);
            const alertMessage: string = body.message || 'Alerta de inventario recibida';
            
            const newAlert: InventoryAlert = {
              id: crypto.randomUUID(),
              message: alertMessage,
              timestamp: new Date(),
              read: false,
            };

            // Persist alert in state for the notification panel
            setAlerts(prev => [newAlert, ...prev].slice(0, 50)); // Keep last 50 alerts

            // Show a highly visible Sonner toast with custom styling
            toast.error(alertMessage, {
              duration: 10000, // Keep for 10 seconds - important alert
              id: newAlert.id, // Prevent duplicates
              description: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
            });
          } catch (e) {
            console.error('[WebSocket] Error parsing alert message', e);
          }
        });
      },
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected from inventory alerts channel');
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      // Cleanup: deactivate WebSocket connection when admin logs out or role changes
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
        console.log('[WebSocket] Connection deactivated (cleanup)');
      }
    };
  }, [role, accessToken]);

  return (
    <WebSocketContext.Provider value={{ alerts, unreadCount, markAllRead, clearAlerts }}>
      {children}
    </WebSocketContext.Provider>
  );
}
