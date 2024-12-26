import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import CategoricalChart from './CategoricalChart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MultipleHistograms({ data }) {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedType, setSelectedType] = useState('numeric'); // 'numeric' o 'categorical'

  // Verificar si data es un array y tiene elementos
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center text-secondary-500 dark:text-secondary-400 py-8">
        No hay datos disponibles para generar histogramas.
      </div>
    );
  }

  const generateHistogramData = (values) => {
    // Remover valores no numéricos y undefined/null
    const numericValues = values.filter(v => {
      const parsed = parseFloat(v);
      return !isNaN(parsed) && v !== null && v !== undefined && v !== '';
    }).map(v => parseFloat(v));
    
    if (numericValues.length === 0) return null;

    // Calcular estadísticas básicas
    const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    const sortedValues = [...numericValues].sort((a, b) => a - b);
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const median = sortedValues[Math.floor(sortedValues.length / 2)];
    
    // Calcular desviación estándar
    const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;
    const stdDev = Math.sqrt(variance);

    // Calcular el número de bins usando la regla de Sturges
    const n = numericValues.length;
    const numberOfBins = Math.ceil(1 + 3.322 * Math.log10(n));
    
    // Calcular el ancho de cada bin
    const binWidth = (max - min) / numberOfBins;
    
    // Inicializar bins
    const bins = Array(numberOfBins).fill(0);
    const binLabels = [];
    
    // Crear etiquetas para los bins
    for (let i = 0; i < numberOfBins; i++) {
      const start = min + (i * binWidth);
      const end = start + binWidth;
      binLabels.push(`${start.toFixed(2)}-${end.toFixed(2)}`);
    }
    
    // Llenar los bins
    numericValues.forEach(value => {
      const binIndex = Math.min(
        Math.floor((value - min) / binWidth),
        numberOfBins - 1
      );
      bins[binIndex]++;
    });

    return {
      data: {
        labels: binLabels,
        datasets: [{
          label: 'Frecuencia',
          data: bins,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      stats: {
        n,
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        min: min.toFixed(2),
        max: max.toFixed(2),
        stdDev: stdDev.toFixed(2)
      }
    };
  };

  // Obtener columnas numéricas y categóricas
  const columns = Object.keys(data[0] || {}).reduce((acc, column) => {
    const values = data.map(row => row[column]);
    const hasNumericValues = values.some(v => {
      if (v === null || v === undefined || v === '') return false;
      const parsed = parseFloat(v);
      return !isNaN(parsed);
    });

    if (hasNumericValues) {
      acc.numeric.push(column);
    } else {
      acc.categorical.push(column);
    }

    return acc;
  }, { numeric: [], categorical: [] });

  if (columns.numeric.length === 0 && columns.categorical.length === 0) {
    return (
      <div className="text-center text-secondary-500 dark:text-secondary-400 py-8">
        No se encontraron columnas válidas para analizar.
      </div>
    );
  }

  // Si no hay columna seleccionada, seleccionar la primera disponible
  if (!selectedColumn) {
    const firstAvailableColumn = selectedType === 'numeric' 
      ? columns.numeric[0] 
      : columns.categorical[0];
    
    if (firstAvailableColumn) {
      setSelectedColumn(firstAvailableColumn);
    } else if (selectedType === 'numeric' && columns.categorical.length > 0) {
      setSelectedType('categorical');
      setSelectedColumn(columns.categorical[0]);
    } else if (selectedType === 'categorical' && columns.numeric.length > 0) {
      setSelectedType('numeric');
      setSelectedColumn(columns.numeric[0]);
    }
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Frecuencia'
        }
      }
    }
  };

  // Generar datos del histograma solo para la columna seleccionada
  const histogramData = selectedType === 'numeric' ? 
    generateHistogramData(data.map(row => row[selectedColumn])) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 flex-wrap gap-4">
        {/* Selector de tipo de datos */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedType('numeric');
              setSelectedColumn(columns.numeric[0]);
            }}
            className={`px-3 py-1 rounded-md ${
              selectedType === 'numeric'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-secondary-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Numéricos
          </button>
          <button
            onClick={() => {
              setSelectedType('categorical');
              setSelectedColumn(columns.categorical[0]);
            }}
            className={`px-3 py-1 rounded-md ${
              selectedType === 'categorical'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-secondary-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Categóricos
          </button>
        </div>

        {/* Selector de columna */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Seleccionar columna:
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="mt-1 block w-64 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-800 dark:text-white"
          >
            {(selectedType === 'numeric' ? columns.numeric : columns.categorical).map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedType === 'numeric' && histogramData && (
        <div className="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-center dark:text-white">
            Histograma: {selectedColumn}
          </h3>
          
          {/* Estadísticas */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6 bg-gray-50 dark:bg-secondary-700 p-4 rounded-lg">
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400">N</span>
              <span className="text-lg font-semibold dark:text-white">{histogramData.stats.n}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400">Media</span>
              <span className="text-lg font-semibold dark:text-white">{histogramData.stats.mean}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400">Mediana</span>
              <span className="text-lg font-semibold dark:text-white">{histogramData.stats.median}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400">Mín</span>
              <span className="text-lg font-semibold dark:text-white">{histogramData.stats.min}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400">Máx</span>
              <span className="text-lg font-semibold dark:text-white">{histogramData.stats.max}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400">Desv. Est.</span>
              <span className="text-lg font-semibold dark:text-white">{histogramData.stats.stdDev}</span>
            </div>
          </div>

          <Bar
            data={histogramData.data}
            options={{
              ...options,
              plugins: {
                ...options.plugins,
                title: {
                  display: true,
                  text: `Distribución de ${selectedColumn}`
                }
              }
            }}
          />
        </div>
      )}

      {selectedType === 'categorical' && selectedColumn && (
        <div className="bg-white dark:bg-secondary-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-center dark:text-white">
            Análisis de {selectedColumn}
          </h3>
          <CategoricalChart data={data} column={selectedColumn} />
        </div>
      )}
    </div>
  );
}
