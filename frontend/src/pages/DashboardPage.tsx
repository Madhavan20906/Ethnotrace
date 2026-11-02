import React, { useEffect, useState } from 'react';
import {
  FileText,
  Sprout,
  CheckCircle,
  AlertCircle,
  Network,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Languages,
  Layers,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsOverview } from '../types';

interface DashboardProps {
  onNavigate: (tabId: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalyticsOverview();
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Aggregating scientific database metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs">
          <strong>Database Connection Warning:</strong> {error || 'No metrics returned.'}
          <button onClick={loadOverview} className="ml-3 underline font-medium">Retry</button>
        </div>
      </div>
    );
  }

  const { metrics, distributions } = data;

  const statCards = [
    { label: 'Processed Documents', value: `${metrics.processed_documents} / ${metrics.total_documents}`, icon: FileText, color: 'text-blue-700', bg: 'bg-blue-50', link: 'documents' },
    { label: 'Verified Botanical Species', value: metrics.verified_botanical_identities, icon: Sprout, color: 'text-emerald-700', bg: 'bg-emerald-50', link: 'botanical' },
    { label: 'Documented Traditional Uses', value: metrics.traditional_use_reports, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', link: 'evidence' },
    { label: 'Scientific Evidence Records', value: metrics.evidence_records, icon: ShieldAlert, color: 'text-purple-700', bg: 'bg-purple-50', link: 'evidence' },
    { label: 'Knowledge Graph Nodes', value: metrics.knowledge_graph_nodes, icon: Network, color: 'text-teal-700', bg: 'bg-teal-50', link: 'graph' },
    { label: 'Pending Human Reviews', value: metrics.pending_reviews, icon: AlertCircle, color: 'text-rose-700', bg: 'bg-rose-50', link: 'audit' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e9e4]">
        <div>
          <h1 className="text-2xl font-bold text-[#0d281e] tracking-tight">Research Intelligence Dashboard</h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time scientific metrics from the ethnobotanical repository, POWO taxonomic index, and knowledge graph.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('documents')}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ingest Document</span>
          </button>
          <button
            onClick={() => onNavigate('copilot')}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>Research Copilot</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.link)}
              className="p-4 bg-white border border-[#e5e9e4] rounded-xl hover:border-emerald-500/50 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div className="text-xl font-bold text-slate-900">{card.value}</div>
              <div className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Distribution Breakdown Charts & Visual Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plant Families */}
        <div className="p-5 bg-white border border-[#e5e9e4] rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <h3 className="font-semibold text-sm text-slate-900">Botanical Families Distribution</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">POWO Taxonomy</span>
          </div>

          <div className="space-y-3">
            {distributions.plant_families.slice(0, 5).map((fam, i) => {
              const maxCount = Math.max(...distributions.plant_families.map(f => f.count), 1);
              const pct = Math.round((fam.count / maxCount) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{fam.family}</span>
                    <span className="text-slate-500 font-mono">{fam.count} taxa</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(10, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evidence Tiers */}
        <div className="p-5 bg-white border border-[#e5e9e4] rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-700" />
              <h3 className="font-semibold text-sm text-slate-900">Evidence Classification Tiers</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Methodology Audit</span>
          </div>

          <div className="space-y-3">
            {distributions.evidence_categories.slice(0, 5).map((tier, i) => {
              const maxCount = Math.max(...distributions.evidence_categories.map(t => t.count), 1);
              const pct = Math.round((tier.count / maxCount) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 truncate max-w-[200px]">{tier.tier}</span>
                    <span className="text-slate-500 font-mono">{tier.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(10, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Language Distribution */}
        <div className="p-5 bg-white border border-[#e5e9e4] rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-amber-700" />
              <h3 className="font-semibold text-sm text-slate-900">Multilingual Source Scripts</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">NLP Engine</span>
          </div>

          <div className="space-y-3">
            {distributions.languages.map((lang, i) => {
              const maxCount = Math.max(...distributions.languages.map(l => l.count), 1);
              const pct = Math.round((lang.count / maxCount) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{lang.language}</span>
                    <span className="text-slate-500 font-mono">{lang.count} mentions</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(10, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('resolution')}
          className="p-4 bg-emerald-950 text-white rounded-xl cursor-pointer hover:bg-emerald-900 transition-colors shadow-sm"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-300">Name Resolution Engine</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Resolve ambiguous regional vernaculars against Kew MPNS & POWO accepted binomials.
          </p>
        </div>

        <div
          onClick={() => onNavigate('graph')}
          className="p-4 bg-[#133e2f] text-white rounded-xl cursor-pointer hover:bg-[#1a4e3c] transition-colors shadow-sm"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-300">Interactive Knowledge Graph</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Explore 40+ interconnected nodes linking species, local names, traditional uses, and active phytochemicals.
          </p>
        </div>

        <div
          onClick={() => onNavigate('geographic')}
          className="p-4 bg-[#0d281e] text-white rounded-xl cursor-pointer hover:bg-[#143a2c] transition-colors shadow-sm"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-300">Geographical Explorer</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Interactive Leaflet spatial mapping of documented field records across the Western Ghats & Himalayas.
          </p>
        </div>

        <div
          onClick={() => onNavigate('copilot')}
          className="p-4 bg-[#064e3b] text-white rounded-xl cursor-pointer hover:bg-[#075945] transition-colors shadow-sm"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-300">EthnoTrace Research Copilot</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Grounded RAG synthesis with exact textual citations, DOI references, and uncertainty auditing.
          </p>
        </div>
      </div>
    </div>
  );
};
