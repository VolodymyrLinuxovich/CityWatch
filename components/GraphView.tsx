
import React from 'react';

interface NodePos {
  id: string;
  x: number;
  y: number;
  color: string;
}

const NODES: NodePos[] = [
  { id: "Road Network", x: 100, y: 150, color: "#4f46e5" },
  { id: "Power Plants", x: 100, y: 300, color: "#eab308" },
  { id: "Water Treatment Plants", x: 100, y: 450, color: "#06b6d4" },
  { id: "Labor Market System", x: 100, y: 600, color: "#ec4899" },
  { id: "Local Bus", x: 500, y: 200, color: "#f97316" },
  { id: "Light Rail Transit", x: 500, y: 400, color: "#8b5cf6" },
  { id: "Bike Share", x: 500, y: 600, color: "#10b981" },
];

const EDGES = [
  ["Road Network", "Local Bus"],
  ["Road Network", "Light Rail Transit"],
  ["Road Network", "Bike Share"],
  ["Power Plants", "Local Bus"],
  ["Power Plants", "Light Rail Transit"],
  ["Water Treatment Plants", "Local Bus"],
  ["Water Treatment Plants", "Light Rail Transit"],
  ["Labor Market System", "Local Bus"],
  ["Labor Market System", "Light Rail Transit"],
];

interface GraphViewProps {
  affectedNodes: string[];
}

const GraphView: React.FC<GraphViewProps> = ({ affectedNodes }) => {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm overflow-hidden">
      <div className="mb-6">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">System Propagation Map</h3>
        <p className="text-sm text-gray-500 font-medium">Visualization of interconnected urban nodes and impact flow.</p>
      </div>
      <div className="relative aspect-[16/9] w-full max-h-[400px]">
        <svg viewBox="0 0 700 750" className="w-full h-full">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map(([fromId, toId], i) => {
            const from = NODES.find(n => n.id === fromId)!;
            const to = NODES.find(n => n.id === toId)!;
            const isAffected = affectedNodes.includes(fromId);
            return (
              <line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={isAffected ? "#818cf8" : "#e5e7eb"}
                strokeWidth={isAffected ? 3 : 1}
                strokeDasharray={isAffected ? "none" : "4 2"}
                markerEnd="url(#arrowhead)"
              />
            );
          })}

          {/* Nodes */}
          {NODES.map(node => {
            const isAffected = affectedNodes.includes(node.id);
            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r={isAffected ? 45 : 35}
                  fill="white"
                  stroke={node.color}
                  strokeWidth={isAffected ? 4 : 2}
                  className="transition-all duration-500"
                />
                <text
                  textAnchor="middle"
                  dy=".3em"
                  fontSize="10"
                  fontWeight="900"
                  className="uppercase tracking-tighter"
                  fill="#374151"
                >
                  {node.id.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default GraphView;
