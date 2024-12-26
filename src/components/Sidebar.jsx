import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ChartBarIcon, 
  PresentationChartLineIcon, 
  ChartPieIcon, 
  ClipboardDocumentListIcon, 
  DocumentTextIcon,
  BellIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const navigation = [
  { name: 'Inicio', href: '/', icon: HomeIcon },
  { name: 'Análisis de Datos', href: '/analysis', icon: ChartBarIcon },
  { 
    name: 'Calculadora Six Sigma', 
    href: '/calculator', 
    icon: CalculatorIcon 
  },
  { name: 'Monitoreo Kpis', href: '/dashboard', icon: PresentationChartLineIcon },
  { name: 'Herramientas LSS', href: '/diagrams', icon: ChartPieIcon },
  { name: 'Registro de Defectos', href: '/defects', icon: ClipboardDocumentListIcon },
  { name: 'Reportes', href: '/reports', icon: DocumentTextIcon },
];

export default function Sidebar() {
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="h-full flex flex-col flex-grow bg-white dark:bg-secondary-800 border-r border-gray-200 dark:border-secondary-700 transition-colors duration-150">
      {/* Header del Sidebar */}
      <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-primary-600 dark:bg-primary-700">
        <div className="flex items-center space-x-2">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <h1 className="text-xl font-bold text-white">Six Sigma Tools</h1>
        </div>
        <button 
          onClick={toggleDarkMode}
          className="p-1 rounded-full text-primary-200 hover:text-white hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-150"
        >
          {darkMode ? (
            <SunIcon className="h-6 w-6" />
          ) : (
            <MoonIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Navegación Principal */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-secondary-800 pt-5 pb-4">
        <nav className="flex-1 px-3 space-y-2.5">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                  transition-all duration-200 ease-in-out
                  ${isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 shadow-sm' 
                    : 'text-secondary-600 dark:text-secondary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/25 hover:text-primary-600 dark:hover:text-primary-400'
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 flex-shrink-0 h-5 w-5
                    transition-colors duration-200
                    ${isActive
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-secondary-400 dark:text-secondary-500 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                    }
                  `}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1 h-5 rounded-full bg-primary-600 dark:bg-primary-400"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Perfil de Usuario */}
      <div className="flex-shrink-0 p-4 bg-white dark:bg-secondary-800 border-t border-gray-200 dark:border-secondary-700">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate">Usuario</p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">Six Sigma Expert</p>
          </div>
          <button className="flex-shrink-0 p-1.5 rounded-lg text-secondary-400 dark:text-secondary-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/25 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-150">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
