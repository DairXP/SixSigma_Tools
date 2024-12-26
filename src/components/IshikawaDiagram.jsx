import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave } from 'react-icons/fa';
import './IshikawaDiagram.css';

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Mano de obra', causes: [], position: 'top', color: '#FF6B6B' },
  { id: '2', name: 'Método', causes: [], position: 'top', color: '#4ECDC4' },
  { id: '3', name: 'Material', causes: [], position: 'bottom', color: '#45B7D1' },
  { id: '4', name: 'Máquina', causes: [], position: 'bottom', color: '#96CEB4' }
];

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

export default function IshikawaDiagram({ data = { categories: [] }, onUpdate }) {
  // Estados para el efecto principal
  const [editingEffect, setEditingEffect] = useState(false);
  const [effectText, setEffectText] = useState(data.effect || 'ELABORACIÓN DE CHICHA DE QUINUA');

  // Estados para las causas
  const [editingCause, setEditingCause] = useState(null);
  const [editingCauseName, setEditingCauseName] = useState('');
  const [addingCause, setAddingCause] = useState(false);
  const [newCauseName, setNewCauseName] = useState('');

  // Estados para las subcausas
  const [addingSubcause, setAddingSubcause] = useState(null);
  const [newSubcauseText, setNewSubcauseText] = useState('');

  // Inicializar con categorías por defecto
  useEffect(() => {
    if (!data.categories || data.categories.length === 0) {
      onUpdate({
        type: 'INIT_CATEGORIES',
        categories: DEFAULT_CATEGORIES
      });
    }
  }, []);

  // Manejadores para el efecto principal
  const handleEffectSave = () => {
    if (effectText.trim()) {
      onUpdate({
        type: 'UPDATE_EFFECT',
        effect: effectText.trim()
      });
      setEditingEffect(false);
    }
  };

  // Manejadores para las causas
  const handleEditCause = (categoryId) => {
    const category = data.categories.find(cat => cat.id === categoryId);
    if (category) {
      setEditingCause(categoryId);
      setEditingCauseName(category.name);
    }
  };

  const handleSaveCauseName = (categoryId) => {
    if (editingCauseName.trim()) {
      onUpdate({
        type: 'UPDATE_CATEGORY',
        categoryId,
        name: editingCauseName.trim()
      });
      setEditingCause(null);
      setEditingCauseName('');
    }
  };

  const handleAddCause = () => {
    if (newCauseName.trim()) {
      const newId = (data.categories.length + 1).toString();
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFD93D', '#6C5B7B'];
      const colorIndex = data.categories.length % colors.length;
      
      onUpdate({
        type: 'ADD_CATEGORY',
        name: newCauseName.trim(),
        position: data.categories.length % 2 === 0 ? 'top' : 'bottom',
        color: colors[colorIndex]
      });
      setNewCauseName('');
      setAddingCause(false);
    }
  };

  const handleDeleteCause = (categoryId) => {
    if (window.confirm('¿Estás seguro de eliminar esta causa y todas sus subcausas?')) {
      onUpdate({
        type: 'DELETE_CATEGORY',
        categoryId
      });
    }
  };

  // Manejadores para las subcausas
  const handleAddSubcause = (categoryId) => {
    if (newSubcauseText.trim()) {
      const newSubcause = {
        id: Date.now().toString(),
        text: newSubcauseText.trim()
      };
      
      onUpdate({
        type: 'ADD_SUBCAUSE',
        categoryId,
        subcause: newSubcause
      });
      
      setNewSubcauseText('');
      setAddingSubcause(null);
    }
  };

  const handleDeleteSubcause = (categoryId, causeId) => {
    onUpdate({
      type: 'DELETE_SUBCAUSE',
      categoryId,
      causeId
    });
  };

  return (
    <div className="ishikawa-container">
      <div className="fish-diagram">
        <div className="fish-spine" />

        <div className="fish-head">
          <div className="effect-box">
            {editingEffect ? (
              <div className="input-form">
                <input
                  type="text"
                  value={effectText}
                  onChange={(e) => setEffectText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleEffectSave()}
                  className="input-field"
                  placeholder="Efecto principal"
                  autoFocus
                />
                <div className="form-buttons">
                  <button onClick={handleEffectSave} className="btn-save">
                    <FaSave />
                  </button>
                  <button onClick={() => setEditingEffect(false)} className="btn-cancel">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ) : (
              <div className="effect-text" onClick={() => setEditingEffect(true)}>
                {effectText}
              </div>
            )}
          </div>
        </div>

        <div className="causes-container">
          {data.categories?.map((category, index) => (
            <div key={category.id} className="cause-group">
              <div className="cause-line" />
              
              <div className="cause-main">
                {editingCause === category.id ? (
                  <div className="input-form">
                    <input
                      type="text"
                      value={editingCauseName}
                      onChange={(e) => setEditingCauseName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveCauseName(category.id)}
                      className="input-field"
                      placeholder="Nombre de la causa"
                      autoFocus
                    />
                    <div className="form-buttons">
                      <button onClick={() => handleSaveCauseName(category.id)} className="btn-save">
                        <FaSave />
                      </button>
                      <button onClick={() => setEditingCause(null)} className="btn-cancel">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="cause-header">
                    <span>{category.name}</span>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditCause(category.id)}
                        className="btn-edit"
                        title="Editar causa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setAddingSubcause(category.id)}
                        className="btn-add"
                        title="Agregar subcausa"
                      >
                        <FaPlus />
                      </button>
                      <button
                        onClick={() => handleDeleteCause(category.id)}
                        className="btn-delete"
                        title="Eliminar causa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}

                <div className="subcauses-container">
                  {category.causes?.map((cause) => (
                    <div key={cause.id} className="subcause" style={{ 
                      backgroundColor: 'white', 
                      color: '#8B0000', 
                      border: '1px solid #8B0000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      height: '2.5rem',
                      padding: '0 1rem',
                      margin: '0.5rem 0',
                      borderRadius: '0.375rem',
                      fontWeight: '500'
                    }}>
                      <span>{cause.text}</span>
                      <button
                        onClick={() => handleDeleteSubcause(category.id, cause.id)}
                        className="btn-delete"
                        style={{
                          color: '#8B0000',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Eliminar subcausa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}

                  {addingSubcause === category.id && (
                    <div className="input-form" style={{
                      backgroundColor: 'white',
                      border: '1px solid #8B0000',
                      borderRadius: '0.375rem',
                      padding: '0.5rem',
                      margin: '0.5rem 0'
                    }}>
                      <input
                        type="text"
                        value={newSubcauseText}
                        onChange={(e) => setNewSubcauseText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSubcause(category.id)}
                        className="input-field"
                        placeholder="Nueva subcausa"
                        style={{
                          color: '#8B0000',
                          border: 'none',
                          outline: 'none',
                          width: '100%',
                          padding: '0.5rem'
                        }}
                        autoFocus
                      />
                      <div className="form-buttons" style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '0.5rem'
                      }}>
                        <button 
                          onClick={() => handleAddSubcause(category.id)} 
                          className="btn-save"
                          style={{
                            backgroundColor: '#8B0000',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '0.25rem',
                            cursor: 'pointer'
                          }}
                        >
                          <FaSave />
                        </button>
                        <button 
                          onClick={() => setAddingSubcause(null)} 
                          className="btn-cancel"
                          style={{
                            backgroundColor: 'white',
                            color: '#8B0000',
                            border: '1px solid #8B0000',
                            padding: '0.5rem',
                            borderRadius: '0.25rem',
                            cursor: 'pointer'
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Botón para agregar nueva causa dentro del diagrama */}
          <button
            className="btn-add-ishikawa"
            onClick={() => setAddingCause(true)}
            title="Agregar nueva causa"
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
              margin: '1rem auto',
              fontSize: '1rem',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: colors.secondary,
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <FaPlus /> Nueva Causa
          </button>
        </div>

        {addingCause && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div className="input-form add-cause-form" style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              width: '90%',
              maxWidth: '400px'
            }}>
              <h3 style={{ 
                color: '#8B0000', 
                marginBottom: '1rem',
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>
                Agregar Nueva Causa
              </h3>
              <input
                type="text"
                value={newCauseName}
                onChange={(e) => setNewCauseName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCause()}
                className="input-field"
                placeholder="Nombre de la causa"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #8B0000',
                  marginBottom: '1rem',
                  color: '#8B0000',
                  outline: 'none'
                }}
                autoFocus
              />
              <div className="form-buttons" style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end'
              }}>
                <button 
                  onClick={handleAddCause} 
                  className="btn-save"
                  style={{
                    backgroundColor: '#8B0000',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem'
                  }}
                >
                  <FaSave /> Guardar
                </button>
                <button 
                  onClick={() => setAddingCause(false)} 
                  className="btn-cancel"
                  style={{
                    backgroundColor: 'white',
                    color: '#8B0000',
                    border: '1px solid #8B0000',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem'
                  }}
                >
                  <FaTrash /> Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
