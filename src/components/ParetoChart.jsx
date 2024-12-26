import { useState } from 'react';
import { Bar } from 'react-chartjs-2';

export default function ParetoChart({ data }) {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [manualMode, setManualMode] = useState(!data || data.length === 0);
  const [manualData, setManualData] = useState([
    { category: '', count: '' }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newCount, setNewCount] = useState('');

  // Obtener columnas categóricas
  const categoricalColumns = data ? Object.keys(data[0] || {}).filter(column => {
    const values = data.map(row => row[column]);
    return values.some(v => isNaN(parseFloat(v)));
  }) : [];

  // Si no hay columna seleccionada y hay columnas disponibles, seleccionar la primera
  if (!manualMode && !selectedColumn && categoricalColumns.length > 0) {
    setSelectedColumn(categoricalColumns[0]);
  }

  // Función para manejar la adición de nuevos datos manuales
  const handleAddManualData = (e) => {
    e.preventDefault();
    if (newCategory && newCount) {
      setManualData([...manualData, { category: newCategory, count: parseInt(newCount) }]);
      setNewCategory('');
      setNewCount('');
      setShowAddForm(false);
    }
  };

  // Función para eliminar una entrada manual
  const handleDeleteManualData = (index) => {
    const newData = manualData.filter((_, i) => i !== index);
    setManualData(newData);
  };

  // Función para editar una entrada manual
  const handleEditManualData = (index, field, value) => {
    const newData = [...manualData];
    newData[index][field] = field === 'count' ? (value === '' ? '' : parseInt(value)) : value;
    setManualData(newData);
  };

  // Función para generar datos del diagrama de Pareto
  const generateParetoData = () => {
    let paretoData;
    
    if (manualMode) {
      // Usar datos manuales
      paretoData = manualData
        .filter(item => item.category && item.count)
        .map(item => ({
          category: item.category,
          count: parseInt(item.count)
        }))
        .sort((a, b) => b.count - a.count);
    } else {
      // Usar datos del CSV
      const frequencies = data.reduce((acc, row) => {
        const value = row[selectedColumn];
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});

      paretoData = Object.entries(frequencies)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
    }

    // Calcular porcentajes acumulados
    const total = paretoData.reduce((sum, item) => sum + item.count, 0);
    let accumulated = 0;
    return paretoData.map(item => {
      accumulated += item.count;
      return {
        ...item,
        percentage: (accumulated / total) * 100
      };
    });
  };

  // Generar datos para el gráfico
  const paretoData = (manualMode ? manualData.length > 0 : selectedColumn) ? generateParetoData() : [];

  const chartData = {
    labels: paretoData.map(item => item.category),
    datasets: [
      {
        type: 'bar',
        label: 'Frecuencia',
        data: paretoData.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Porcentaje Acumulado',
        data: paretoData.map(item => item.percentage),
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y1',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: manualMode ? 'Diagrama de Pareto - Datos Manuales' : `Diagrama de Pareto - ${selectedColumn}`
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;
            if (datasetLabel === 'Frecuencia') {
              return `Frecuencia: ${value}`;
            } else {
              return `Porcentaje acumulado: ${value.toFixed(1)}%`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Frecuencia'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Porcentaje Acumulado'
        },
        min: 0,
        max: 100,
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        {/* Controles */}
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-secondary-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Modo de datos:
            </label>
            <select
              value={manualMode ? 'manual' : 'csv'}
              onChange={(e) => setManualMode(e.target.value === 'manual')}
              className="block w-48 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-800 dark:text-white"
            >
              <option value="manual">Ingreso Manual</option>
              {data && data.length > 0 && <option value="csv">Datos CSV</option>}
            </select>
          </div>

          {!manualMode && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Variable a analizar:
              </label>
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="block w-48 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-800 dark:text-white"
              >
                {categoricalColumns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Ingreso manual de datos */}
        {manualMode && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-secondary-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Frecuencia
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {manualData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => handleEditManualData(index, 'category', e.target.value)}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-800 dark:text-white"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.count}
                          onChange={(e) => handleEditManualData(index, 'count', e.target.value)}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-800 dark:text-white"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteManualData(index)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showAddForm ? (
              <form onSubmit={handleAddManualData} className="flex items-end space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Frecuencia
                  </label>
                  <input
                    type="number"
                    value={newCount}
                    onChange={(e) => setNewCount(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-800 dark:text-white"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600"
                  >
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 dark:bg-secondary-600 dark:text-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600"
              >
                Agregar Categoría
              </button>
            )}
          </div>
        )}

        {/* Información sobre el diagrama de Pareto */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>El diagrama de Pareto muestra:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Frecuencia de cada categoría (barras)</li>
            <li>Porcentaje acumulado (línea)</li>
            <li>Ordenado de mayor a menor frecuencia</li>
            <li>Ayuda a identificar el 20% de las causas que generan el 80% de los efectos</li>
          </ul>
        </div>
      </div>

      {/* Gráfico */}
      {paretoData.length > 0 && (
        <div className="bg-white dark:bg-secondary-800 p-4 rounded-lg shadow">
          <Bar data={chartData} options={options} />
        </div>
      )}

      {/* Tabla de resultados */}
      {paretoData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-secondary-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categoría
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Frecuencia
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  % Acumulado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paretoData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
