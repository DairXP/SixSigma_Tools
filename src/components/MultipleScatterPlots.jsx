import { useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function MultipleScatterPlots({ data }) {
  const [selectedX, setSelectedX] = useState('');
  const [selectedY, setSelectedY] = useState('');
  const [showAllPlots, setShowAllPlots] = useState(false);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center text-secondary-500 dark:text-secondary-400 py-8">
        No hay datos disponibles para generar gráficos de dispersión.
      </div>
    );
  }

  // Obtener columnas numéricas
  const numericColumns = Object.keys(data[0] || {}).filter(column => {
    const values = data.map(row => row[column]);
    return values.some(v => {
      if (v === null || v === undefined || v === '') return false;
      const parsed = parseFloat(v);
      return !isNaN(parsed);
    });
  });

  // Si no hay columnas seleccionadas y hay columnas disponibles, seleccionar las primeras dos
  if ((!selectedX || !selectedY) && numericColumns.length >= 2) {
    if (!selectedX) setSelectedX(numericColumns[0]);
    if (!selectedY) setSelectedY(numericColumns[1]);
  }

  // Función para calcular el coeficiente de correlación
  const calculateCorrelation = (xValues, yValues) => {
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
    const sumX2 = xValues.reduce((a, b) => a + b * b, 0);
    const sumY2 = yValues.reduce((a, b) => a + b * b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : (numerator / denominator).toFixed(3);
  };

  // Función para generar un gráfico de dispersión
  const generateScatterPlot = (xColumn, yColumn) => {
    const validPairs = data.reduce((acc, row) => {
      const x = parseFloat(row[xColumn]);
      const y = parseFloat(row[yColumn]);
      if (!isNaN(x) && !isNaN(y)) {
        acc.push({ x, y });
      }
      return acc;
    }, []);

    if (validPairs.length === 0) return null;

    const xValues = validPairs.map(pair => pair.x);
    const yValues = validPairs.map(pair => pair.y);
    const correlation = calculateCorrelation(xValues, yValues);

    const chartData = {
      datasets: [
        {
          label: `${xColumn} vs ${yColumn}`,
          data: validPairs,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          pointRadius: 5,
          pointHoverRadius: 7,
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: `${xColumn} vs ${yColumn} (r = ${correlation})`
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const point = context.raw;
              return `${xColumn}: ${point.x.toFixed(2)}, ${yColumn}: ${point.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: xColumn
          }
        },
        y: {
          title: {
            display: true,
            text: yColumn
          }
        }
      }
    };

    return { chartData, options };
  };

  // Generar todos los gráficos de dispersión posibles
  const generateAllScatterPlots = () => {
    const plots = [];
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const plot = generateScatterPlot(numericColumns[i], numericColumns[j]);
        if (plot) plots.push(plot);
      }
    }
    return plots;
  };

  const allPlots = showAllPlots ? generateAllScatterPlots() : [];
  const selectedPlot = selectedX && selectedY ? generateScatterPlot(selectedX, selectedY) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        {/* Controles de selección */}
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-secondary-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Variable X:
            </label>
            <select
              value={selectedX}
              onChange={(e) => setSelectedX(e.target.value)}
              className="block w-48 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-800 dark:text-white"
            >
              {numericColumns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Variable Y:
            </label>
            <select
              value={selectedY}
              onChange={(e) => setSelectedY(e.target.value)}
              className="block w-48 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-800 dark:text-white"
            >
              {numericColumns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAllPlots(!showAllPlots)}
            className={`px-4 py-2 rounded-md ${
              showAllPlots
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-secondary-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            {showAllPlots ? 'Mostrar selección' : 'Mostrar todos'}
          </button>
        </div>

        {/* Información sobre correlación */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          El coeficiente de correlación (r) indica la fuerza y dirección de la relación lineal entre las variables:
          <ul className="list-disc list-inside mt-2">
            <li>r = 1: correlación positiva perfecta</li>
            <li>r = -1: correlación negativa perfecta</li>
            <li>r = 0: no hay correlación lineal</li>
          </ul>
        </div>
      </div>

      {/* Área de gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!showAllPlots && selectedPlot && (
          <div className="col-span-2 bg-white dark:bg-secondary-800 p-4 rounded-lg shadow">
            <Scatter data={selectedPlot.chartData} options={selectedPlot.options} />
          </div>
        )}
        
        {showAllPlots && allPlots.map((plot, index) => (
          <div key={index} className="bg-white dark:bg-secondary-800 p-4 rounded-lg shadow">
            <Scatter data={plot.chartData} options={plot.options} />
          </div>
        ))}
      </div>
    </div>
  );
}
