import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  MapPin,
  ExternalLink,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { HistoricalMappingItem } from '../types';

export const HistoricalMapperPage: React.FC = () => {
  const [mappings, setMappings] = useState<HistoricalMappingItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = async (query?: string) => {
    try {
      setLoading(true);
      const res = await api.searchHistorical(query);
      setMappings(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMappings(searchTerm);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e5e9e4]">
        <div>
          <h1 className="text-2xl font-bold text-[#0d281e]">Historical Botanical Knowledge Mapper</h1>
          <p className="text-xs text-slate-600 mt-1">
            Bridging pre-Linnaean manuscripts, colonial pharmacopoeias, and Ayurvedic treatises with modern accepted taxonomy.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search historical name or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 w-56"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium"
          >
            Search
          </button>
        </form>
      </div>

      {/* Historical Manuscripts Overview Banner */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <BookOpen className="w-4 h-4 text-amber-700" />
          <span>Curated Primary Historical Corpora</span>
        </div>
        <p className="text-amber-900 leading-relaxed font-botanical-serif">
          Historical texts often predate the Linnaean binomial system or use homotypic synonyms.
          EthnoTrace tracks temporal provenance from <em>Hortus Malabaricus</em> (van Rheede, 1683),
          classical <em>Charaka Samhita</em>, and 19th-century colonial Materia Medica while refusing to force unresolved names into false modern matches.
        </p>
      </div>

      {/* Side-by-Side Terminology Mappings */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400">Loading historical mappings...</div>
        ) : mappings.length > 0 ? (
          mappings.map((m) => {
            const isAmbiguous = m.verification_status.toLowerCase().includes('ambiguous');
            return (
              <div
                key={m.id}
                className={`p-5 rounded-xl border transition-all ${
                  isAmbiguous
                    ? 'bg-amber-50/40 border-amber-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  {/* Left Historical Name */}
                  <div className="flex-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Historical Terminology
                    </span>
                    <h3 className="text-lg font-bold text-[#0d281e] font-serif mt-0.5">
                      {m.historical_name}
                    </h3>
                    <p className="text-xs text-amber-800 font-medium mt-0.5">
                      Source: {m.historical_source}
                    </p>
                  </div>

                  {/* Transition Arrow */}
                  <div className="hidden md:flex flex-col items-center justify-center px-4">
                    <ArrowRight className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] font-mono text-slate-400 mt-1">
                      {Math.round(m.match_confidence * 100)}% match
                    </span>
                  </div>

                  {/* Right Modern Accepted Name */}
                  <div className="flex-1 md:text-right">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Modern Accepted Botanical Taxon
                    </span>
                    <h3 className="text-lg font-bold text-emerald-950 font-serif italic mt-0.5">
                      {m.modern_candidate_name}
                    </h3>
                    {m.modern_family && (
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">
                        Family: {m.modern_family}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata & Ambiguity Notes */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.temporal_period}</span>
                    </span>
                    {m.geographical_context && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.geographical_context}</span>
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      isAmbiguous
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {m.verification_status}
                  </span>
                </div>

                {m.ambiguity_notes && (
                  <div className="mt-2.5 p-2.5 bg-slate-50 rounded text-xs text-slate-700 font-botanical-serif border-l-2 border-amber-500">
                    <strong>Nomenclatural Note:</strong> {m.ambiguity_notes}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            No historical mappings found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
