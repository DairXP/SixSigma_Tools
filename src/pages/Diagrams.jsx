import { useState, useRef } from 'react';
import { Bar, Line, Scatter } from 'react-chartjs-2';
import { useData } from '../context/DataContext';
import IshikawaDiagram from '../components/IshikawaDiagram';
import FiveWhysAnalysis from '../components/FiveWhysAnalysis';
import MultipleHistograms from '../components/MultipleHistograms';
import MultipleScatterPlots from '../components/MultipleScatterPlots';
import MultipleControlCharts from '../components/MultipleControlCharts';
import ParetoChart from '../components/ParetoChart';
import ProcessFlowDiagram from '../components/ProcessFlowDiagram';

export default function Diagrams() {
  const [activeTab, setActiveTab] = useState('process-flow');
  const fileInputRef = useRef(null);
  const { diagramData, loadDiagramData, updateIshikawaData } = useData();
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualData, setManualData] = useState({
    pareto: { defecto: '', frecuencia: '' },
    control: { muestra: '', valor: '', ucl: '', lcl: '' },
    scatter: { x: '', y: '' },
    histogram: { valor: '' },
    fishbone: { categoria: '', causa: '' }
  });

  const [processedData, setProcessedData] = useState([]);
  const [columnSelection, setColumnSelection] = useState({
    pareto: {
      category: '',
      value: ''
    },
    histogram: {
      value: ''
    }
  });

  const [availableColumns, setAvailableColumns] = useState({
    pareto: [],
    histogram: [],
    control: [],
    scatter: []
  });

  const [columnPreview, setColumnPreview] = useState({
    category: [],
    value: []
  });

  const validateColumn = (data, columnName, type) => {
    if (!columnName) return { isValid: true, message: '' };
    if (!Array.isArray(data)) return { isValid: true, message: '' };

    if (type === 'value') {
      // Verificar si la columna contiene valores numéricos
      const hasInvalidValues = data.some(row => {
        const value = row[columnName];
        return value && isNaN(parseFloat(value));
      });
      
      if (hasInvalidValues) {
        return {
          isValid: false,
          message: '⚠️ Esta columna contiene valores no numéricos'
        };
      }
    }

    return { isValid: true, message: '' };
  };

  const getColumnSuggestion = (columnName, type) => {
    const suggestions = {
      category: [
        'defecto', 'categoria', 'tipo', 'producto', 'error', 'causa', 'problema',
        'falla', 'descripcion', 'name', 'nombre', 'id', 'code', 'codigo',
        'item', 'parte', 'componente', 'area', 'proceso', 'maquina', 'material',
        'defecto_visual', 'artesano'
      ],
      value: [
        'frecuencia', 'cantidad', 'valor', 'total', 'count', 'numero',
        'costo', 'tiempo', 'duracion', 'peso', 'medida', 'conteo',
        'ocurrencias', 'repeticiones', 'veces', 'fallos', 'errores',
        'longitud', 'diametro', 'calidad', 'durabilidad'
      ]
    };

    const normalizedColumn = columnName.toLowerCase();
    if (suggestions[type].some(s => normalizedColumn.includes(s))) {
      return '(✓ Recomendado)';
    }
    return '';
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split('\n').map(row => row.trim()).filter(row => row);
        const headers = rows[0].split(',').map(h => h.trim());
        
        const data = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row) {
            const values = row.split(',').map(v => v.trim());
            const rowData = {};
            headers.forEach((header, index) => {
              rowData[header] = values[index];
            });
            data.push(rowData);
          }
        }
        
        console.log('Datos procesados:', data); // Para debugging
        setProcessedData(data);
        
        // Actualizar columnas disponibles
        setAvailableColumns({
          ...availableColumns,
          histogram: headers
        });
      };
      reader.readAsText(file);
    }
  };

  const updateColumnPreview = (field, columnName, data) => {
    if (!data || !Array.isArray(data) || !columnName) return;

    const uniqueValues = [...new Set(
      data
        .map(row => row[columnName])
        .filter(value => value && value.trim() !== '')
    )].slice(0, 5);

    setColumnPreview(prev => ({
      ...prev,
      [field]: uniqueValues
    }));
  };

  const handleColumnSelection = (type, field, value) => {
    setColumnSelection(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));

    // Actualizar preview
    updateColumnPreview(field, value, processedData);

    // Validar y actualizar el gráfico
    const validation = validateColumn(processedData, value, field);
    if (validation.isValid && columnSelection.pareto.category && columnSelection.pareto.value) {
      // Procesar datos para el gráfico de Pareto
      const paretoData = processParetoDiagramData(
        processedData,
        type === 'pareto' && field === 'category' ? value : columnSelection.pareto.category,
        type === 'pareto' && field === 'value' ? value : columnSelection.pareto.value
      );

      // Cargar datos en el gráfico
      loadDiagramData(null, 'pareto', paretoData);
    }
  };

  const processParetoDiagramData = (data, categoryColumn, valueColumn) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            type: 'bar',
            label: 'Frecuencia',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'Porcentaje Acumulado',
            data: [],
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y1'
          }
        ]
      };
    }

    // Agrupar por categoría y sumar valores
    const groupedData = data.reduce((acc, row) => {
      const category = row[categoryColumn];
      const value = parseFloat(row[valueColumn]) || 0;
      
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += value;
      return acc;
    }, {});

    // Convertir a array y ordenar por valor descendente
    const sortedData = Object.entries(groupedData)
      .sort(([, a], [, b]) => b - a);

    // Calcular el total
    const total = sortedData.reduce((sum, [, value]) => sum + value, 0);

    // Preparar datos para el gráfico
    const labels = sortedData.map(([category]) => category);
    const values = sortedData.map(([, value]) => value);

    // Calcular porcentajes acumulados
    let accumulated = 0;
    const cumulative = values.map(value => {
      accumulated += (value / total) * 100;
      return accumulated;
    });

    return {
      labels,
      datasets: [ 
        {
          type: 'bar',
          label: valueColumn,
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Porcentaje Acumulado',
          data: cumulative,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          fill: false,
          yAxisID: 'y1'
        }
      ]
    };
  };

  const processHistogramData = (data, column) => {
    if (!data || !Array.isArray(data) || data.length === 0 || !column) return null;

    // Extraer y convertir valores a números
    const values = data
      .map(row => parseFloat(row[column]))
      .filter(value => !isNaN(value));

    if (values.length === 0) return null;

    // Calcular bins usando la regla de Sturges
    const n = values.length;
    const numberOfBins = Math.ceil(1 + 3.322 * Math.log10(n));
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / numberOfBins;

    const bins = Array(numberOfBins).fill(0);
    const binLabels = [];

    // Crear etiquetas de bins y contar frecuencias
    for (let i = 0; i < numberOfBins; i++) {
      const start = min + (i * binWidth);
      const end = start + binWidth;
      binLabels.push(`${start.toFixed(2)} - ${end.toFixed(2)}`);
    }

    values.forEach(value => {
      const binIndex = Math.min(
        Math.floor((value - min) / binWidth),
        numberOfBins - 1
      );
      bins[binIndex]++;
    });

    // Calcular estadísticas
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    return {
      labels: binLabels,
      datasets: [{
        label: 'Frecuencia',
        data: bins,
        backgroundColor: '#3b82f6',
        borderColor: '#1e3a8a',
        borderWidth: 1
      }],
      statistics: {
        mean: mean.toFixed(2),
        stdDev: stdDev.toFixed(2),
        n: n,
        min: min.toFixed(2),
        max: max.toFixed(2)
      }
    };
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const data = [manualData[activeTab]];
    loadDiagramData({ data }, activeTab);
    setManualData(prev => ({
      ...prev,
      [activeTab]: getEmptyDataStructure(activeTab)
    }));
  };

  const getEmptyDataStructure = (type) => {
    switch(type) {
      case 'pareto':
        return { defecto: '', frecuencia: '' };
      case 'control':
        return { muestra: '', valor: '', ucl: '', lcl: '' };
      case 'scatter':
        return { x: '', y: '' };
      case 'histogram':
        return { valor: '' };
      case 'fishbone':
        return { categoria: '', causa: '' };
      default:
        return {};
    }
  };

  const renderManualInputForm = () => {
    switch(activeTab) {
      case 'pareto':
        return (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Defecto</label>
              <input
                type="text"
                value={manualData.pareto.defecto}
                onChange={e => setManualData(prev => ({
                  ...prev,
                  pareto: { ...prev.pareto, defecto: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Frecuencia</label>
              <input
                type="number"
                value={manualData.pareto.frecuencia}
                onChange={e => setManualData(prev => ({
                  ...prev,
                  pareto: { ...prev.pareto, frecuencia: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Agregar Dato
            </button>
          </form>
        );

      case 'control':
        return (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Muestra</label>
              <input
                type="number"
                value={manualData.control.muestra}
                onChange={e => setManualData(prev => ({
                  ...prev,
                  control: { ...prev.control, muestra: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Valor</label>
              <input
                type="number"
                value={manualData.control.valor}
                onChange={e => setManualData(prev => ({
                  ...prev,
                  control: { ...prev.control, valor: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">UCL</label>
              <input
                type="number"
                value={manualData.control.ucl}
                onChange={e => setManualData(prev => ({
                  ...prev,
                  control: { ...prev.control, ucl: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">LCL</label>
              <input
                type="number"
                value={manualData.control.lcl}
                onChange={e => setManualData(prev => ({
                  ...prev,
                  control: { ...prev.control, lcl: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Agregar Dato
            </button>
          </form>
        );

      case 'scatter':
        return (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">X</label>
              <input
                type="number"
                value={manualData.scatter.x}
                onChange={e => setManualData(prev => ({
                  ...prev,
                  scatter: { ...prev.scatter, x: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Y</label>
              <input
                type="number"
                value={manualData.scatter.y}
                onChange={e => setManualData(prev => ({
                  ...prev,
                  scatter: { ...prev.scatter, y: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Agregar Dato
            </button>
          </form>
        );

      case 'histogram':
        return (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Valor</label>
              <input
                type="number"
                value={manualData.histogram.valor}
                onChange={e => setManualData(prev => ({
                  ...prev,
                  histogram: { ...prev.histogram, valor: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Agregar Dato
            </button>
          </form>
        );

      case 'fishbone':
        return (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Categoría</label>
              <select
                value={manualData.fishbone.categoria}
                onChange={e => setManualData(prev => ({
                  ...prev,
                  fishbone: { ...prev.fishbone, categoria: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="">Seleccione una categoría</option>
                <option value="man">Man (Mano de obra)</option>
                <option value="machine">Machine (Máquina)</option>
                <option value="method">Method (Método)</option>
                <option value="material">Material</option>
                <option value="measurement">Measurement (Medición)</option>
                <option value="environment">Environment (Entorno)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Causa</label>
              <input
                type="text"
                value={manualData.fishbone.causa}
                onChange={e => setManualData(prev => ({
                  ...prev,
                  fishbone: { ...prev.fishbone, causa: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Agregar Causa
            </button>
          </form>
        );

      case 'process-flow':
        return (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Valor</label>
              <input
                type="text"
                value={manualData.processFlow.valor}
                onChange={e => setManualData(prev => ({
                  ...prev,
                  processFlow: { ...prev.processFlow, valor: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Agregar Dato
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  const renderFishboneDiagram = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Diagrama de Causa y Efecto</h3>
      <div className="relative">
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 border-2 border-gray-300 dark:border-gray-600 rounded p-2">
          Efecto
        </div>
        
        {Object.entries(diagramData.fishbone).map(([category, causes], index) => (
          <div key={category} className="mb-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-200 capitalize">{category}</h4>
            <ul className="list-disc pl-5">
              {causes.map((cause, i) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-400">{cause}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  const renderColumnSelector = () => {
    if (activeTab === 'pareto' && availableColumns.pareto.length > 0) {
      return (
        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Selector de Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Columna Categoría
              </label>
              <select
                value={columnSelection.pareto.category}
                onChange={(e) => handleColumnSelection('pareto', 'category', e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
              >
                <option value="">Seleccionar columna</option>
                {availableColumns.pareto.map((column) => (
                  <option key={column} value={column}>
                    {column} {getColumnSuggestion(column, 'category')}
                  </option>
                ))}
              </select>
              {columnSelection.pareto.category && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vista previa de categorías:</p>
                  {renderPreview('category', columnPreview.category)}
                </div>
              )}
            </div>

            {/* Selector de Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Columna Valor
              </label>
              <select
                value={columnSelection.pareto.value}
                onChange={(e) => handleColumnSelection('pareto', 'value', e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-gray-200`}
              >
                <option value="">Seleccionar columna</option>
                {availableColumns.pareto.map((column) => (
                  <option key={column} value={column}>
                    {column} {getColumnSuggestion(column, 'value')}
                  </option>
                ))}
              </select>
              {columnSelection.pareto.value && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vista previa de valores:</p>
                  {renderPreview('value', columnPreview.value)}
                </div>
              )}
            </div>
          </div>

          {/* Guía de uso */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-gray-800 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">Guía de uso:</h4>
            <ul className="mt-2 text-sm text-blue-700 dark:text-blue-500 list-disc list-inside">
              <li>Selecciona una columna para las categorías (eje X)</li>
              <li>Selecciona una columna numérica para los valores (altura de las barras)</li>
              <li>Las columnas marcadas con "(✓ Recomendado)" son sugeridas basadas en su nombre</li>
              <li>Puedes ver una vista previa de los datos de cada columna al seleccionarla</li>
            </ul>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderPreview = (type, values) => {
    if (!values || values.length === 0) {
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No hay datos disponibles</p>
      );
    }

    return (
      <ul className="mt-1 text-sm text-gray-700 dark:text-gray-300">
        {values.map((value, index) => (
          <li key={index} className="py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            {value}
          </li>
        ))}
        {values.length === 5 && (
          <li className="py-1 px-2 text-gray-500 dark:text-gray-400 italic">...</li>
        )}
      </ul>
    );
  };

  const tabs = [
    // Diagramas de Proceso
    { 
      id: 'process-flow', 
      name: 'Flujo de Proceso',
      icon: (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      )
    },
    { 
      id: 'ishikawa', 
      name: 'Ishikawa',
      icon: (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      id: '5why', 
      name: '5 Por Qués',
      icon: (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    // Análisis de Datos
    { 
      id: 'histogram', 
      name: 'Histogramas',
      icon: (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'pareto', 
      name: 'Pareto',
      icon: (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'scatter', 
      name: 'Dispersión',
      icon: (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      )
    },
    { 
      id: 'control', 
      name: 'Control',
      icon: (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Diagramas
        </h1>

        {/* Botones de importación */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={() => fileInputRef.current.click()}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importar CSV/Excel
          </button>
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
          >
            Mostrar Entrada Manual
          </button>
          <span className="text-sm text-gray-500">
            Formatos soportados: CSV, Excel (.xlsx, .xls)
          </span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-secondary-900 shadow-lg rounded-lg mb-6">
        <div className="max-w-full">
          {/* Título de la sección */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Herramientas para Lean Six Sigma
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Selecciona el tipo de diagrama y comienza a analizar tus datos
            </p>
          </div>

          {/* Pestañas con separadores visuales */}
          <div className="px-6 overflow-x-auto">
            <nav className="flex space-x-1 py-4" aria-label="Tabs">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2">Diagramas de Proceso</span>
                {tabs.slice(0, 3).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      inline-flex items-center
                      ${
                        activeTab === tab.id
                          ? 'bg-white dark:bg-secondary-800 text-primary-600 dark:text-primary-400 shadow-md transform scale-105'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-secondary-800/60'
                      }
                    `}
                  >
                    {tab.icon}
                    {tab.name}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>

              <div className="w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

              <div className="flex items-center space-x-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2">Gráficos de Análisis</span>
                {tabs.slice(3).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      inline-flex items-center
                      ${
                        activeTab === tab.id
                          ? 'bg-white dark:bg-secondary-800 text-primary-600 dark:text-primary-400 shadow-md transform scale-105'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-secondary-800/60'
                      }
                    `}
                  >
                    {tab.icon}
                    {tab.name}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mt-6">
        {activeTab === 'process-flow' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Diagrama de Flujo de Proceso</h3>
            <ProcessFlowDiagram />
          </div>
        )}

        {activeTab === 'pareto' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Diagrama de Pareto</h3>
            {processedData && processedData.length > 0 ? (
              <ParetoChart data={processedData} />
            ) : (
              <div className="text-center text-secondary-500 dark:text-secondary-400 py-8">
                No hay datos disponibles. Por favor, carga un archivo CSV o ingresa datos manualmente.
              </div>
            )}
          </div>
        )}

        {activeTab === 'ishikawa' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Diagrama de Ishikawa</h3>
            <IshikawaDiagram
              data={diagramData.fishbone}
              onUpdate={updateIshikawaData}
            />
          </div>
        )}

        {activeTab === '5why' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Análisis 5 Por Qués</h3>
            <FiveWhysAnalysis
              data={diagramData.fiveWhys}
              onUpdate={updateIshikawaData}
            />
          </div>
        )}

        {activeTab === 'control' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Gráficos de Control</h3>
            {processedData && processedData.length > 0 ? (
              <MultipleControlCharts data={processedData} />
            ) : (
              <div className="text-center text-secondary-500 dark:text-secondary-400 py-8">
                No hay datos disponibles. Por favor, carga un archivo CSV o ingresa datos manualmente.
              </div>
            )}
          </div>
        )}

        {activeTab === 'scatter' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Diagramas de Dispersión</h3>
            {processedData && processedData.length > 0 ? (
              <MultipleScatterPlots data={processedData} />
            ) : (
              <div className="text-center text-secondary-500 dark:text-secondary-400 py-8">
                No hay datos disponibles. Por favor, carga un archivo CSV o ingresa datos manualmente.
              </div>
            )}
          </div>
        )}

        {activeTab === 'histogram' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4 dark:text-gray-100">Histogramas</h3>
            {processedData && processedData.length > 0 ? (
              <MultipleHistograms data={processedData} />
            ) : (
              <div className="text-center text-secondary-500 dark:text-secondary-400 py-8">
                No hay datos disponibles. Por favor, carga un archivo CSV o ingresa datos manualmente.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
