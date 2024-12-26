import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Welcome from './pages/Welcome'
import DataAnalysis from './pages/DataAnalysis'
import Dashboard from './pages/Dashboard'
import Diagrams from './pages/Diagrams'
import DefectRegistry from './pages/DefectRegistry'
import Reports from './pages/Reports'
import SixSigmaCalculator from './pages/SixSigmaCalculator'
import { ThemeProvider } from './context/ThemeContext'
import { DataProvider } from './context/DataContext'
import { FormProvider } from './context/FormContext'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <ThemeProvider>
        <DataProvider>
          <FormProvider>
            <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-150">
              {/* Mobile menu button */}
              <div className="lg:hidden fixed top-0 left-0 p-4 z-50">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg text-secondary-500 hover:bg-white dark:hover:bg-secondary-800 hover:text-secondary-600 dark:hover:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-150 ease-in-out shadow-soft"
                >
                  <span className="sr-only">Abrir menú</span>
                  {!sidebarOpen ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Sidebar for mobile */}
              <div className={`lg:hidden fixed inset-0 z-40 ${sidebarOpen ? '' : 'hidden'}`}>
                {/* Overlay */}
                <div 
                  className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm transition-opacity"
                  onClick={() => setSidebarOpen(false)}
                />

                {/* Sidebar */}
                <div className="fixed inset-y-0 left-0 w-64 flex">
                  <Sidebar />
                </div>
              </div>

              {/* Sidebar for desktop */}
              <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72">
                <Sidebar />
              </div>

              {/* Main content */}
              <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
                <main className="flex-1 py-6">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-soft p-6">
                      <Routes>
                        <Route path="/" element={<Welcome />} />
                        <Route path="/analysis" element={<DataAnalysis />} />
                        <Route path="/calculator" element={<SixSigmaCalculator />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/diagrams" element={<Diagrams />} />
                        <Route path="/defects" element={<DefectRegistry />} />
                        <Route path="/reports" element={<Reports />} />
                      </Routes>
                    </div>
                  </div>
                </main>
                
                {/* Footer */}
                <footer className="bg-white dark:bg-secondary-800 border-t border-gray-200 dark:border-secondary-700">
                  <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-secondary-500 dark:text-secondary-400">
                      Six Sigma Tools {new Date().getFullYear()} - Desarrollado por DairXP para la mejora continua
                    </p>
                  </div>
                </footer>
              </div>
            </div>
          </FormProvider>
        </DataProvider>
      </ThemeProvider>
    </Router>
  );
}
