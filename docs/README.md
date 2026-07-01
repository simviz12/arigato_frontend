# Frontend del Sistema Arigato

Este documento describe la arquitectura y las tecnologías utilizadas en el frontend.

## Tecnologías Principales
- **React + Vite**: Motor principal superrápido para el desarrollo y despliegue.
- **Tailwind CSS**: Utilizado para todo el sistema de diseño (*Glassmorphism*, diseño responsivo, paneles flotantes y efectos vibrantes).
- **Zustand**: Manejo de estado global ligero (Ej. `authStore` y `cartStore` para el punto de venta).
- **React Query (TanStack Query)**: Gestión avanzada de peticiones al servidor, caché, revalidación y sincronización en tiempo real.
- **React Hook Form + Zod**: Formularios potentes y validados con tipado estricto en el lado del cliente (ej. creación de platos y lotes).
- **Sonner**: Sistema de notificaciones (*Toasts*) globales.

## Manejo de Errores y Seguridad (Refresh Tokens)
Se implementó un Interceptor Global utilizando **Axios**:
- **401 (No autorizado):** Si un *Access Token* expira (15 min), el interceptor invoca silenciosamente a `/api/auth/refresh` enviando la cookie segura. Al recibir el nuevo token, reintenta la petición original. Esto asegura que el cajero en el POS o el administrador nunca pierdan su sesión de forma abrupta.
- **400 / 500 (Errores globales):** Si hay falta de stock u otro error validado desde el backend, el interceptor lanza un `Toast` visual rojo informando del problema exacto al usuario, evitando fallos silenciosos.

## Estructura de Rutas y Guards
Las rutas están protegidas por roles (`RoleGuard`). Además, se configuró una protección en el login para evitar que un usuario ya autenticado vuelva a esa pantalla si retrocede en el navegador, redirigiéndolo automáticamente a su panel correspondiente (Admin o Cajero).
