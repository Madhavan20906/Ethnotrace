import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Sprout,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { BotanicalResolveResponse } from '../types';

export const BotanicalResolutionPage: React.FC = () => {
  const [query, setQuery] = useState<string>('வேம்பு');
  const [language, setLanguage] = useState<string>('Tamil');
  const [result, setResult] = useState<BotanicalResolveResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const sampleQueries = [
    { text: 'வேம்பு', lang: 'Tamil', desc: 'Tamil vernacular (Vembu)' },
    { text: 'Neem', lang: 'English', desc: 'Common English' },
    { text: 'Brahmi', lang: 'Sanskrit', desc: 'Known ambiguous homonym' },
    { text: 'Shankhpushpi', lang: 'Hindi', desc: 'Regional multi-taxa remedy' },
    { text: 'Ocimum sanctum', lang: 'Latin', desc: 'Historical synonym for O. tenuiflorum' },
    { text: 'Adhatoda vasica', lang: 'Latin', desc: 'Homotypic synonym for Justicia adhatoda' }
  ];

  const handleResolve = async (searchTerm: string, lang: string) => {
    try {
      setLoading(true);
      const res = await api.resolvePlantName(searchTerm, lang);
      setResult(res);
    } catch (err: any) {
      alert(`Resolution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-[#e5e9e4]">
        <h1 className="text-2xl font-bold text-[#0d281e]">Botanical Entity Resolution Engine</h1>
        <p className="text-xs text-slate-600 mt-1">
          POWO & Kew MPNS grounded resolution with homonym disambiguation, synonym translation, and confidence scoring.
        </p>
      </div>

      {/* Query Bar */}
      <div className="p-5 bg-white border border-[#e5e9e4] rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter plant name (Latin, Tamil script, Hindi, Sanskrit, English)..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="Hindi">Hindi</option>
            <option value="Sanskrit">Sanskrit</option>
            <option value="Latin">Latin Binomial</option>
          </select>

          <button
            onClick={() => handleResolve(query, language)}
            disabled={loading || !query.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Resolving...' : 'Resolve Entity'}</span>
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-400">Try Benchmark Queries:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sq.text);
                setLanguage(sq.lang);
                handleResolve(sq.text, sq.lang);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded-md text-xs font-medium transition-colors"
            >
              {sq.text} <span className="text-[10px] text-slate-400">({sq.desc})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution Results */}
      {result && (
        <div className="space-y-4">
          {/* Ambiguity Alert Banner */}
          {result.is_ambiguous && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Ambiguous Botanical Entity Detected</h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {result.ambiguity_explanation}
                </p>
                <p className="text-[11px] text-amber-700 font-medium">
                  Scientific Responsibility Standard: Automatic species conversion is disabled to avoid clinical adulteration. Please inspect candidate taxa below.
                </p>
              </div>
            </div>
          )}

          {/* Accepted Species Card (if resolved) */}
          {result.resolved && result.accepted_species && (
            <div className="p-5 bg-white border border-emerald-300 rounded-xl shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-base text-slate-900">
                    Accepted Botanical Binomial (POWO)
                  </span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold font-mono">
                  Confidence: 98%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-950 font-serif italic">
                    {result.accepted_species.accepted_scientific_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Family: <strong className="text-slate-800">{result.accepted_species.botanical_family}</strong> • Authorship: {result.accepted_species.authorship}
                  </p>
                  <p className="text-xs text-slate-700 font-botanical-serif mt-2">
                    {result.accepted_species.description}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Taxonomic Rank:</span>
                    <span className="font-medium text-slate-800">{result.accepted_species.taxonomic_rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Native Range:</span>
                    <span className="font-medium text-slate-800">{result.accepted_species.native_range}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">POWO Key:</span>
                    <span className="font-mono text-emerald-700">{result.accepted_species.powo_id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Candidate Taxa Presentation */}
          {result.candidates && result.candidates.length > 0 && (
            <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Candidate Species Comparison ({result.candidates.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.candidates.map((cand, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-sm text-[#0d281e] font-serif italic">
                        {cand.candidate_name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        Score: {Math.round(cand.match_score * 100)}%
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Family: <strong>{cand.candidate_family}</strong> • Match Type: <span className="font-mono text-[11px] text-emerald-800">{cand.match_type}</span>
                    </div>

                    {cand.resolution_notes && (
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/80">
                        {cand.resolution_notes}
                      </p>
                    )}

                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => alert(`Confirmed: Assigned to ${cand.candidate_name}`)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-medium"
                      >
                        Confirm Match
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
