import { useState } from 'react';
import { 
  TableCellsIcon, 
  ChartBarIcon, 
  TrashIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function DataStats({ data, onViewTable, onDelete, fileName }) {
  const [showStats, setShowStats] = useState(false);

  const calculateStats = (columnData) => {
    const numbers = columnData.filter(val => !isNaN(val) && val !== null && val !== '');
    const allValues = columnData.filter(val => val !== null && val !== '');
    
    const stats = {
      tipo: typeof columnData[0],
      total: columnData.length,
      faltantes: columnData.filter(val => val === null || val === '').length,
    };

    if (numbers.length > 0) {
      stats.maximo = Math.max(...numbers);
      stats.minimo = Math.min(...numbers);
      stats.media = numbers.reduce((a, b) => a + Number(b), 0) / numbers.length;
      
      const mean = stats.media;
      stats.desviacion = Math.sqrt(
        numbers.reduce((a, b) => a + Math.pow(Number(b) - mean, 2), 0) / numbers.length
      );
    } else {
      // Para datos no numéricos
      const frequencies = {};
      allValues.forEach(val => {
        frequencies[val] = (frequencies[val] || 0) + 1;
      });
      stats.moda = Object.entries(frequencies)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
    }

    return stats;
  };

  const getColumnStats = () => {
    const stats = {};
    if (data && data.length > 0) {
      Object.keys(data[0]).forEach(column => {
        const columnData = data.map(row => row[column]);
        stats[column] = calculateStats(columnData);
      });
    }
    return stats;
  };

  const downloadCSV = () => {
    // Obtener los headers
    const headers = Object.keys(data[0]);
    
    // Convertir los datos a formato CSV
    const csvContent = [
      headers.join(','), // Headers
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Manejar valores especiales
        if (value === null || value === undefined) return '';
        // Escapar comas y comillas en los valores
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(','))
    ].join('\n');

    // Crear el blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const columnStats = getColumnStats();

  return (
    <div className="bg-white rounded-lg shadow-soft p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary-900">{fileName}</h3>
        <div className="flex space-x-2">
          <button
            onClick={onViewTable}
            className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-150"
            title="Ver tabla"
          >
            <TableCellsIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-150"
            title="Ver estadísticas"
          >
            <ChartBarIcon className="h-5 w-5" />
          </button>
          <button
            onClick={downloadCSV}
            className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-150"
            title="Descargar CSV"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-secondary-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
            title="Eliminar datos"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showStats && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Columna</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Faltantes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Máximo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Mínimo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Media</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Desviación</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(columnStats).map(([column, stats]) => (
                <tr key={column} className="hover:bg-secondary-50">
                  <td className="px-4 py-3 text-sm text-secondary-900">{column}</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">{stats.tipo}</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">{stats.total}</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">{stats.faltantes}</td>
                  <td className="px-4 py-3 text-sm text-secondary-900">
                    {stats.maximo !== undefined ? stats.maximo.toFixed(2) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary-900">
                    {stats.minimo !== undefined ? stats.minimo.toFixed(2) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary-900">
                    {stats.media !== undefined ? stats.media.toFixed(2) : stats.moda || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary-900">
                    {stats.desviacion !== undefined ? stats.desviacion.toFixed(2) : '-'}
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
