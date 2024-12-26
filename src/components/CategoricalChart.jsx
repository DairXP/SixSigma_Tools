import { Bar } from 'react-chartjs-2';

export default function CategoricalChart({ data, column }) {
  if (!data || !column) return null;

  // Procesar datos categóricos
  const frequencies = data.reduce((acc, row) => {
    const value = row[column];
    if (value !== undefined && value !== null && value !== '') {
      acc[value] = (acc[value] || 0) + 1;
    }
    return acc;
  }, {});

  // Ordenar por frecuencia descendente
  const sortedEntries = Object.entries(frequencies)
    .sort(([, a], [, b]) => b - a);

  const labels = sortedEntries.map(([category]) => category);
  const values = sortedEntries.map(([, count]) => count);

  // Calcular estadísticas
  const total = values.reduce((a, b) => a + b, 0);
  const percentages = values.map(v => ((v / total) * 100).toFixed(1));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Frecuencia',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
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
        text: `Distribución de ${column}`
      }
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

  return (
    <div className="space-y-4">
      {/* Tabla de frecuencias */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-secondary-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Frecuencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Porcentaje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-gray-700">
            {labels.map((category, index) => (
              <tr key={category}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {values[index]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {percentages[index]}%
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 dark:bg-secondary-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                {total}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Gráfico de barras */}
      <Bar data={chartData} options={options} />
    </div>
  );
}
