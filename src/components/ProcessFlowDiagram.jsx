import { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

const nodeTypes = {
  process: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-primary-500">
      <div className="font-bold text-primary-500">{data.label}</div>
      <div className="text-gray-500">{data.description}</div>
    </div>
  ),
  start: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-full bg-green-500 text-white">
      <div className="font-bold">{data.label}</div>
    </div>
  ),
  end: ({ data }) => (
    <div className="px-4 py-2 shadow-md rounded-full bg-red-500 text-white">
      <div className="font-bold">{data.label}</div>
    </div>
  ),
  decision: ({ data }) => (
    <div className="px-4 py-2 shadow-md bg-yellow-100 border-2 border-yellow-500 rotate-45">
      <div className="font-bold text-yellow-700 -rotate-45">{data.label}</div>
      <div className="text-gray-500 -rotate-45">{data.description}</div>
    </div>
  ),
};

export default function ProcessFlowDiagram() {
  const [nodes, setNodes] = useState([
    {
      id: 'start',
      type: 'start',
      position: { x: 250, y: 0 },
      data: { label: 'Inicio' },
    },
  ]);
  
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [nodeForm, setNodeForm] = useState({
    type: 'process',
    label: '',
    description: '',
  });

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
    }, eds)),
    []
  );

  const addNode = (type) => {
    setNodeForm({
      type,
      label: '',
      description: '',
    });
    setShowNodeForm(true);
  };

  const handleNodeSubmit = (e) => {
    e.preventDefault();
    const newNode = {
      id: `node_${Date.now()}`,
      type: nodeForm.type,
      position: { 
        x: nodes.length * 100 + 100,
        y: nodes.length * 100 + 100
      },
      data: {
        label: nodeForm.label,
        description: nodeForm.description,
      },
    };
    setNodes([...nodes, newNode]);
    setShowNodeForm(false);
    setNodeForm({
      type: 'process',
      label: '',
      description: '',
    });
  };

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    setNodeForm({
      type: node.type,
      label: node.data.label,
      description: node.data.description || '',
    });
  };

  const updateSelectedNode = (e) => {
    e.preventDefault();
    if (!selectedNode) return;

    setNodes(nodes.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          data: {
            label: nodeForm.label,
            description: nodeForm.description,
          },
        };
      }
      return node;
    }));
    setSelectedNode(null);
    setNodeForm({
      type: 'process',
      label: '',
      description: '',
    });
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) return;
    setNodes(nodes.filter(node => node.id !== selectedNode.id));
    setEdges(edges.filter(edge => 
      edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ));
    setSelectedNode(null);
  };

  return (
    <div className="space-y-4">
      {/* Barra de herramientas */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-secondary-700 rounded-lg">
        <button
          onClick={() => addNode('process')}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
        >
          Añadir Proceso
        </button>
        <button
          onClick={() => addNode('decision')}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
        >
          Añadir Decisión
        </button>
        <button
          onClick={() => addNode('end')}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Añadir Fin
        </button>
        {selectedNode && (
          <button
            onClick={deleteSelectedNode}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Eliminar Nodo
          </button>
        )}
      </div>

      {/* Formulario para nuevo nodo o edición */}
      {(showNodeForm || selectedNode) && (
        <div className="p-4 bg-white dark:bg-secondary-800 rounded-lg shadow">
          <form onSubmit={selectedNode ? updateSelectedNode : handleNodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Etiqueta
              </label>
              <input
                type="text"
                value={nodeForm.label}
                onChange={(e) => setNodeForm({ ...nodeForm, label: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción
              </label>
              <textarea
                value={nodeForm.description}
                onChange={(e) => setNodeForm({ ...nodeForm, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-900 dark:text-white"
                rows="3"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
              >
                {selectedNode ? 'Actualizar' : 'Agregar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNodeForm(false);
                  setSelectedNode(null);
                  setNodeForm({
                    type: 'process',
                    label: '',
                    description: '',
                  });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 dark:bg-secondary-600 dark:text-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Área del diagrama */}
      <div className="h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* Instrucciones */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p className="font-medium mb-2">Instrucciones:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Usa los botones superiores para añadir diferentes tipos de nodos</li>
          <li>Arrastra los nodos para moverlos</li>
          <li>Conecta los nodos arrastrando desde los puntos de conexión</li>
          <li>Haz clic en un nodo para editarlo o eliminarlo</li>
          <li>Usa la rueda del ratón para hacer zoom</li>
          <li>Arrastra el fondo para mover el diagrama</li>
        </ul>
      </div>
    </div>
  );
}
