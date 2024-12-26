import { useState } from 'react';
import { Line } from 'react-chartjs-2';

export default function MultipleControlCharts({ data }) {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [subgroupSize, setSubgroupSize] = useState(5);
  const [showAllCharts, setShowAllCharts] = useState(false);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center text-secondary-500 dark:text-secondary-400 py-8">
        No hay datos disponibles para generar gráficos de control.
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

  // Si no hay columna seleccionada y hay columnas disponibles, seleccionar la primera
  if (!selectedColumn && numericColumns.length > 0) {
    setSelectedColumn(numericColumns[0]);
  }

  // Función para calcular límites de control
  const calculateControlLimits = (values) => {
    // Dividir en subgrupos
    const subgroups = [];
    for (let i = 0; i < values.length; i += subgroupSize) {
      const subgroup = values.slice(i, i + subgroupSize);
      if (subgroup.length === subgroupSize) {
        subgroups.push(subgroup);
      }
    }

    // Calcular medias y rangos de subgrupos
    const subgroupStats = subgroups.map(subgroup => {
      const mean = subgroup.reduce((a, b) => a + b, 0) / subgroup.length;
      const range = Math.max(...subgroup) - Math.min(...subgroup);
      return { mean, range };
    });

    // Calcular constantes para límites de control
    const A2 = {
      2: 1.880, 3: 1.023, 4: 0.729, 5: 0.577, 6: 0.483,
      7: 0.419, 8: 0.373, 9: 0.337, 10: 0.308
    }[subgroupSize] || 0.577; // Default a n=5 si no está en la tabla

    const D3 = {
      2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
      7: 0.076, 8: 0.136, 9: 0.184, 10: 0.223
    }[subgroupSize] || 0;

    const D4 = {
      2: 3.267, 3: 2.575, 4: 2.282, 5: 2.115, 6: 2.004,
      7: 1.924, 8: 1.864, 9: 1.816, 10: 1.777
    }[subgroupSize] || 2.115;

    // Calcular línea central y límites
    const xbar = subgroupStats.reduce((acc, stat) => acc + stat.mean, 0) / subgroupStats.length;
    const rbar = subgroupStats.reduce((acc, stat) => acc + stat.range, 0) / subgroupStats.length;

    const ucl_x = xbar + A2 * rbar;
    const lcl_x = xbar - A2 * rbar;
    const ucl_r = D4 * rbar;
    const lcl_r = D3 * rbar;

    return {
      xbar_data: subgroupStats.map(stat => stat.mean),
      range_data: subgroupStats.map(stat => stat.range),
      centerLine_x: xbar,
      ucl_x,
      lcl_x,
      centerLine_r: rbar,
      ucl_r,
      lcl_r,
      subgroups: subgroups.length
    };
  };

  // Función para generar un gráfico de control
  const generateControlChart = (column) => {
    const values = data.map(row => parseFloat(row[column]))
                      .filter(v => !isNaN(v));
    
    if (values.length < subgroupSize) return null;

    const limits = calculateControlLimits(values);
    const labels = Array.from({ length: limits.subgroups }, (_, i) => `Subgrupo ${i + 1}`);

    const commonOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: false
        }
      }
    };

    const xbarChart = {
      data: {
        labels,
        datasets: [
          {
            label: 'Media',
            data: limits.xbar_data,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          },
          {
            label: 'UCL',
            data: Array(labels.length).fill(limits.ucl_x),
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderDash: [5, 5],
          },
          {
            label: 'LCL',
            data: Array(labels.length).fill(limits.lcl_x),
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderDash: [5, 5],
          },
          {
            label: 'CL',
            data: Array(labels.length).fill(limits.centerLine_x),
            borderColor: 'rgba(75, 192, 192, 0.8)',
            borderDash: [2, 2],
          }
        ]
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: {
            display: true,
            text: `Gráfico X̄ - ${column}`
          }
        }
      }
    };

    const rChart = {
      data: {
        labels,
        datasets: [
          {
            label: 'Rango',
            data: limits.range_data,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
          },
          {
            label: 'UCL',
            data: Array(labels.length).fill(limits.ucl_r),
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderDash: [5, 5],
          },
          {
            label: 'LCL',
            data: Array(labels.length).fill(limits.lcl_r),
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderDash: [5, 5],
          },
          {
            label: 'CL',
            data: Array(labels.length).fill(limits.centerLine_r),
            borderColor: 'rgba(75, 192, 192, 0.8)',
            borderDash: [2, 2],
          }
        ]
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: {
            display: true,
            text: `Gráfico R - ${column}`
          }
        }
      }
    };

    return { xbarChart, rChart };
  };

  // Generar todos los gráficos de control
  const generateAllControlCharts = () => {
    return numericColumns.map(column => ({
      column,
      charts: generateControlChart(column)
    })).filter(item => item.charts !== null);
  };

  const allCharts = showAllCharts ? generateAllControlCharts() : [];
  const selectedCharts = selectedColumn ? generateControlChart(selectedColumn) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        {/* Controles */}
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-secondary-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Variable:
            </label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
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
              Tamaño de subgrupo:
            </label>
            <select
              value={subgroupSize}
              onChange={(e) => setSubgroupSize(Number(e.target.value))}
              className="block w-24 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-800 dark:text-white"
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAllCharts(!showAllCharts)}
            className={`px-4 py-2 rounded-md ${
              showAllCharts
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-secondary-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            {showAllCharts ? 'Mostrar selección' : 'Mostrar todos'}
          </button>
        </div>

        {/* Información sobre gráficos de control */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Los gráficos de control muestran:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Gráfico X̄: Control de la media del proceso</li>
            <li>Gráfico R: Control de la variabilidad del proceso</li>
            <li>UCL/LCL: Límites superior e inferior de control (±3σ)</li>
            <li>CL: Línea central (media del proceso)</li>
          </ul>
        </div>
      </div>

      {/* Área de gráficos */}
      <div className="space-y-6">
        {!showAllCharts && selectedCharts && (
          <>
            <div className="bg-white dark:bg-secondary-800 p-4 rounded-lg shadow">
              <Line data={selectedCharts.xbarChart.data} options={selectedCharts.xbarChart.options} />
            </div>
            <div className="bg-white dark:bg-secondary-800 p-4 rounded-lg shadow">
              <Line data={selectedCharts.rChart.data} options={selectedCharts.rChart.options} />
            </div>
          </>
        )}
        
        {showAllCharts && allCharts.map((item, index) => (
          <div key={index} className="space-y-6">
            <div className="bg-white dark:bg-secondary-800 p-4 rounded-lg shadow">
              <Line data={item.charts.xbarChart.data} options={item.charts.xbarChart.options} />
            </div>
            <div className="bg-white dark:bg-secondary-800 p-4 rounded-lg shadow">
              <Line data={item.charts.rChart.data} options={item.charts.rChart.options} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
