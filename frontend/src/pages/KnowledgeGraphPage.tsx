import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import {
  Network,
  Search,
  Filter,
  Maximize2,
  RefreshCw,
  Info,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { GraphData, GraphNode, GraphEdge } from '../types';

export const KnowledgeGraphPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [depth, setDepth] = useState<number>(1);
  const [layoutName, setLayoutName] = useState<string>('cose');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadGraph();
  }, [depth]);

  const loadGraph = async (centerId?: string) => {
    try {
      setLoading(true);
      const data = await api.getGraph(centerId, depth, 150);
      setGraphData(data);
      renderCytoscape(data);
    } catch (err) {
      console.error('Failed to load knowledge graph', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCytoscape = (data: GraphData) => {
    if (!containerRef.current) return;

    // Filter nodes if needed
    const filteredNodes = typeFilter === 'all'
      ? data.nodes
      : data.nodes.filter(n => n.type.toLowerCase() === typeFilter.toLowerCase());

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = data.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    const elements: any[] = [
      ...filteredNodes.map(n => ({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          ...n.properties
        }
      })),
      ...filteredEdges.map(e => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.type
        }
      }))
    ];

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#0f172a',
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-margin-y': 4,
            'background-color': '#64748b',
            'width': 28,
            'height': 28,
            'border-width': 2,
            'border-color': '#ffffff'
          }
        },
        {
          selector: 'node[type = "Plant"]',
          style: {
            'background-color': '#059669',
            'width': 36,
            'height': 36,
            'font-size': '11px',
            'font-weight': 'bold'
          }
        },
        {
          selector: 'node[type = "LocalName"]',
          style: {
            'background-color': '#d97706',
            'width': 24,
            'height': 24
          }
        },
        {
          selector: 'node[type = "TraditionalUse"]',
          style: {
            'background-color': '#0d9488',
            'width': 26,
            'height': 26
          }
        },
        {
          selector: 'node[type = "Compound"]',
          style: {
            'background-color': '#7c3aed',
            'width': 26,
            'height': 26
          }
        },
        {
          selector: 'node[type = "PlantFamily"]',
          style: {
            'background-color': '#16a34a',
            'width': 30,
            'height': 30
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#cbd5e1',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8px',
            'color': '#64748b',
            'text-rotation': 'autorotate',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.85,
            'text-background-padding': '1px'
          }
        },
        {
          selector: ':selected',
          style: {
            'border-width': 3,
            'border-color': '#0284c7',
            'line-color': '#0284c7',
            'target-arrow-color': '#0284c7'
          }
        }
      ],
      layout: {
        name: layoutName as any,
        animate: false,
        padding: 30
      }
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode({
        id: node.id(),
        label: node.data('label'),
        type: node.data('type'),
        properties: node.data()
      });
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cyRef.current = cy;
  };

  const handleSearchNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cyRef.current || !searchTerm) return;
    const matched = cyRef.current.nodes().filter((n) =>
      n.data('label').toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (matched.length > 0) {
      cyRef.current.nodes().unselect();
      matched.select();
      cyRef.current.animate({
        center: { eles: matched },
        zoom: 1.5,
        duration: 400
      });
      setSelectedNode({
        id: matched[0].id(),
        label: matched[0].data('label'),
        type: matched[0].data('type'),
        properties: matched[0].data()
      });
    }
  };

  return (
    <div className="h-[calc(100vh-1rem)] flex flex-col p-4 max-w-[1700px] mx-auto space-y-3">
      {/* Graph Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e9e4]">
        <div>
          <h1 className="text-xl font-bold text-[#0d281e]">Ethnobotanical Knowledge Graph</h1>
          <p className="text-xs text-slate-600">
            Interactive network graph connecting botanical taxa, vernacular homonyms, medicinal claims, and bioactive phytoconstituents.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearchNode} className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find node (e.g. Neem, Curcumin)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 w-48"
            />
          </form>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              if (graphData) renderCytoscape(graphData);
            }}
            className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="all">All Node Types</option>
            <option value="plant">Plant</option>
            <option value="localname">Local Name</option>
            <option value="traditionaluse">Traditional Use</option>
            <option value="compound">Compound</option>
            <option value="plantfamily">Family</option>
          </select>

          <select
            value={layoutName}
            onChange={(e) => {
              setLayoutName(e.target.value);
              if (graphData) renderCytoscape(graphData);
            }}
            className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="cose">Force-Directed (CoSE)</option>
            <option value="concentric">Concentric</option>
            <option value="circle">Circular</option>
            <option value="breadthfirst">Hierarchical</option>
          </select>

          <button
            onClick={() => loadGraph()}
            className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs"
            title="Reset Graph"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Graph Canvas and Inspector */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Cytoscape Canvas (9 Cols) */}
        <div className="lg:col-span-9 bg-white border border-[#e5e9e4] rounded-xl overflow-hidden relative shadow-xs flex flex-col">
          {/* Legend Bar */}
          <div className="p-2.5 bg-slate-50 border-b border-[#e5e9e4] flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-800">Node Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Plant Binomial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span>Vernacular / Local Name</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              <span>Traditional Use</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span>Bioactive Compound</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
              <span>Botanical Family</span>
            </div>
          </div>

          <div ref={containerRef} className="flex-1 w-full h-full bg-[#fafbfa]" />

          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-slate-500 font-mono">
              Rendering knowledge graph layout...
            </div>
          )}
        </div>

        {/* Right Inspector Panel (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-[#e5e9e4] rounded-xl p-4 overflow-y-auto shadow-xs flex flex-col">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e5e9e4] mb-3">
            <Info className="w-4 h-4 text-emerald-700" />
            <h3 className="font-semibold text-xs text-slate-800">Graph Node Inspector</h3>
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  {selectedNode.type}
                </span>
                <h4 className="text-base font-bold text-[#0d281e] font-serif mt-1">
                  {selectedNode.label}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedNode.id}</p>
              </div>

              {/* Node properties */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Attributes</span>
                {Object.entries(selectedNode.properties)
                  .filter(([k]) => !['id', 'label', 'type'].includes(k))
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[11px]">
                      <span className="text-slate-500 capitalize">{k.replace('_', ' ')}:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[140px]">{String(v)}</span>
                    </div>
                  ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => loadGraph(selectedNode.id)}
                  className="w-full py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium transition-colors"
                >
                  Expand 1-Hop Ego Network
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-400 text-xs">
              <Network className="w-8 h-8 text-slate-300 mb-2" />
              <p>Click on any graph node to inspect relationships, evidence links, and taxonomic properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
