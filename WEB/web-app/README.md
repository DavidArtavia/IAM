# Web App - Taller Automotriz con IA

Este proyecto es una aplicación web desarrollada como parte de una solución práctica, diseñada específicamente para talleres mecánicos automotrices. La aplicación utiliza inteligencia artificial para procesar mensajes de voz o texto, permitiendo a los usuarios interactuar con diversas funcionalidades de manera intuitiva y eficiente.

## Características principales

- **Gestión de clientes**: Crear, editar y eliminar información de clientes.
- **Gestión de Taller**: Administración de órdenes de servicio, asignación de tareas, seguimiento del progreso de reparaciones y manejo de transacciones relacionadas con las cuentas de los clientes.
- **Historial de servicios**: Registro detallado de reparaciones y mantenimientos realizados.
- **Interacción por IA**: Procesamiento de mensajes de voz o texto para agendar citas, consultar historial o solicitar servicios.
- **Notificaciones automáticas**: Recordatorios de mantenimiento y actualizaciones de estado del vehículo.
- **Experiencia mejorada**: Uso de inteligencia artificial para simplificar la gestión del taller.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalados los siguientes componentes:

- Node.js (v16 o superior)
- npm (v8 o superior)
- Base de datos: SQL Server (versión 2019 o superior)
- Git

## Instalación

Sigue estos pasos para configurar el proyecto en tu entorno local:

1. Clona el repositorio:
  ```bash
  git clone https://github.com/dannycantillano/IAM.git
  cd WEB
  cd web-app
  ```

2. Instala las dependencias:
  ```bash
  npm install
  ```

3. Configura las variables de entorno en un archivo `.env`:
  ```
  DATABASE_URL=tu_url_de_base_de_datos
  JWT_SECRET=tu_secreto_jwt
  PORT=3000
  ```

4. Inicia el servidor:
  ```bash
  npm run dev
  ```

5. Accede a la aplicación en tu navegador:
  ```
  http://localhost:5173/
  ```

## Guía de uso para desarrolladores

### Estructura del proyecto

La estructura del proyecto está organizada de la siguiente manera:

- `/public`: Contiene archivos estáticos como CSS, JavaScript o imágenes.

- `/src`: Contiene el código fuente de la aplicación.
  - `App.tsx`: Componente principal de la aplicación.
  - `index.css`: Estilos globales de la aplicación.
  - `main.tsx`: Punto de entrada principal de la aplicación.

  - `/api`: Contiene la configuración y funciones relacionadas con las llamadas a la API.
    - `api.tsx`: Archivo para gestionar las solicitudes a la API.

  - `/assets`: Recursos estáticos como imágenes.
    - `/img`: Carpeta de imágenes, por ejemplo, `TallerLogo.png`.

  - `/components`: Componentes reutilizables de la interfaz de usuario.
    - `/Layout`: Componentes relacionados con el diseño principal.
      - `LayoutMain.css`: Estilos del diseño principal.
      - `LayoutMain.tsx`: Componente del diseño principal.
    - `/Modals`: Componentes de modales.
      - `/LoadingModal`: Modal de carga.
        - `LoadingModal.tsx`: Componente del modal de carga.
    - `/Sidebar`: Componentes relacionados con la barra lateral.
      - `Sidebar.css`: Estilos de la barra lateral.
      - `Sidebar.tsx`: Componente de la barra lateral.
    - `/Statistics`: Componentes relacionados con estadísticas.
      - `Statistics.css`: Estilos de estadísticas.
      - `Statistics.tsx`: Componente de estadísticas.

  - `/constants`: Contiene constantes globales.
    - `routes.ts`: Definición de rutas de la aplicación.

  - `/context`: Proveedores de contexto para manejar estados globales.
    - `AuthContext.tsx`: Contexto de autenticación.
    - `NotificationContext.tsx`: Contexto de notificaciones.

  - `/hooks`: Contiene hooks personalizados.

  - `/routers`: Configuración de las rutas de la aplicación.
    - `AppRouter.tsx`: Configuración principal del enrutador.

  - `/screens`: Contiene las pantallas principales de la aplicación.
    - `/Home`: Pantalla de inicio.
      - `Home.tsx`: Componente de la pantalla de inicio.
    - `/Login`: Pantalla de inicio de sesión.
      - `Login.tsx`: Componente de la pantalla de inicio de sesión.

  - `/styles`: Archivos de estilos globales y específicos.

  - `/types`: Definición de tipos y modelos TypeScript.
    - `global.d.ts`: Tipos globales.
    - `IProps.tsx`: Interfaces de propiedades.

  - `/utils`: Funciones auxiliares y utilidades.
    - `RequireAuth.tsx`: Componente para proteger rutas que requieren autenticación.

### Scripts disponibles

### Scripts disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo utilizando Vite.
- `npm run build`: Compila el proyecto y genera los archivos para producción.
- `npm run lint`: Analiza el código en busca de errores de estilo utilizando ESLint.
- `npm run preview`: Sirve una vista previa de la aplicación en modo producción.


