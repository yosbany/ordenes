# Sistema de Gestión de Órdenes de Compra

Sistema web para la gestión de órdenes de compra, desarrollado con React, TypeScript, y Firebase.

## Características 
  
### Gestión de Proveedores
- Registro y mantenimiento de proveedores
- Información detallada: nombre comercial, razón social, RUT, teléfono
- Programación de días de pedido y entrega
- Integración con WhatsApp para comunicación directa

### Gestión de Productos
- Catálogo completo de productos por proveedor
- Sistema de ordenamiento por sectores
- Control de stock mínimo y deseado
- Gestión de empaques de compra y venta
- Sistema de códigos SKU

### Órdenes de Compra
- Creación y gestión de órdenes
- Organización automática de productos por sector
- Impresión de órdenes en formato térmico (80mm)
- Envío de órdenes por WhatsApp
- Historial completo de órdenes

### Dashboard
- Vista general del sistema
- Estadísticas de órdenes
- Productos más vendidos
- Recordatorios de pedidos y entregas
- Análisis de frecuencia de productos

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/usuario/ordenes-de-compra.git
   cd ordenes-de-compra
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Crear archivo `.env` en la raíz del proyecto
   - Agregar las siguientes variables con tus credenciales de Firebase:
     ```
     VITE_FIREBASE_API_KEY=tu_api_key
     VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
     VITE_FIREBASE_DATABASE_URL=tu_database_url
     VITE_FIREBASE_PROJECT_ID=tu_project_id
     VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
     VITE_FIREBASE_APP_ID=tu_app_id
     ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Despliegue

### GitHub Pages

1. Actualizar el campo `homepage` en `package.json`:
   ```json
   {
     "homepage": "https://usuario.github.io/ordenes-de-compra"
   }
   ```

2. Desplegar a GitHub Pages:
   ```bash
   npm run deploy
   ```

### Actualización

Para actualizar el sistema a la última versión:

1. Obtener los últimos cambios:
   ```bash
   git pull origin main
   ```

2. Instalar nuevas dependencias:
   ```bash
   npm install
   ```

3. Reconstruir y desplegar:
   ```bash
   npm run build
   npm run deploy
   ```

## Tecnologías Utilizadas

- React 18
- TypeScript
- Vite
- Firebase (Realtime Database)
- TailwindCSS
- React Router
- React Hot Toast
- Framer Motion
- Lucide Icons

## Estructura del Proyecto

```
src/
├── components/     # Componentes React
├── contexts/       # Contextos de React
├── hooks/         # Hooks personalizados
├── lib/           # Utilidades y servicios
├── pages/         # Páginas principales
└── types/         # Definiciones de TypeScript
```

## Contribución

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.