import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Paper,
  InputAdornment,
} from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const SixSigmaCalculator = () => {
  const [inputs, setInputs] = useState({
    defects: '',
    units: '',
    opportunities: ''
  });
  const [results, setResults] = useState({
    sigmaLevel: 0,
    dpmo: 0,
    processYield: 0,
    rty: 0,
    dpu: 0,
    dpm: 0
  });

  const calculateMetrics = () => {
    if (!inputs.defects || !inputs.units || !inputs.opportunities) return;

    const defects = parseFloat(inputs.defects);
    const units = parseFloat(inputs.units);
    const opportunities = parseFloat(inputs.opportunities);

    const dpu = defects / units;
    const dpmo = (defects / (units * opportunities)) * 1000000;
    const processYield = (1 - (defects / (units * opportunities))) * 100;
    const sigmaLevel = 0.8406 + Math.sqrt(29.37 - 2.221 * Math.log(dpmo));
    const rty = Math.exp(-dpu) * 100;
    const dpm = (defects / units) * 1000000;

    setResults({
      sigmaLevel: sigmaLevel.toFixed(2),
      dpmo: dpmo.toFixed(0),
      processYield: processYield.toFixed(2),
      rty: rty.toFixed(2),
      dpu: dpu.toFixed(4),
      dpm: dpm.toFixed(0)
    });
  };

  useEffect(() => {
    calculateMetrics();
  }, [inputs]);

  const getChartData = () => {
    const sigmaLevel = parseFloat(results.sigmaLevel);
    const remaining = 6 - sigmaLevel;
    
    return {
      labels: ['Nivel Sigma Actual', 'Restante para 6σ'],
      datasets: [
        {
          data: [sigmaLevel, remaining],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(211, 211, 211, 0.3)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(211, 211, 211, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw.toFixed(2)}σ`;
          }
        }
      }
    }
  };

  const ResultCard = ({ label, value, unit }) => (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300 mb-1">
        {label}
      </Typography>
      <Typography variant="h5" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold">
        {value}{unit}
      </Typography>
    </div>
  );

  const getInterpretation = (data) => {
    if (!data || !data.sigmaLevel) return null;

    const sigmaLevel = parseFloat(data.sigmaLevel);
    let interpretation = '';

    if (sigmaLevel < 3) {
      interpretation = 'El proceso necesita mejoras significativas. Un nivel Sigma por debajo de 3 indica una alta variabilidad y defectos frecuentes.';
    } else if (sigmaLevel < 4) {
      interpretation = 'El proceso está por encima del promedio pero aún hay espacio para mejora. Un nivel Sigma entre 3 y 4 es común en la industria.';
    } else if (sigmaLevel < 5) {
      interpretation = 'Buen control del proceso. Un nivel Sigma entre 4 y 5 indica un proceso bien gestionado con pocos defectos.';
    } else {
      interpretation = 'Excelente control del proceso. Un nivel Sigma por encima de 5 representa un proceso de alta calidad con muy pocos defectos.';
    }

    return (
      <Card className="mt-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent>
          <Typography variant="h6" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold mb-4">
            Interpretación de Resultados
          </Typography>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
              <Typography variant="subtitle1" className="text-blue-700 dark:text-blue-300 font-medium mb-2">
                1. Nivel Sigma ({data.sigmaLevel}σ)
              </Typography>
              <Typography className="text-gray-600 dark:text-gray-300">
                {interpretation}
              </Typography>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
              <Typography variant="subtitle1" className="text-green-700 dark:text-green-300 font-medium mb-2">
                2. DPMO ({parseInt(data.dpmo).toLocaleString()})
              </Typography>
              <Typography className="text-gray-600 dark:text-gray-300">
                Se esperan {parseInt(data.dpmo).toLocaleString()} defectos por cada millón de oportunidades.
              </Typography>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-4">
              <Typography variant="subtitle1" className="text-purple-700 dark:text-purple-300 font-medium mb-2">
                3. Rendimiento ({data.processYield}%)
              </Typography>
              <Typography className="text-gray-600 dark:text-gray-300">
                El {data.processYield}% de las unidades cumplen con las especificaciones.
              </Typography>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-4">
              <Typography variant="subtitle1" className="text-yellow-700 dark:text-yellow-300 font-medium mb-2">
                4. RTY ({data.rty}%)
              </Typography>
              <Typography className="text-gray-600 dark:text-gray-300">
                El {data.rty}% de las unidades completan el proceso sin ningún defecto.
              </Typography>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg p-4">
              <Typography variant="subtitle1" className="text-red-700 dark:text-red-300 font-medium mb-2">
                5. DPU ({data.dpu})
              </Typography>
              <Typography className="text-gray-600 dark:text-gray-300">
                En promedio, hay {data.dpu} defectos por unidad producida.
              </Typography>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4">
              <Typography variant="subtitle1" className="text-orange-700 dark:text-orange-300 font-medium mb-2">
                6. DPM ({parseInt(data.dpm).toLocaleString()})
              </Typography>
              <Typography className="text-gray-600 dark:text-gray-300">
                Se producen {parseInt(data.dpm).toLocaleString()} defectos por cada millón de unidades.
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 dark:bg-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <Typography variant="h4" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold mb-2">
            Calculadora Six Sigma
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600 dark:text-gray-300">
            Calcula métricas clave de Six Sigma para tu proceso
          </Typography>
        </div>

        <Grid container spacing={4}>
          {/* Panel de Entrada */}
          <Grid item xs={12} md={4}>
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent>
                <Typography variant="h6" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold mb-6">
                  Datos de Entrada
                </Typography>
                <div className="space-y-6">
                  <TextField
                    fullWidth
                    label="Número de Defectos"
                    type="number"
                    value={inputs.defects}
                    onChange={(e) => setInputs({...inputs, defects: e.target.value})}
                    className="bg-white dark:bg-gray-600"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">#</InputAdornment>,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Número de Unidades"
                    type="number"
                    value={inputs.units}
                    onChange={(e) => setInputs({...inputs, units: e.target.value})}
                    className="bg-white dark:bg-gray-600"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">#</InputAdornment>,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Oportunidades por Unidad"
                    type="number"
                    value={inputs.opportunities}
                    onChange={(e) => setInputs({...inputs, opportunities: e.target.value})}
                    className="bg-white dark:bg-gray-600"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">#</InputAdornment>,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Panel de Resultados */}
          <Grid item xs={12} md={4}>
            <div className="space-y-4">
              <ResultCard 
                label="Nivel Sigma"
                value={results.sigmaLevel}
                unit="σ"
              />
              <ResultCard 
                label="DPMO"
                value={parseInt(results.dpmo).toLocaleString()}
                unit=""
              />
              <ResultCard 
                label="Rendimiento"
                value={results.processYield}
                unit="%"
              />
              <ResultCard 
                label="RTY"
                value={results.rty}
                unit="%"
              />
              <ResultCard 
                label="DPU"
                value={results.dpu}
                unit=""
              />
              <ResultCard 
                label="DPM"
                value={parseInt(results.dpm).toLocaleString()}
                unit=""
              />
            </div>
          </Grid>

          {/* Gráfico Sigma */}
          <Grid item xs={12} md={4}>
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent>
                <Typography variant="h6" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold mb-4 text-center">
                  Nivel Sigma Actual
                </Typography>
                <div className="relative" style={{ height: '300px' }}>
                  <Doughnut data={getChartData()} options={chartOptions} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Typography variant="h3" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold">
                        {results.sigmaLevel}σ
                      </Typography>
                      <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                        de 6σ
                      </Typography>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabla de Conversión */}
        <Card className="mt-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent>
            <Typography variant="h6" className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold mb-4">
              Tabla de Conversión Sigma
            </Typography>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nivel Sigma
                    </th>
                    <th className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      DPMO
                    </th>
                    <th className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rendimiento
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                  {[
                    { sigma: 2, dpmo: 308537, yield: 69.1463 },
                    { sigma: 3, dpmo: 66807, yield: 93.3193 },
                    { sigma: 4, dpmo: 6210, yield: 99.3790 },
                    { sigma: 5, dpmo: 233, yield: 99.9767 },
                    { sigma: 6, dpmo: 3.4, yield: 99.99966 },
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {row.sigma}σ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.dpmo.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.yield}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Interpretación */}
        {getInterpretation(results)}
      </div>
    </div>
  );
};

export default SixSigmaCalculator;
