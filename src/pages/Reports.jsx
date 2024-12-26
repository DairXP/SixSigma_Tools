import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  ChartBarIcon, 
  TableCellsIcon, 
  DocumentTextIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

export default function Reports() {
  const [reportData, setReportData] = useState({
    // Configuración general del proyecto
    projectInfo: {
      nombre: '',
      empresa: '',
      lider: '',
      fechaInicio: '',
      fechaFin: '',
    },
    
    // Pasos DMAIC
    define: {
      objetivo: '',
      alcance: '',
      stakeholders: [],
      problemaActual: '',
    },
    
    measure: {
      caracteristicasClave: [],
      sistemaMedicion: '',
      datosRecolectados: [],
      estadisticasDescriptivas: {
        media: 0,
        desviacionEstandar: 0,
        varianza: 0,
      }
    },
    
    analyze: {
      analisisCausaRaiz: [],
      diagramaIshikawa: '',
      graficos: [
        // Gráficos generados o cargados manualmente
        // { tipo: 'Pareto', datos: [], titulo: '' }
      ],
      hipotesisPrincipales: []
    },
    
    improve: {
      solucionesProuestas: [],
      planImplementacion: [],
      beneficiosEsperados: []
    },
    
    control: {
      metodasSeguimiento: [],
      indicadoresControl: [],
      planMonitoreo: []
    },
    
    // Métricas Six Sigma
    metricas: {
      dpmo: 0,
      nivelSigma: 0,
      rendimiento: 0,
      costeMalaCalidad: 0
    },
    
    // Datos de defectos y mediciones
    defectos: [],
    mediciones: []
  });

  const [newDefect, setNewDefect] = useState({
    fecha: '',
    tipo: '',
    descripcion: '',
    severidad: 'Baja',
    impacto: '',
  });

  const [newMedicion, setNewMedicion] = useState({
    fecha: '',
    valor: '',
    usl: '',
    lsl: '',
    target: '',
  });

  const [showTooltips, setShowTooltips] = useState(false);

  const tooltips = {
    projectInfo: {
      nombre: "Nombre descriptivo del proyecto Six Sigma (ej: Reducción de Defectos en Línea de Producción)",
      empresa: "Nombre completo de la organización donde se realiza el proyecto",
      lider: "Nombre del líder o responsable del proyecto Six Sigma",
      fechaInicio: "Fecha en que se inicia formalmente el proyecto",
      fechaFin: "Fecha proyectada o real de conclusión del proyecto"
    },
    define: {
      objetivo: "Descripción clara y medible del objetivo principal del proyecto (ej: Reducir defectos en 50%)",
      alcance: "Límites y extensión del proyecto (ej: Línea de producción de componentes electrónicos)",
      stakeholders: "Personas o grupos interesados o afectados por el proyecto",
      problemaActual: "Descripción detallada del problema que se busca resolver"
    },
    measure: {
      caracteristicasClave: "Características críticas de calidad que serán medidas",
      sistemaMedicion: "Método o herramienta utilizada para recolectar y medir datos",
      datosRecolectados: "Datos numéricos o cuantitativos recolectados durante la fase de medición"
    },
    defectos: {
      fecha: "Fecha de ocurrencia del defecto",
      tipo: "Categoría o naturaleza del defecto (ej: Dimensional, Funcional)",
      descripcion: "Descripción detallada del defecto observado",
      severidad: "Nivel de impacto o gravedad del defecto"
    }
  };

  const addDefect = () => {
    // Validaciones más robustas
    if (!newDefect.fecha || !newDefect.tipo) {
      alert('Por favor, complete la fecha y el tipo de defecto');
      return;
    }

    setReportData(prev => ({
      ...prev,
      defectos: [...prev.defectos, { 
        ...newDefect, 
        id: Date.now() // Añadir ID único
      }]
    }));
    
    setNewDefect({
      fecha: '',
      tipo: '',
      descripcion: '',
      severidad: 'Baja',
      impacto: '',
    });
  };

  const removeDefect = (id) => {
    setReportData(prev => ({
      ...prev,
      defectos: prev.defectos.filter(defect => defect.id !== id)
    }));
  };

  const addMedicion = () => {
    // Validaciones más robustas
    if (!newMedicion.fecha || !newMedicion.valor) {
      alert('Por favor, complete la fecha y el valor de la medición');
      return;
    }

    setReportData(prev => ({
      ...prev,
      mediciones: [...prev.mediciones, { 
        ...newMedicion, 
        id: Date.now() // Añadir ID único
      }]
    }));
    
    setNewMedicion({
      fecha: '',
      valor: '',
      usl: '',
      lsl: '',
      target: '',
    });
  };

  const removeMedicion = (id) => {
    setReportData(prev => ({
      ...prev,
      mediciones: prev.mediciones.filter(medicion => medicion.id !== id)
    }));
  };

  const calculateSixSigmaMetrics = () => {
    // Cálculo más robusto de métricas Six Sigma
    const totalMediciones = reportData.mediciones.length;
    const totalDefectos = reportData.defectos.length;
    
    // Calcular DPMO (Defectos Por Millón de Oportunidades)
    const dpmo = totalMediciones > 0 
      ? (totalDefectos / (totalMediciones * 1000000)) * 1000000 
      : 0;
    
    // Calcular Yield
    const processYield = totalMediciones > 0 
      ? ((totalMediciones - totalDefectos) / totalMediciones) * 100 
      : 100;
    
    // Calcular Nivel Sigma usando tabla de conversión
    const sigmaLevels = [
      { dpmo: 933200, sigma: 1 },
      { dpmo: 308538, sigma: 2 },
      { dpmo: 66807, sigma: 3 },
      { dpmo: 6210, sigma: 4 },
      { dpmo: 320, sigma: 5 },
      { dpmo: 3.4, sigma: 6 }
    ];
    
    const sigmaLevel = sigmaLevels.find(level => dpmo >= level.dpmo)?.sigma || 6;

    setReportData(prev => ({
      ...prev,
      metricas: {
        dpmo: dpmo.toFixed(2),
        nivelSigma: sigmaLevel.toFixed(2),
        rendimiento: processYield.toFixed(2),
        costeMalaCalidad: 0
      }
    }));
  };

  useEffect(() => {
    calculateSixSigmaMetrics();
  }, [reportData.defectos, reportData.mediciones]);

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFont('helvetica', 'normal');
    
    // Colores profesionales
    const primaryColor = [41, 128, 185]; // Azul
    const secondaryColor = [52, 152, 219]; // Azul claro

    // Encabezado
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('Reporte Proyecto Six Sigma', 105, 20, { align: 'center' });

    // Información del Proyecto
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    let yPos = 40;

    const addSection = (title, data) => {
      doc.setFillColor(...secondaryColor);
      doc.setTextColor(255, 255, 255);
      doc.rect(10, yPos, 190, 10, 'F');
      doc.text(title, 105, yPos + 7, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      yPos += 15;
      
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`, 20, yPos);
          yPos += 7;
        }
      });
      
      yPos += 10;
    };

    addSection('Información del Proyecto', reportData.projectInfo);
    addSection('Definición del Proyecto', reportData.define);

    // Métricas Six Sigma
    doc.setFillColor(...secondaryColor);
    doc.setTextColor(255, 255, 255);
    doc.rect(10, yPos, 190, 10, 'F');
    doc.text('Métricas Six Sigma', 105, yPos + 7, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    yPos += 15;
    
    const metrics = [
      ['DPMO', reportData.metricas.dpmo],
      ['Yield', `${reportData.metricas.rendimiento}%`],
      ['Nivel Sigma', `${reportData.metricas.nivelSigma}σ`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Métrica', 'Valor']],
      body: metrics,
      theme: 'striped',
      headStyles: { 
        fillColor: primaryColor,
        textColor: 255 
      }
    });

    doc.save('reporte_six_sigma.pdf');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Generador de Reportes Six Sigma</h1>
          <p className="mt-2 text-sm text-gray-700">
            Genera reportes detallados de tus procesos Six Sigma con datos y métricas personalizadas.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Configuración del Proyecto */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
            Configuración del Proyecto
          </h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nombre del Proyecto</label>
              <div className="relative">
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={reportData.projectInfo.nombre}
                  onChange={(e) => setReportData({ ...reportData, projectInfo: { ...reportData.projectInfo, nombre: e.target.value } })}
                />
                {showTooltips && (
                  <div className="absolute top-0 right-0 p-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                    <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{tooltips.projectInfo.nombre}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Empresa</label>
              <div className="relative">
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={reportData.projectInfo.empresa}
                  onChange={(e) => setReportData({ ...reportData, projectInfo: { ...reportData.projectInfo, empresa: e.target.value } })}
                />
                {showTooltips && (
                  <div className="absolute top-0 right-0 p-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                    <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{tooltips.projectInfo.empresa}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Líder</label>
              <div className="relative">
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={reportData.projectInfo.lider}
                  onChange={(e) => setReportData({ ...reportData, projectInfo: { ...reportData.projectInfo, lider: e.target.value } })}
                />
                {showTooltips && (
                  <div className="absolute top-0 right-0 p-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                    <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{tooltips.projectInfo.lider}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
              <div className="relative">
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={reportData.projectInfo.fechaInicio}
                  onChange={(e) => setReportData({ ...reportData, projectInfo: { ...reportData.projectInfo, fechaInicio: e.target.value } })}
                />
                {showTooltips && (
                  <div className="absolute top-0 right-0 p-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                    <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{tooltips.projectInfo.fechaInicio}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
              <div className="relative">
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={reportData.projectInfo.fechaFin}
                  onChange={(e) => setReportData({ ...reportData, projectInfo: { ...reportData.projectInfo, fechaFin: e.target.value } })}
                />
                {showTooltips && (
                  <div className="absolute top-0 right-0 p-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                    <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{tooltips.projectInfo.fechaFin}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ingreso de Datos */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
            <TableCellsIcon className="h-5 w-5 text-gray-500" />
            Datos del Proyecto
          </h3>
          
          {/* Métricas Six Sigma */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="col-span-1 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">DPMO</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{reportData.metricas.dpmo}</p>
            </div>
            <div className="col-span-1 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Yield</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{reportData.metricas.rendimiento}%</p>
            </div>
            <div className="col-span-1 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Nivel Sigma</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{reportData.metricas.nivelSigma}σ</p>
            </div>
          </div>

          {/* Registro de Defectos */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900">Registro de Defectos</h4>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <input
                type="date"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={newDefect.fecha}
                onChange={(e) => setNewDefect({ ...newDefect, fecha: e.target.value })}
                placeholder="Fecha"
              />
              <input
                type="text"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={newDefect.tipo}
                onChange={(e) => setNewDefect({ ...newDefect, tipo: e.target.value })}
                placeholder="Tipo de Defecto"
              />
              <input
                type="text"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={newDefect.descripcion}
                onChange={(e) => setNewDefect({ ...newDefect, descripcion: e.target.value })}
                placeholder="Descripción"
              />
              <select
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={newDefect.severidad}
                onChange={(e) => setNewDefect({ ...newDefect, severidad: e.target.value })}
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
              <input
                type="text"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={newDefect.impacto}
                onChange={(e) => setNewDefect({ ...newDefect, impacto: e.target.value })}
                placeholder="Impacto"
              />
              <button
                type="button"
                onClick={addDefect}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Agregar Defecto
              </button>
            </div>
          </div>

          {/* Lista de Defectos */}
          {reportData.defectos.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">Defectos Registrados</h4>
              <div className="mt-2 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fecha</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tipo</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Severidad</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Eliminar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.defectos.map((defect, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{defect.fecha}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{defect.tipo}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{defect.severidad}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <button
                                type="button"
                                onClick={() => removeDefect(defect.id)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botón Generar Reporte */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={generatePDF}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Generar Reporte PDF
        </button>
      </div>
    </div>
  );
}
