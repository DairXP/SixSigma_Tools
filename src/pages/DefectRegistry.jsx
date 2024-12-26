import { useState, useEffect } from 'react';
import {
  ExclamationCircleIcon,
  BeakerIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

// Constantes para el registro de defectos
const defectTypes = ['Crítico', 'Mayor', 'Menor'];
const processPhases = ['Entrada', 'Proceso', 'Salida'];
const priorities = ['Alta', 'Media', 'Baja'];
const dmaicPhases = ['Definir', 'Medir', 'Analizar', 'Mejorar', 'Controlar'];
const sixSigmaLevels = ['1σ', '2σ', '3σ', '4σ', '5σ', '6σ'];

// Tooltips para cada campo
const tooltips = {
  type: "Selecciona el tipo de defecto según su impacto: Crítico (afecta seguridad/funcionalidad), Mayor (afecta calidad), Menor (cosmético)",
  phase: "Etapa del proceso donde se detectó el defecto: Entrada (materiales), Proceso (fabricación), Salida (producto final)",
  description: "Describe detalladamente el defecto incluyendo características específicas y condiciones",
  impact: "Describe el impacto cuantificable: costos, tiempo perdido, recursos afectados, impacto al cliente",
  rootCause: "Identifica la causa raíz usando técnicas como los 5 por qués o análisis de causa raíz",
  priority: "Prioridad de atención: Alta (inmediata), Media (24-48h), Baja (programar)",
  dmaic: "Fase actual DMAIC: Definir (problema), Medir (datos), Analizar (causas), Mejorar (soluciones), Controlar (mantener)",
  processCapability: "Capacidad del proceso (Cp): >1.33 es aceptable, >1.67 es bueno, >2.0 es excelente",
  cpk: "Índice de capacidad del proceso (Cpk): considera la variación y centrado del proceso",
  dpmo: "Defectos Por Millón de Oportunidades: medida estándar de defectos en Six Sigma",
  sigmaLevel: "Nivel Sigma: 6σ = 3.4 DPMO (world-class), 3σ = 66,807 DPMO (promedio)"
};

// Componente para el tooltip
const Tooltip = ({ text }) => (
  <div className="group relative inline-block">
    <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400 hover:text-blue-500 cursor-help ml-2" />
    <div className="hidden group-hover:block absolute z-50 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded shadow-lg -left-20">
      <div className="relative">
        {text}
        <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -top-1 left-24"></div>
      </div>
    </div>
  </div>
);

export default function DefectRegistry() {
  const [defects, setDefects] = useState(() => {
    const saved = localStorage.getItem('defects');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isEditing, setIsEditing] = useState(null);

  const [formData, setFormData] = useState({
    type: '',
    phase: '',
    description: '',
    impact: '',
    rootCause: '',
    priority: '',
    dmaic: 'Definir',
    // Campos adicionales para modo avanzado
    processCapability: '',
    cpk: '',
    sigmaLevel: '3σ',
    costImpact: '',
    timeImpact: '',
    customerImpact: '',
    correctiveActions: '',
    preventiveActions: '',
    verificationMethod: ''
  });

  const [metrics, setMetrics] = useState({
    dpmo: 0,
    sigma: 0,
    yield: 0,
    total: 0,
    processCapability: 0,
    cpk: 0,
    costSavings: 0,
    timeReduction: 0
  });

  useEffect(() => {
    localStorage.setItem('defects', JSON.stringify(defects));
    calculateMetrics(defects);
  }, [defects]);

  const calculateMetrics = (defectsList) => {
    const total = defectsList.length;
    const dpmo = total * 1000000 / (total || 1);
    const sigma = total > 0 ? Math.min(6, (1000000 - dpmo) / 1000000 * 6) : 6;
    const yieldValue = total > 0 ? ((1000000 - dpmo) / 1000000) * 100 : 100;
    
    // Cálculos adicionales para modo avanzado
    const processCapability = sigma / 3;
    const cpk = processCapability * 0.9;
    const costSavings = total * 100; // Ejemplo simple
    const timeReduction = total * 2; // Ejemplo simple

    setMetrics({
      dpmo: dpmo.toFixed(2),
      sigma: sigma.toFixed(2),
      yield: yieldValue.toFixed(2),
      total,
      processCapability: processCapability.toFixed(2),
      cpk: cpk.toFixed(2),
      costSavings,
      timeReduction
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      alert('Por favor, incluye una descripción del defecto');
      return;
    }

    const newDefect = {
      ...formData,
      id: Date.now().toString(),
      timestamp: new Date(),
      isAdvanced: isAdvancedMode
    };

    setDefects(prev => [...prev, newDefect]);
    setFormData({
      ...formData,
      description: '',
      impact: '',
      rootCause: '',
      type: '',
      phase: '',
      priority: '',
      costImpact: '',
      timeImpact: '',
      customerImpact: '',
      correctiveActions: '',
      preventiveActions: '',
      verificationMethod: ''
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setDefects(prev => prev.map(d => 
      d.id === isEditing ? {
        ...formData,
        id: d.id,
        timestamp: d.timestamp,
        isAdvanced: isAdvancedMode
      } : d
    ));
    setIsEditing(null);
    setFormData({
      type: '',
      phase: '',
      description: '',
      impact: '',
      rootCause: '',
      priority: '',
      dmaic: 'Definir',
      processCapability: '',
      cpk: '',
      sigmaLevel: '3σ',
      costImpact: '',
      timeImpact: '',
      customerImpact: '',
      correctiveActions: '',
      preventiveActions: '',
      verificationMethod: ''
    });
  };

  const handleEdit = (defect) => {
    setIsEditing(defect.id);
    setFormData({
      ...defect,
      id: undefined,
      timestamp: undefined,
      isAdvanced: undefined
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este defecto?')) {
      setDefects(prev => prev.filter(defect => defect.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Registro de Defectos</h1>
          <p className="text-gray-600">Sistema de registro y análisis Six Sigma</p>
        </div>
        {/* Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className={`text-sm ${!isAdvancedMode ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Simple</span>
          <div 
            className="relative inline-flex items-center cursor-pointer"
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          >
            <div className={`w-14 h-7 bg-gray-200 rounded-full peer transition-all duration-300 ${isAdvancedMode ? 'bg-blue-600' : ''}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isAdvancedMode ? 'translate-x-7' : 'translate-x-1'} absolute top-0.5`}></div>
            </div>
          </div>
          <span className={`text-sm ${isAdvancedMode ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Avanzado</span>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChartBarIcon className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">DPMO</p>
                <p className="text-lg font-semibold">{metrics.dpmo}</p>
              </div>
            </div>
            <Tooltip text={tooltips.dpmo} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BeakerIcon className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Nivel Sigma</p>
                <p className="text-lg font-semibold">{metrics.sigma}σ</p>
              </div>
            </div>
            <Tooltip text={tooltips.sigmaLevel} />
          </div>
        </div>
        {isAdvancedMode && (
          <>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <InformationCircleIcon className="h-6 w-6 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Cp</p>
                    <p className="text-lg font-semibold">{metrics.processCapability}</p>
                  </div>
                </div>
                <Tooltip text={tooltips.processCapability} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ChartBarIcon className="h-6 w-6 text-indigo-500" />
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Cpk</p>
                    <p className="text-lg font-semibold">{metrics.cpk}</p>
                  </div>
                </div>
                <Tooltip text={tooltips.cpk} />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Nuevo Defecto
            {isAdvancedMode && <span className="text-sm text-blue-500 ml-2">(Modo Avanzado)</span>}
          </h2>
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    Tipo
                    <Tooltip text={tooltips.type} />
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Seleccionar tipo</option>
                    {defectTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    Fase
                    <Tooltip text={tooltips.phase} />
                  </label>
                  <select
                    name="phase"
                    value={formData.phase}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Seleccionar fase</option>
                    {processPhases.map(phase => (
                      <option key={phase} value={phase}>{phase}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  Descripción
                  <Tooltip text={tooltips.description} />
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="Descripción detallada del defecto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  Impacto
                  <Tooltip text={tooltips.impact} />
                </label>
                <input
                  type="text"
                  name="impact"
                  value={formData.impact}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="Impacto del defecto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  Causa Raíz
                  <Tooltip text={tooltips.rootCause} />
                </label>
                <input
                  type="text"
                  name="rootCause"
                  value={formData.rootCause}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="Causa raíz del defecto"
                />
              </div>

              {isAdvancedMode && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Impacto en Costos</label>
                      <input
                        type="number"
                        name="costImpact"
                        value={formData.costImpact}
                        onChange={handleInputChange}
                        className="w-full border rounded p-2"
                        placeholder="$ Impacto monetario"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Impacto en Tiempo</label>
                      <input
                        type="number"
                        name="timeImpact"
                        value={formData.timeImpact}
                        onChange={handleInputChange}
                        className="w-full border rounded p-2"
                        placeholder="Horas de impacto"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Acciones Correctivas</label>
                    <input
                      type="text"
                      name="correctiveActions"
                      value={formData.correctiveActions}
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                      placeholder="Acciones para corregir el defecto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Acciones Preventivas</label>
                    <input
                      type="text"
                      name="preventiveActions"
                      value={formData.preventiveActions}
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                      placeholder="Acciones para prevenir recurrencia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Método de Verificación</label>
                    <input
                      type="text"
                      name="verificationMethod"
                      value={formData.verificationMethod}
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                      placeholder="Cómo se verificará la efectividad"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    Prioridad
                    <Tooltip text={tooltips.priority} />
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Seleccionar prioridad</option>
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    DMAIC
                    <Tooltip text={tooltips.dmaic} />
                  </label>
                  <select
                    name="dmaic"
                    value={formData.dmaic}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  >
                    {dmaicPhases.map(phase => (
                      <option key={phase} value={phase}>{phase}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Actualizar Defecto
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    Tipo
                    <Tooltip text={tooltips.type} />
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Seleccionar tipo</option>
                    {defectTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    Fase
                    <Tooltip text={tooltips.phase} />
                  </label>
                  <select
                    name="phase"
                    value={formData.phase}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Seleccionar fase</option>
                    {processPhases.map(phase => (
                      <option key={phase} value={phase}>{phase}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  Descripción
                  <Tooltip text={tooltips.description} />
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="Descripción detallada del defecto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  Impacto
                  <Tooltip text={tooltips.impact} />
                </label>
                <input
                  type="text"
                  name="impact"
                  value={formData.impact}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="Impacto del defecto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  Causa Raíz
                  <Tooltip text={tooltips.rootCause} />
                </label>
                <input
                  type="text"
                  name="rootCause"
                  value={formData.rootCause}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  placeholder="Causa raíz del defecto"
                />
              </div>

              {isAdvancedMode && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Impacto en Costos</label>
                      <input
                        type="number"
                        name="costImpact"
                        value={formData.costImpact}
                        onChange={handleInputChange}
                        className="w-full border rounded p-2"
                        placeholder="$ Impacto monetario"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Impacto en Tiempo</label>
                      <input
                        type="number"
                        name="timeImpact"
                        value={formData.timeImpact}
                        onChange={handleInputChange}
                        className="w-full border rounded p-2"
                        placeholder="Horas de impacto"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Acciones Correctivas</label>
                    <input
                      type="text"
                      name="correctiveActions"
                      value={formData.correctiveActions}
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                      placeholder="Acciones para corregir el defecto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Acciones Preventivas</label>
                    <input
                      type="text"
                      name="preventiveActions"
                      value={formData.preventiveActions}
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                      placeholder="Acciones para prevenir recurrencia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Método de Verificación</label>
                    <input
                      type="text"
                      name="verificationMethod"
                      value={formData.verificationMethod}
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                      placeholder="Cómo se verificará la efectividad"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    Prioridad
                    <Tooltip text={tooltips.priority} />
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Seleccionar prioridad</option>
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center">
                    DMAIC
                    <Tooltip text={tooltips.dmaic} />
                  </label>
                  <select
                    name="dmaic"
                    value={formData.dmaic}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  >
                    {dmaicPhases.map(phase => (
                      <option key={phase} value={phase}>{phase}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Registrar Defecto
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Lista de Defectos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Historial de Defectos</h2>
          <div className="space-y-4">
            {defects.map((defect) => (
              <div key={defect.id} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-sm ${
                      defect.type === 'Crítico' ? 'bg-red-100 text-red-800' :
                      defect.type === 'Mayor' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {defect.type}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(defect.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(defect)}
                      className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(defect.id)}
                      className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Borrar
                    </button>
                  </div>
                </div>
                <p className="text-gray-900">{defect.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Impacto: {defect.impact}</p>
                  <p>Causa: {defect.rootCause}</p>
                  <div className="flex gap-4 mt-1">
                    <span>Fase: {defect.phase}</span>
                    <span>Prioridad: {defect.priority}</span>
                    <span>DMAIC: {defect.dmaic}</span>
                  </div>
                  {defect.isAdvanced && (
                    <div className="mt-2 border-t pt-2">
                      <p>Impacto en Costos: ${defect.costImpact}</p>
                      <p>Impacto en Tiempo: {defect.timeImpact}h</p>
                      <p>Acciones Correctivas: {defect.correctiveActions}</p>
                      <p>Acciones Preventivas: {defect.preventiveActions}</p>
                      <p>Verificación: {defect.verificationMethod}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {defects.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No hay defectos registrados
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
