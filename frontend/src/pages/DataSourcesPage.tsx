import React, { useState, useEffect } from 'react';
import {
  Database,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { DataSourceItem } from '../types';

export const DataSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<DataSourceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      setLoading(true);
      const res = await api.getDataSources();
      setSources(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e5e9e4]">
        <div>
          <h1 className="text-2xl font-bold text-[#0d281e]">Scientific Data Sources & Attribution Registry</h1>
          <p className="text-xs text-slate-600 mt-1">
            Complete transparency registry of external taxonomic databases, peer-reviewed repositories, and open ethnobotanical datasets.
          </p>
        </div>

        <button
          onClick={loadSources}
          className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Registry</span>
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-8 text-xs text-slate-400">Loading data sources...</div>
        ) : sources.map((source) => (
          <div
            key={source.id}
            className="p-5 bg-white border border-[#e5e9e4] rounded-xl shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-[#0d281e]">{source.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{source.provider}</p>
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50"
                  title="Open source URL"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Attribution */}
              <div className="mt-3 text-xs text-slate-700">
                <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider mb-0.5">
                  Scientific Attribution & Citation
                </span>
                <p className="bg-slate-50 p-2.5 rounded font-botanical-serif text-[11px] leading-relaxed border border-slate-200/60">
                  {source.attribution}
                </p>
              </div>

              {/* License & Fields */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-slate-400 font-medium block">License</span>
                  <span className="font-semibold text-slate-800 truncate block">{source.license}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-slate-400 font-medium block">Estimated Records</span>
                  <span className="font-mono font-semibold text-emerald-800 block">
                    {source.record_count.toLocaleString()}
                  </span>
                </div>
              </div>

              {source.quality_limitations && (
                <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/60 p-2 rounded border border-amber-200/50">
                  <strong>Quality Limitations:</strong> {source.quality_limitations}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active & Attributed</span>
              </span>
              <span>Last Synced: {new Date(source.last_synced).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
