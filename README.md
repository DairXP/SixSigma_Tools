# Six Sigma Tools

Aplicación web para implementación de herramientas Lean Six Sigma, incluyendo análisis de datos, dashboards, registro de defectos y generación de reportes.

## Requisitos Previos

- Node.js (versión 16 o superior)
- npm (incluido con Node.js)

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/DairXP/SixSigma_Tools
   cd SixSigma_Tools
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abrir el navegador en:
   ```
   http://localhost:5173
   ```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Vista previa de la versión de producción
- `npm run lint`: Ejecuta el linter para verificar el código

## Tecnologías Principales

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Headless UI
- Hero Icons
- Papa Parse (para manejo de CSV)

## Estructura del Proyecto

```
six-sigma-tools/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── context/        # Contextos de React (tema, estado global)
│   ├── pages/          # Páginas principales
│   └── styles/         # Estilos y configuración de Tailwind
├── public/            # Archivos estáticos
└── package.json      # Dependencias y scripts
```

## Características

- Análisis de datos con estadísticas básicas
- Modo claro/oscuro
- Diseño responsivo
- Interfaz moderna y profesional
- Manejo de archivos CSV
- Limpieza y transformación de datos

## Notas de Desarrollo

- El proyecto usa Tailwind CSS para estilos
- La gestión de estado se hace con Context API de React
- Los datos se manejan en memoria (no se requiere backend)
