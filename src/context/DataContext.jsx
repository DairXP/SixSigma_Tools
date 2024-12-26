import React, { createContext, useContext, useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DataContext = createContext();

export function DataProvider({ children }) {
  const [productionData, setProductionData] = useState([]);
  const [processData, setProcessData] = useState({
    defects: [],
    measurements: [],
    rawData: []
  });

  const initialState = {
    pareto: {
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
    },
    fishbone: {
      effect: 'Identificar Causa Raíz',
      categories: [
        {
          id: '1',
          name: 'Mano de obra',
          position: 'top',
          color: '#FF6B6B',
          causes: []
        },
        {
          id: '2',
          name: 'Método',
          position: 'top',
          color: '#4ECDC4',
          causes: []
        },
        {
          id: '3',
          name: 'Material',
          position: 'bottom',
          color: '#45B7D1',
          causes: []
        },
        {
          id: '4',
          name: 'Máquina',
          position: 'bottom',
          color: '#96CEB4',
          causes: []
        }
      ]
    },
    fiveWhys: {
      problem: '',
      whys: ['', '', '', '', ''],
      conclusion: ''
    },
    control: [],
    scatter: [],
    histogram: []
  };

  const [diagramData, setDiagramData] = useState(initialState);

  // Cargar datos desde CSV
  const loadCSVData = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          const data = results.data.filter(row => row.length > 1);
          setProcessData(prev => ({
            ...prev,
            defects: data.map((row, index) => ({
              id: index,
              date: row[0],
              defectCount: parseInt(row[1]) || 0,
              units: parseInt(row[2]) || 0,
              opportunities: parseInt(row[3]) || 0,
              description: row[4] || ''
            })),
            rawData: data
          }));
          resolve(data);
        },
        error: (error) => {
          reject(error);
        },
        header: true
      });
    });
  };

  const processParetoData = (data, options) => {
    console.log('Procesando datos Pareto:', { dataLength: data?.length });

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('No hay datos para procesar');
      return diagramData.pareto;
    }

    try {
      const categoryColumn = options?.categoryColumn || 'Defecto';
      const valueColumn = options?.valueColumn || 'Frecuencia';

      // Normalizar y agrupar datos
      const groupedData = data.reduce((acc, row) => {
        // Normalizar la categoría (eliminar espacios extras y convertir a minúsculas)
        let category = String(row[categoryColumn] || '').trim();
        if (!category) return acc;

        // Normalizar el valor
        let value = 0;
        if (typeof row[valueColumn] === 'string') {
          // Limpiar el string de caracteres no numéricos excepto punto decimal
          value = parseFloat(row[valueColumn].replace(/[^\d.-]/g, ''));
        } else {
          value = parseFloat(row[valueColumn]);
        }

        if (!isNaN(value)) {
          if (!acc[category]) {
            acc[category] = { total: 0, count: 0 };
          }
          acc[category].total += value;
          acc[category].count += 1;
        }
        return acc;
      }, {});

      console.log('Datos agrupados:', Object.keys(groupedData).length, 'categorías únicas');

      // Convertir a array y ordenar por valor descendente
      const sortedData = Object.entries(groupedData)
        .map(([category, { total, count }]) => ({
          category,
          value: total,
          count
        }))
        .sort((a, b) => b.value - a.value);

      // Tomar los top 20 para mejor visualización
      const topData = sortedData.slice(0, 20);
      const otherData = sortedData.slice(20);

      // Si hay más datos, agregar una categoría "Otros"
      if (otherData.length > 0) {
        const otherTotal = otherData.reduce((sum, item) => sum + item.value, 0);
        const otherCount = otherData.reduce((sum, item) => sum + item.count, 0);
        topData.push({
          category: 'Otros',
          value: otherTotal,
          count: otherCount
        });
      }

      // Calcular el total
      const total = topData.reduce((sum, item) => sum + item.value, 0);

      // Preparar datos para el gráfico
      const labels = topData.map(item => `${item.category} (${item.count})`);
      const values = topData.map(item => item.value);

      // Calcular porcentajes acumulados
      let accumulated = 0;
      const cumulative = values.map(value => {
        accumulated += (value / total) * 100;
        return Number(accumulated.toFixed(1));
      });

      console.log('Datos procesados:', {
        categorias: labels.length,
        totalRegistros: data.length,
        totalAgrupado: total
      });

      return {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Frecuencia',
            data: values,
            backgroundColor: values.map((_, index) => 
              index === values.length - 1 && otherData.length > 0
                ? 'rgba(200, 200, 200, 0.5)'  // Color gris para "Otros"
                : 'rgba(54, 162, 235, 0.5)'
            ),
            borderColor: values.map((_, index) => 
              index === values.length - 1 && otherData.length > 0
                ? 'rgba(200, 200, 200, 1)'
                : 'rgba(54, 162, 235, 1)'
            ),
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
    } catch (error) {
      console.error('Error al procesar datos:', error);
      return diagramData.pareto;
    }
  };

  const loadDiagramData = async (file, type, options = {}) => {
    console.log('Cargando datos:', { type, options });

    if (type === 'pareto') {
      try {
        let data = [];

        if (file) {
          if (file.data) {
            // Entrada manual
            const manualData = file.data[0];
            console.log('Datos manuales recibidos:', manualData);
            
            // Convertir los datos manuales al formato correcto
            data = processData.rawData || [];
            data.push({
              Defecto: manualData.defecto,
              Frecuencia: parseFloat(manualData.frecuencia)
            });

            console.log('Datos procesados:', data);
          } else {
            // Archivo CSV/Excel
            let fileData;
            if (file.name.toLowerCase().endsWith('.csv')) {
              // Procesar CSV
              const results = await new Promise((resolve) => {
                Papa.parse(file, {
                  header: true,
                  dynamicTyping: true,
                  skipEmptyLines: true,
                  complete: resolve,
                  error: (error) => {
                    console.error('Error al procesar el archivo CSV:', error);
                    resolve({ data: [] });
                  }
                });
              });
              fileData = results.data;
            } else if (file.name.toLowerCase().match(/\.xlsx?$/)) {
              // Procesar Excel
              try {
                const reader = new FileReader();
                const arrayBuffer = await new Promise((resolve, reject) => {
                  reader.onload = (e) => resolve(e.target.result);
                  reader.onerror = (e) => reject(e);
                  reader.readAsArrayBuffer(file);
                });

                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                fileData = XLSX.utils.sheet_to_json(firstSheet);
              } catch (error) {
                console.error('Error al procesar el archivo Excel:', error);
                fileData = [];
              }
            }

            if (Array.isArray(fileData) && fileData.length > 0) {
              // Validar y limpiar los datos
              data = fileData.map(row => {
                const cleanRow = {};
                Object.entries(row).forEach(([key, value]) => {
                  // Limpiar espacios en blanco y caracteres especiales
                  const cleanKey = key.trim().replace(/[^\w\s]/g, '');
                  cleanRow[cleanKey] = value;
                });
                return cleanRow;
              });

              console.log('Datos del archivo procesados:', data.slice(0, 5));
            }
          }

          setProcessData(prev => ({
            ...prev,
            rawData: data
          }));
        } else {
          data = processData.rawData || [];
        }

        if (data.length > 0) {
          // Usar nombres de columna predeterminados o los proporcionados
          const paretoOptions = file?.data ? {
            categoryColumn: 'Defecto',
            valueColumn: 'Frecuencia'
          } : options;

          const paretoData = processParetoData(data, paretoOptions);
          console.log('Datos del gráfico Pareto:', paretoData);
          
          setDiagramData(prev => ({
            ...prev,
            pareto: paretoData
          }));
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    } else if (type === 'control') {
      processControlData(processData.rawData);
    } else if (type === 'scatter') {
      processScatterData(processData.rawData);
    } else if (type === 'histogram') {
      processHistogramData(processData.rawData);
    } else if (type === 'fishbone') {
      processFishboneData(processData.rawData);
    }
  };

  const processControlData = (data) => {
    const newData = {
      labels: [],
      datasets: [
        {
          label: 'Medición',
          data: [],
          borderColor: 'rgb(75, 192, 192)',
          fill: false,
        },
        {
          label: 'UCL',
          data: [],
          borderColor: 'rgb(255, 99, 132)',
          borderDash: [5, 5],
        },
        {
          label: 'LCL',
          data: [],
          borderColor: 'rgb(255, 99, 132)',
          borderDash: [5, 5],
        }
      ]
    };

    data.forEach(row => {
      newData.labels.push(row.Muestra || '');
      newData.datasets[0].data.push(Number(row.Valor));
      newData.datasets[1].data.push(Number(row.UCL));
      newData.datasets[2].data.push(Number(row.LCL));
    });

    setDiagramData(prev => ({ ...prev, control: newData }));
  };

  const processScatterData = (data) => {
    const newData = {
      datasets: [{
        label: 'Correlación',
        data: data.map(row => ({
          x: Number(row.X),
          y: Number(row.Y)
        })),
        backgroundColor: 'rgb(75, 192, 192)',
      }]
    };

    setDiagramData(prev => ({ ...prev, scatter: newData }));
  };

  const processHistogramData = (data) => {
    const values = data.map(row => Number(Object.values(row)[0])).filter(val => !isNaN(val));
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const binCount = 10;
    const binSize = range / binCount;

    const bins = Array(binCount).fill(0);
    const labels = [];

    for (let i = 0; i < binCount; i++) {
      const start = min + (i * binSize);
      const end = start + binSize;
      labels.push(`${start.toFixed(1)}-${end.toFixed(1)}`);
    }

    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      bins[binIndex]++;
    });

    const newData = {
      labels: labels,
      datasets: [{
        label: 'Frecuencia',
        data: bins,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }]
    };

    setDiagramData(prev => ({ ...prev, histogram: newData }));
  };

  const processFishboneData = (data) => {
    const newData = {
      man: [],
      machine: [],
      method: [],
      material: [],
      measurement: [],
      environment: []
    };

    data.forEach(row => {
      if (row.Categoria && row.Causa) {
        const category = row.Categoria.toLowerCase();
        if (category in newData) {
          newData[category].push(row.Causa);
        }
      }
    });

    setDiagramData(prev => ({ ...prev, fishbone: newData }));
  };

  const updateIshikawaData = (action) => {
    setDiagramData(prevData => {
      const newData = { ...prevData };
      
      switch (action.type) {
        case 'INIT_CATEGORIES':
          newData.fishbone = {
            ...newData.fishbone,
            categories: action.categories
          };
          break;

        case 'UPDATE_EFFECT':
          newData.fishbone = {
            ...newData.fishbone,
            effect: action.effect
          };
          break;

        case 'UPDATE_CATEGORY':
          newData.fishbone = {
            ...newData.fishbone,
            categories: newData.fishbone.categories.map(cat =>
              cat.id === action.categoryId
                ? { ...cat, name: action.name }
                : cat
            )
          };
          break;

        case 'ADD_CATEGORY':
          const newCategory = {
            id: Date.now().toString(),
            name: action.name,
            position: action.position,
            color: action.color,
            causes: []
          };
          newData.fishbone = {
            ...newData.fishbone,
            categories: [...newData.fishbone.categories, newCategory]
          };
          break;

        case 'DELETE_CATEGORY':
          newData.fishbone = {
            ...newData.fishbone,
            categories: newData.fishbone.categories.filter(
              cat => cat.id !== action.categoryId
            )
          };
          break;

        case 'ADD_SUBCAUSE':
          newData.fishbone = {
            ...newData.fishbone,
            categories: newData.fishbone.categories.map(cat =>
              cat.id === action.categoryId
                ? {
                    ...cat,
                    causes: [...(cat.causes || []), action.subcause]
                  }
                : cat
            )
          };
          break;

        case 'DELETE_SUBCAUSE':
          newData.fishbone = {
            ...newData.fishbone,
            categories: newData.fishbone.categories.map(cat =>
              cat.id === action.categoryId
                ? {
                    ...cat,
                    causes: cat.causes.filter(cause => cause.id !== action.causeId)
                  }
                : cat
            )
          };
          break;

        case 'UPDATE_FIVE_WHYS':
          return {
            ...newData,
            fiveWhys: action.data
          };

        default:
          break;
      }
      
      return newData;
    });
  };

  // Agregar datos manualmente
  const addManualData = (newData) => {
    setProcessData(prev => ({
      ...prev,
      defects: [...prev.defects, {
        id: prev.defects.length,
        ...newData,
        date: new Date().toISOString().split('T')[0]
      }]
    }));
  };

  // Calcular métricas
  const calculateMetrics = () => {
    const latestData = processData.defects.slice(-30);
    
    const totalDefects = latestData.reduce((sum, item) => sum + item.defectCount, 0);
    const totalUnits = latestData.reduce((sum, item) => sum + item.units, 0);
    const totalOpportunities = latestData.reduce((sum, item) => sum + item.opportunities, 0);

    const dpu = totalDefects / totalUnits;
    const dpmo = (totalDefects / (totalUnits * totalOpportunities)) * 1000000;
    const processYield = ((1 - (totalDefects / (totalUnits * totalOpportunities))) * 100).toFixed(2);
    const sigmaLevel = (0.8406 + Math.sqrt(29.37 - 2.221 * Math.log(dpmo))).toFixed(2);

    return {
      defectsTotal: totalDefects,
      processYield: processYield + '%',
      dpmo: Math.round(dpmo),
      sigmaLevel: sigmaLevel + 'σ'
    };
  };

  // Obtener datos para gráficos
  const getProcessChartData = (metricType) => {
    const last6Months = processData.defects.slice(-6);
    
    const getMetricValue = (item) => {
      switch(metricType) {
        case 'defects':
          return item.defectCount;
        case 'dpmo':
          return (item.defectCount / (item.units * item.opportunities)) * 1000000;
        case 'yield':
          return ((1 - (item.defectCount / (item.units * item.opportunities))) * 100);
        case 'sigma':
          const dpmo = (item.defectCount / (item.units * item.opportunities)) * 1000000;
          return 0.8406 + Math.sqrt(29.37 - 2.221 * Math.log(dpmo));
        default:
          return item.defectCount;
      }
    };

    const metricLabels = {
      defects: 'Defectos',
      dpmo: 'DPMO',
      yield: 'Yield (%)',
      sigma: 'Nivel Sigma'
    };

    return {
      labels: last6Months.map(item => item.date),
      datasets: [{
        label: metricLabels[metricType],
        data: last6Months.map(item => getMetricValue(item)),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }]
    };
  };

  const addProductionData = (data) => {
    setProductionData(prev => [...prev, {
      id: prev.length,
      ...data,
      timestamp: new Date().toISOString()
    }]);
  };

  const getProductionChartData = (metricType) => {
    const last10Records = productionData.slice(-10);
    
    const getMetricValue = (item) => {
      const disponibilidad = item.tiempoOperativo / item.tiempoProgramado;
      const rendimiento = item.produccionReal / item.produccionTeorica;
      const calidad = item.unidadesConformes / item.unidadesTotales;
      const oee = disponibilidad * rendimiento * calidad;
      const productividad = item.produccionReal / (item.tiempoOperativo / 60);
      const defectos = ((item.unidadesTotales - item.unidadesConformes) / item.unidadesTotales) * 1000000;

      switch(metricType) {
        case 'oee':
          return oee * 100;
        case 'disponibilidad':
          return disponibilidad * 100;
        case 'rendimiento':
          return rendimiento * 100;
        case 'calidad':
          return calidad * 100;
        case 'productividad':
          return productividad;
        case 'defectos':
          return defectos;
        default:
          return 0;
      }
    };

    const metricLabels = {
      oee: 'OEE (%)',
      disponibilidad: 'Disponibilidad (%)',
      rendimiento: 'Rendimiento (%)',
      calidad: 'Calidad (%)',
      productividad: 'Productividad (u/h)',
      defectos: 'Defectos (PPM)'
    };

    return {
      labels: last10Records.map(item => new Date(item.fecha).toLocaleDateString()),
      datasets: [{
        label: metricLabels[metricType],
        data: last10Records.map(item => getMetricValue(item)),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }]
    };
  };

  return (
    <DataContext.Provider value={{
      productionData,
      processData,
      diagramData,
      loadCSVData,
      loadDiagramData,
      updateIshikawaData,
      addManualData,
      calculateMetrics,
      getProcessChartData,
      addProductionData,
      getProductionChartData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
