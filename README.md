# Arigato Inventory System - Frontend

Este es el cliente frontend del **Sistema de Inventario Arigato**, diseñado para brindar una experiencia de usuario fluida, moderna y reactiva para el control de restaurante, compras, recetas y POS.

## 🚀 Tecnologías Utilizadas
- **React 18**
- **TypeScript** (Tipado fuerte para mayor seguridad)
- **Vite** (Empaquetador ultrarrápido)
- **Tailwind CSS** (Diseño y estilos modernos)
- **Zustand** (Gestión de estado global ligero)
- **React Query** (Gestión de caché y peticiones asíncronas)
- **React Router Dom** (Navegación SPA)

## 🏗️ Estructura y Arquitectura del Frontend

El frontend está estructurado siguiendo un diseño modular basado en componentes, separando claramente las responsabilidades visuales de la lógica de negocio y las peticiones al servidor.

- `src/components/`: Componentes UI reutilizables (Botones, Modales, Inputs).
- `src/pages/`: Vistas completas que agrupan componentes (Ej: `POSPage.tsx`, `DistributorsPage.tsx`).
- `src/store/`: Estado global de la aplicación gestionado con Zustand (Ej: Carrito de compras, Autenticación).
- `src/api/`: Configuración de Axios y abstracción de las llamadas HTTP al backend.
- `src/hooks/`: Custom hooks de React para lógica reutilizable.
- `src/types/`: Definición de interfaces globales de TypeScript (DTOs del backend).

### ¿Por qué esta estructura es buena?
- **Desacoplamiento:** Las vistas (`pages`) no se preocupan de cómo se hace la petición HTTP, solo llaman a un hook o método.
- **Rendimiento:** Al usar *Vite* en lugar de CRA (Create React App) y *React Query* para cachear respuestas, la aplicación es extremadamente rápida y reduce la carga innecesaria hacia el backend.
- **Escalabilidad:** El uso intensivo de *TypeScript* previene errores en tiempo de ejecución al asegurar que los datos enviados y recibidos del backend tengan la estructura exacta.

## 🐳 Cómo Compilar y Correr en Docker

Al igual que el backend, el frontend está dockerizado para evitar problemas de dependencias en diferentes sistemas operativos.

1. Asegúrate de tener **Docker Desktop** iniciado.
2. Desde la carpeta raíz del proyecto (donde se ubica `docker-compose.yml`), ejecuta:

```bash
docker-compose up --build -d
```

### ¿Qué hace esto por detrás?
- Levanta un contenedor de **Node/Nginx** (`arigato-frontend-1`) en el puerto `5173`.
- Instala todas las dependencias y construye una versión optimizada de la aplicación.
- Mantiene la aplicación viva e intercepta automáticamente las peticiones hacia `/api` redirigiéndolas al backend de Spring Boot gracias al proxy configurado en Vite/Nginx.

Para acceder a la aplicación, simplemente abre tu navegador y visita:
👉 **http://localhost:5173**

## 🛠️ Ejecución Local (Sin Docker)
Si necesitas desarrollar y hacer cambios en caliente localmente:
1. Asegúrate de tener Node.js instalado.
2. Entra a la carpeta `frontend/`:
```bash
npm install
npm run dev
```
