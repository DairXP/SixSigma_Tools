import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import DataStats from '../components/DataStats';
import CleanDataModal from '../components/CleanDataModal';

export default function DataAnalysis() {
  const [datasets, setDatasets] = useState([]);
  const [currentViewData, setCurrentViewData] = useState(null);
  const [isCleanModalOpen, setIsCleanModalOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const newDataset = {
            name: file.name,
            data: results.data,
            headers: results.meta.fields || Object.keys(results.data[0])
          };
          setDatasets(prev => [...prev, newDataset]);
        },
        header: true,
        dynamicTyping: true,
      });
    }
  };

  const handleCleanData = (method) => {
    if (!selectedDataset) return;

    const cleanData = (data) => {
      if (method === 'remove') {
        // Eliminar filas con valores faltantes
        return data.filter(row => 
          Object.values(row).every(value => value !== null && value !== '')
        );
      } else {
        // Calcular media/moda para cada columna
        const stats = {};
        Object.keys(data[0]).forEach(column => {
          const values = data.map(row => row[column]).filter(val => val !== null && val !== '');
          if (typeof values[0] === 'number') {
            // Calcular media para números
            stats[column] = values.reduce((a, b) => a + b, 0) / values.length;
          } else {
            // Calcular moda para strings
            const frequencies = {};
            values.forEach(val => {
              frequencies[val] = (frequencies[val] || 0) + 1;
            });
            stats[column] = Object.entries(frequencies)
              .sort((a, b) => b[1] - a[1])[0]?.[0];
          }
        });

        // Rellenar valores faltantes
        return data.map(row => {
          const newRow = { ...row };
          Object.keys(newRow).forEach(column => {
            if (newRow[column] === null || newRow[column] === '') {
              newRow[column] = stats[column];
            }
          });
          return newRow;
        });
      }
    };

    const cleanedData = cleanData(selectedDataset.data);
    const newDataset = {
      name: selectedDataset.name.replace('.csv', '_limpio.csv'),
      data: cleanedData,
      headers: selectedDataset.headers
    };

    setDatasets(prev => [...prev, newDataset]);
    setIsCleanModalOpen(false);
    setSelectedDataset(null);
  };

  const handleDelete = useCallback((index) => {
    setDatasets(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-secondary-900">Análisis de Datos</h2>
        <div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="fileUpload"
          />
          <label
            htmlFor="fileUpload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
          >
            Cargar Archivo CSV
          </label>
        </div>
      </div>

      {/* Lista de datasets */}
      <div className="space-y-4">
        {datasets.map((dataset, index) => (
          <DataStats
            key={`${dataset.name}-${index}`}
            data={dataset.data}
            fileName={dataset.name}
            onViewTable={() => setCurrentViewData(dataset)}
            onDelete={() => handleDelete(index)}
          />
        ))}
      </div>

      {/* Modal de vista de tabla */}
      {currentViewData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-secondary-900/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-secondary-900">
                  {currentViewData.name}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedDataset(currentViewData);
                      setIsCleanModalOpen(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Limpiar Datos
                  </button>
                  <button
                    onClick={() => setCurrentViewData(null)}
                    className="text-secondary-500 hover:text-secondary-600"
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      {currentViewData.headers.map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentViewData.data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-secondary-50">
                        {currentViewData.headers.map((header) => (
                          <td
                            key={`${rowIndex}-${header}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900"
                          >
                            {row[header]?.toString() || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de limpieza */}
      <CleanDataModal
        isOpen={isCleanModalOpen}
        onClose={() => {
          setIsCleanModalOpen(false);
          setSelectedDataset(null);
        }}
        onClean={handleCleanData}
      />
    </div>
  );
}
