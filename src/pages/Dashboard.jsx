import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import { HelpCircle } from 'lucide-react';
import { Switch } from "../components/ui/switch";

const TooltipIcon = ({ message }) => (
  <div className="group relative inline-block ml-1">
    <HelpCircle className="h-4 w-4 text-gray-400 inline cursor-help" />
    <div className="hidden group-hover:block absolute z-10 w-64 p-2 mt-1 text-sm bg-gray-900 text-white rounded-md shadow-lg -left-1/2 transform -translate-x-1/2">
      {message}
    </div>
  </div>
);

const InputField = ({ label, name, value, onChange, tooltip, type = "number", min = "0", step = "0.01" }) => (
  <div className="space-y-1">
    <div className="flex items-center">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <TooltipIcon message={tooltip} />
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      min={min}
      step={step}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500"
    />
  </div>
);

const Dashboard = () => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  
  // Estado para modo simple con fecha inicializada
  const [simpleData, setSimpleData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    unidadesInspeccionadas: '',
    defectosEncontrados: '',
    oportunidadesDefecto: '',
    tiempoCiclo: ''
  });

  // Estados para modo avanzado
  const [processKPIs, setProcessKPIs] = useState({
    fecha: new Date().toISOString().split('T')[0],
    cycletime: '',
    leadtime: '',
    defectrate: ''
  });

  const [projectKPIs, setProjectKPIs] = useState({
    costsavings: '',
    roi: '',
    bcr: '',
    duration: '',
    milestones: ''
  });

  const [qualityKPIs, setQualityKPIs] = useState({
    unidadesConformes: '',
    unidadesTotales: '',
    oportunidadesDefecto: '',
    defectosEncontrados: ''
  });

  const [historicalData, setHistoricalData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('destructive');

  // Nuevos estados para objetivos y distribución
  const [objectives] = useState({
    sigmaTarget: 6,
    yieldTarget: 99.99966,
    dpmoTarget: 3.4,
    cycleTimeTarget: 30
  });

  const [distributionData] = useState([
    { range: '0-10', count: 15 },
    { range: '11-20', count: 25 },
    { range: '21-30', count: 35 },
    { range: '31-40', count: 20 },
    { range: '41-50', count: 5 }
  ]);

  const [progressData] = useState([
    { month: 'Ene', actual: 4.1, objetivo: 4.5 },
    { month: 'Feb', actual: 4.3, objetivo: 4.7 },
    { month: 'Mar', actual: 4.5, objetivo: 4.9 },
    { month: 'Abr', actual: 4.7, objetivo: 5.1 },
    { month: 'May', actual: 4.9, objetivo: 5.3 },
    { month: 'Jun', actual: 5.1, objetivo: 5.5 }
  ]);

  // Manejador para cambio de modo
  const handleModeChange = (isAdvanced) => {
    setIsAdvancedMode(isAdvanced);
    // Reiniciar la fecha al cambiar de modo
    if (!isAdvanced) {
      setSimpleData(prev => ({
        ...prev,
        fecha: new Date().toISOString().split('T')[0]
      }));
    }
  };

  // Manejadores para modo simple
  const handleSimpleChange = (e) => {
    const { name, value } = e.target;
    
    // Si es un campo numérico, validar que solo se ingresen números
    if (name !== 'fecha') {
      if (value && !/^\d*\.?\d*$/.test(value)) {
        return; // No actualizar si no es un número válido
      }
    }
    
    setSimpleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejadores para modo avanzado
  const handleProcessChange = (e) => {
    const { name, value } = e.target;
    setProcessKPIs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectKPIs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQualityChange = (e) => {
    const { name, value } = e.target;
    setQualityKPIs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateSimpleMetrics = (data) => {
    const { unidadesInspeccionadas, defectosEncontrados, oportunidadesDefecto } = data;
    
    const dpo = defectosEncontrados / (unidadesInspeccionadas * oportunidadesDefecto);
    const dpmo = dpo * 1000000;
    const yieldRate = (1 - dpo) * 100;
    const sigma = 0.8406 + Math.sqrt(29.37 - 2.221 * Math.log(dpmo));

    return {
      dpmo: dpmo.toFixed(0),
      yieldRate: yieldRate.toFixed(2),
      sigma: sigma.toFixed(2)
    };
  };

  const calculateAdvancedMetrics = () => {
    const { unidadesConformes, unidadesTotales, oportunidadesDefecto, defectosEncontrados } = qualityKPIs;
    
    if (!unidadesConformes || !unidadesTotales || !oportunidadesDefecto || !defectosEncontrados) {
      return null;
    }

    const yieldRate = (unidadesConformes / unidadesTotales) * 100;
    const dpmo = (defectosEncontrados / (unidadesTotales * oportunidadesDefecto)) * 1000000;
    const sigma = 0.8406 + Math.sqrt(29.37 - 2.221 * Math.log(dpmo));

    return {
      yieldRate: yieldRate.toFixed(2),
      dpmo: dpmo.toFixed(0),
      sigma: sigma.toFixed(2)
    };
  };

  const validateSimpleForm = () => {
    const numericFields = {
      unidadesInspeccionadas: 'Unidades Inspeccionadas',
      defectosEncontrados: 'Defectos Encontrados',
      oportunidadesDefecto: 'Oportunidades de Defecto',
      tiempoCiclo: 'Tiempo de Ciclo'
    };
    
    // Validar campos numéricos
    for (const [field, label] of Object.entries(numericFields)) {
      const value = simpleData[field];
      if (!value || isNaN(value) || Number(value) < 0) {
        setAlertMessage(`Por favor ingrese un número válido y positivo para ${label}`);
        setAlertType('destructive');
        setShowAlert(true);
        return false;
      }
    }

    // Validación de la fecha
    if (!simpleData.fecha) {
      const today = new Date().toISOString().split('T')[0];
      setSimpleData(prev => ({ ...prev, fecha: today }));
    }

    // Validación de lógica de negocio
    if (Number(simpleData.defectosEncontrados) > Number(simpleData.unidadesInspeccionadas) * Number(simpleData.oportunidadesDefecto)) {
      setAlertMessage('El número de defectos no puede ser mayor que las oportunidades totales de defecto');
      setAlertType('destructive');
      setShowAlert(true);
      return false;
    }

    return true;
  };

  const validateAdvancedForm = () => {
    const fieldsToValidate = {
      ...{
        cycletime: processKPIs.cycletime,
        leadtime: processKPIs.leadtime,
        defectrate: processKPIs.defectrate
      },
      ...{
        costsavings: projectKPIs.costsavings,
        roi: projectKPIs.roi,
        bcr: projectKPIs.bcr
      },
      ...{
        unidadesConformes: qualityKPIs.unidadesConformes,
        unidadesTotales: qualityKPIs.unidadesTotales,
        oportunidadesDefecto: qualityKPIs.oportunidadesDefecto,
        defectosEncontrados: qualityKPIs.defectosEncontrados
      }
    };

    for (const [key, value] of Object.entries(fieldsToValidate)) {
      if (!value || value.trim() === '') {
        setAlertMessage(`El campo ${key} debe ser un número válido y positivo`);
        setAlertType('destructive');
        setShowAlert(true);
        return false;
      }
    }

    if (Number(qualityKPIs.unidadesConformes) > Number(qualityKPIs.unidadesTotales)) {
      setAlertMessage('Las unidades conformes no pueden ser mayores a las unidades totales');
      setAlertType('destructive');
      setShowAlert(true);
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowAlert(false);

    if (isAdvancedMode) {
      if (!validateAdvancedForm()) {
        return;
      }

      const metrics = calculateAdvancedMetrics();
      if (!metrics) {
        setAlertMessage('Error al calcular las métricas Six Sigma');
        setAlertType('destructive');
        setShowAlert(true);
        return;
      }

      const newEntry = {
        date: processKPIs.fecha,
        ...processKPIs,
        ...projectKPIs,
        ...qualityKPIs,
        ...metrics,
        mode: 'advanced'
      };

      setHistoricalData(prev => [...prev, newEntry]);
      
      // Limpiar formularios excepto la fecha
      const currentDate = processKPIs.fecha;
      setProcessKPIs({ fecha: currentDate, cycletime: '', leadtime: '', defectrate: '' });
      setProjectKPIs({ costsavings: '', roi: '', bcr: '', duration: '', milestones: '' });
      setQualityKPIs({ unidadesConformes: '', unidadesTotales: '', oportunidadesDefecto: '', defectosEncontrados: '' });
    } else {
      if (!validateSimpleForm()) {
        return;
      }

      const metrics = calculateSimpleMetrics(simpleData);
      const newEntry = {
        date: simpleData.fecha,
        ...simpleData,
        ...metrics,
        mode: 'simple'
      };

      setHistoricalData(prev => [...prev, newEntry]);
      
      // Limpiar formulario excepto la fecha
      setSimpleData(prev => ({
        ...prev,
        unidadesInspeccionadas: '',
        defectosEncontrados: '',
        oportunidadesDefecto: '',
        tiempoCiclo: ''
      }));
    }

    setAlertMessage('Datos registrados exitosamente');
    setAlertType('success');
    setShowAlert(true);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header con animación */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform hover:scale-[1.01] transition-all duration-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-600">
              Panel de Control Six Sigma
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitoreo y análisis de métricas en tiempo real
            </p>
          </div>
          
          {/* Botones de modo con animación */}
          <div className="flex space-x-3 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => handleModeChange(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                !isAdvancedMode 
                  ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-md scale-105' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Modo Simple</span>
              </span>
            </button>
            <button
              onClick={() => handleModeChange(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                isAdvancedMode 
                  ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-md scale-105' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Modo Avanzado</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido según el modo */}
      <div className="transition-all duration-300 transform">
        {!isAdvancedMode ? (
          // Modo Simple con animaciones
          <div className="grid gap-6 animate-fadeIn">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
                <CardTitle className="text-xl text-primary-700 dark:text-primary-300 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Métricas Básicas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Fecha"
                    name="fecha"
                    value={simpleData.fecha}
                    onChange={handleSimpleChange}
                    type="date"
                    tooltip="Fecha de registro de las mediciones"
                    className="transform hover:scale-[1.02] transition-transform duration-200"
                  />
                  <InputField
                    label="Unidades Inspeccionadas"
                    name="unidadesInspeccionadas"
                    value={simpleData.unidadesInspeccionadas}
                    onChange={handleSimpleChange}
                    tooltip="Número total de unidades revisadas"
                    type="number"
                    min="0"
                    step="1"
                    className="transform hover:scale-[1.02] transition-transform duration-200"
                  />
                  <InputField
                    label="Defectos Encontrados"
                    name="defectosEncontrados"
                    value={simpleData.defectosEncontrados}
                    onChange={handleSimpleChange}
                    tooltip="Cantidad de defectos detectados"
                    type="number"
                    min="0"
                    step="1"
                    className="transform hover:scale-[1.02] transition-transform duration-200"
                  />
                  <InputField
                    label="Oportunidades de Defecto"
                    name="oportunidadesDefecto"
                    value={simpleData.oportunidadesDefecto}
                    onChange={handleSimpleChange}
                    tooltip="Número de posibles puntos de fallo por unidad"
                    type="number"
                    min="0"
                    step="1"
                    className="transform hover:scale-[1.02] transition-transform duration-200"
                  />
                  <InputField
                    label="Tiempo de Ciclo (min)"
                    name="tiempoCiclo"
                    value={simpleData.tiempoCiclo}
                    onChange={handleSimpleChange}
                    tooltip="Tiempo promedio para procesar una unidad"
                    type="number"
                    min="0"
                    step="0.01"
                    className="transform hover:scale-[1.02] transition-transform duration-200"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Modo Avanzado con animaciones
          <div className="grid gap-6 animate-fadeIn">
            {/* KPIs de Proceso */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardTitle className="text-xl text-blue-700 dark:text-blue-300 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>KPIs de Proceso</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField
                    label="Cycle Time"
                    name="cycletime"
                    value={processKPIs.cycletime}
                    onChange={handleProcessChange}
                    tooltip="Tiempo de ciclo del proceso"
                    className="transform hover:scale-[1.02] transition-transform duration-200"
                  />
                  <InputField
                    label="Lead Time"
                    name="leadtime"
                    value={processKPIs.leadtime}
                    onChange={handleProcessChange}
                    tooltip="Tiempo total desde inicio hasta fin"
                    className="transform hover:scale-[1.02] transition-transform duration-200"
                  />
                  <InputField
                    label="Defect Rate"
                    name="defectrate"
                    value={processKPIs.defectrate}
                    onChange={handleProcessChange}
                    tooltip="Tasa de defectos"
                    className="transform hover:scale-[1.02] transition-transform duration-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* KPIs de Proyecto con gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <CardTitle className="text-xl text-green-700 dark:text-green-300 flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>KPIs de Proyecto</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    <InputField
                      label="Cost Savings"
                      name="costsavings"
                      value={projectKPIs.costsavings}
                      onChange={handleProjectChange}
                      tooltip="Ahorro en costos"
                      className="transform hover:scale-[1.02] transition-transform duration-200"
                    />
                    <InputField
                      label="ROI"
                      name="roi"
                      value={projectKPIs.roi}
                      onChange={handleProjectChange}
                      tooltip="Retorno de inversión"
                      className="transform hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de tendencias */}
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <CardTitle className="text-xl text-purple-700 dark:text-purple-300">Tendencias</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="defectrate" stroke="#8884d8" name="Tasa de Defectos" />
                      <Line type="monotone" dataKey="cycletime" stroke="#82ca9d" name="Tiempo de Ciclo" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Datos Históricos y Métricas Calculadas */}
      {historicalData.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de Tendencias */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300">Tendencias Históricas</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="sigma" stroke="#2563eb" name="Nivel Sigma" />
                    <Line yAxisId="right" type="monotone" dataKey="yieldRate" stroke="#059669" name="Yield (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Progreso vs Objetivos */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <CardTitle className="text-xl text-blue-700 dark:text-blue-300">Progreso vs Objetivos</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="actual" fill="#3b82f6" name="Nivel Sigma Actual" />
                    <Line type="monotone" dataKey="objetivo" stroke="#ef4444" name="Objetivo" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Distribución */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardTitle className="text-xl text-green-700 dark:text-green-300">Distribución de Defectos</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#10b981" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Métricas vs Objetivos */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardTitle className="text-xl text-emerald-700 dark:text-emerald-300">Métricas vs Objetivos</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">Nivel Sigma</h4>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                          {historicalData[historicalData.length - 1]?.sigma}σ
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Meta: {objectives.sigmaTarget}σ
                      </div>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-600 rounded-full" 
                        style={{ 
                          width: `${(historicalData[historicalData.length - 1]?.sigma / objectives.sigmaTarget) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-green-600 dark:text-green-400">Yield</h4>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                          {historicalData[historicalData.length - 1]?.yieldRate}%
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Meta: {objectives.yieldTarget}%
                      </div>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-green-600 rounded-full" 
                        style={{ 
                          width: `${(historicalData[historicalData.length - 1]?.yieldRate / objectives.yieldTarget) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-red-600 dark:text-red-400">DPMO</h4>
                        <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                          {historicalData[historicalData.length - 1]?.dpmo}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Meta: {objectives.dpmoTarget}
                      </div>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-red-600 rounded-full" 
                        style={{ 
                          width: `${(objectives.dpmoTarget / historicalData[historicalData.length - 1]?.dpmo) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      {/* Botón de acción con animación */}
      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white p-4 rounded-lg font-semibold
                 transform hover:scale-[1.01] transition-all duration-200 hover:shadow-lg
                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        {isAdvancedMode ? 'Registrar KPIs Avanzados' : 'Calcular Métricas Básicas'}
      </button>

      {/* Alertas con animación */}
      {showAlert && (
        <Alert 
          className="mt-6 animate-slideIn" 
          variant={alertType}
        >
          <AlertTitle>
            {alertType === 'success' ? '¡Éxito!' : 'Error'}
          </AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Dashboard;
