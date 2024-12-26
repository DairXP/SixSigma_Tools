import React, { useState, useEffect } from 'react';
import { FaSave, FaTrash, FaEdit, FaLightbulb } from 'react-icons/fa';

const colors = {
  primary: '#1e3a8a',
  secondary: '#3b82f6',
  accent: '#60a5fa',
  background: '#f0f9ff',
  text: '#1e293b',
  textLight: '#64748b',
  success: '#059669',
  danger: '#dc2626',
  border: '#cbd5e1'
};

export default function FiveWhysAnalysis({ data, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [currentData, setCurrentData] = useState(data || {
    problem: '',
    whys: ['', '', '', '', ''],
    conclusion: ''
  });

  useEffect(() => {
    if (data) {
      setCurrentData(data);
    }
  }, [data]);

  const handleChange = (field, value) => {
    const newData = { ...currentData };
    if (field === 'problem') {
      newData.problem = value;
    } else if (field === 'conclusion') {
      newData.conclusion = value;
    } else {
      const index = parseInt(field.replace('why', '')) - 1;
      newData.whys[index] = value;
    }
    setCurrentData(newData);
  };

  const generateConclusion = () => {
    const lastWhy = currentData.whys[4];
    if (currentData.problem && lastWhy) {
      const conclusion = `La causa raíz del problema "${currentData.problem}" parece ser: ${lastWhy}`;
      handleChange('conclusion', conclusion);
    }
  };

  const handleSave = () => {
    generateConclusion();
    onUpdate({
      type: 'UPDATE_FIVE_WHYS',
      data: currentData
    });
    setEditing(false);
  };

  const questions = [
    '¿Por qué ocurre el problema?',
    '¿Por qué ocurre eso?',
    '¿Y por qué sucede eso?',
    '¿Cuál es la razón de eso?',
    '¿Y finalmente, por qué?'
  ];

  return (
    <div className="five-whys-container" style={{
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '2rem',
          backgroundColor: colors.background,
          padding: '1rem',
          borderRadius: '0.5rem'
        }}>
          <FaLightbulb style={{ color: colors.primary, fontSize: '1.75rem' }} />
          <h2 style={{ 
            color: colors.primary,
            fontSize: '1.5rem',
            fontWeight: '600',
            margin: 0
          }}>
            Análisis 5 Por Qués
          </h2>
        </div>

        <p style={{
          color: colors.textLight,
          marginBottom: '2rem',
          fontSize: '1rem',
          lineHeight: '1.6'
        }}>
          Encuentra la causa raíz del problema mediante un análisis sistemático de sus causas.
          Responde cada "por qué" de manera específica y basada en hechos observables.
        </p>
        
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ 
            display: 'block',
            color: colors.text,
            marginBottom: '0.5rem',
            fontWeight: '500'
          }}>
            Problema a analizar:
          </label>
          {editing ? (
            <textarea
              value={currentData.problem}
              onChange={(e) => handleChange('problem', e.target.value)}
              placeholder="Describe el problema específico que quieres resolver..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: `1px solid ${colors.border}`,
                marginBottom: '0.5rem',
                minHeight: '80px',
                resize: 'vertical',
                backgroundColor: 'white',
                color: colors.text,
                outline: 'none',
                transition: 'border-color 0.2s',
                ':focus': {
                  borderColor: colors.secondary
                }
              }}
            />
          ) : (
            <div style={{
              padding: '0.75rem',
              backgroundColor: colors.background,
              borderRadius: '0.5rem',
              border: `1px solid ${colors.border}`,
              minHeight: '60px',
              color: colors.text
            }}>
              {currentData.problem || 'No definido'}
            </div>
          )}
        </div>

        {questions.map((question, index) => (
          <div key={index} style={{ 
            marginBottom: '1.5rem',
            backgroundColor: editing ? 'white' : colors.background,
            padding: '1.25rem',
            borderRadius: '0.5rem',
            border: `1px solid ${colors.border}`,
            transition: 'all 0.2s'
          }}>
            <label style={{ 
              display: 'block',
              color: colors.primary,
              marginBottom: '0.75rem',
              fontWeight: '500'
            }}>
              {`${index + 1}. ${question}`}
            </label>
            {editing ? (
              <textarea
                value={currentData.whys[index]}
                onChange={(e) => handleChange(`why${index + 1}`, e.target.value)}
                placeholder="Responde de manera específica y basada en hechos..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${colors.border}`,
                  marginBottom: '0.5rem',
                  minHeight: '60px',
                  resize: 'vertical',
                  backgroundColor: 'white',
                  color: colors.text,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  ':focus': {
                    borderColor: colors.secondary
                  }
                }}
              />
            ) : (
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: `1px solid ${colors.border}`,
                minHeight: '40px',
                color: colors.text
              }}>
                {currentData.whys[index] || 'No definido'}
              </div>
            )}
          </div>
        ))}

        <div style={{
          marginTop: '2rem',
          backgroundColor: colors.background,
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.border}`
        }}>
          <h3 style={{
            color: colors.primary,
            marginBottom: '1rem',
            fontSize: '1.25rem',
            fontWeight: '600'
          }}>
            Conclusión del Análisis
          </h3>
          {editing ? (
            <textarea
              value={currentData.conclusion}
              onChange={(e) => handleChange('conclusion', e.target.value)}
              placeholder="La conclusión se generará automáticamente al guardar..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: `1px solid ${colors.border}`,
                marginBottom: '0.5rem',
                minHeight: '80px',
                resize: 'vertical',
                backgroundColor: 'white',
                color: colors.text,
                outline: 'none'
              }}
              readOnly
            />
          ) : (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: `1px solid ${colors.border}`,
              minHeight: '60px',
              color: colors.text
            }}>
              {currentData.conclusion || 'Complete el análisis para generar la conclusión'}
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          {editing ? (
            <>
              <button
                onClick={handleSave}
                style={{
                  backgroundColor: colors.primary,
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: colors.secondary
                  }
                }}
              >
                <FaSave /> Guardar Análisis
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  backgroundColor: 'white',
                  color: colors.danger,
                  border: `1px solid ${colors.danger}`,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: colors.danger,
                    color: 'white'
                  }
                }}
              >
                <FaTrash /> Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={{
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                ':hover': {
                  backgroundColor: colors.secondary
                }
              }}
            >
              <FaEdit /> Editar Análisis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
