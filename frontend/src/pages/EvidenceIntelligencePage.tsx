import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { EvidenceItem, EvidenceCompareResponse, BotanicalEntityItem } from '../types';

export const EvidenceIntelligencePage: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [plants, setPlants] = useState<BotanicalEntityItem[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('bot_andrographis');
  const [comparison, setComparison] = useState<EvidenceCompareResponse | null>(null);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCompare, setLoadingCompare] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [tierFilter]);

  useEffect(() => {
    if (selectedPlantId) {
      loadComparison(selectedPlantId);
    }
  }, [selectedPlantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [evidRes, plantRes] = await Promise.all([
        api.getEvidenceList(tierFilter === 'all' ? undefined : tierFilter),
        api.getPlants()
      ]);
      setEvidenceList(evidRes.items);
      setPlants(plantRes.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadComparison = async (botanicalId: string) => {
    try {
      setLoadingCompare(true);
      const compRes = await api.compareEvidence(botanicalId);
      setComparison(compRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCompare(false);
    }
  };

  const evidenceTiers = [
    'All Evidence Tiers',
    'Clinical trials',
    'Systematic reviews and meta-analyses',
    'Animal-model studies',
    'In-vivo preclinical research',
    'In-vitro laboratory research',
    'Traditional knowledge documentation',
    'Historical documentation'
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e5e9e4]">
        <div>
          <h1 className="text-2xl font-bold text-[#0d281e]">Scientific Evidence Intelligence</h1>
          <p className="text-xs text-slate-600 mt-1">
            Methodological tier classification, claim comparison, and contradiction detection between traditional uses and modern clinical trials.
          </p>
        </div>

        {/* Tier Filter */}
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
        >
          {evidenceTiers.map((t) => (
            <option key={t} value={t === 'All Evidence Tiers' ? 'all' : t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Claim Comparison Tool */}
      <div className="p-5 bg-white border border-[#e5e9e4] rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Traditional Claim vs Modern Laboratory Concordance Audit
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Taxon:</span>
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="text-xs font-semibold text-emerald-950 bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 focus:ring-1 focus:ring-emerald-600"
            >
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.accepted_scientific_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingCompare ? (
          <div className="text-center py-6 text-xs text-slate-400">Auditing claims...</div>
        ) : comparison ? (
          <div className="space-y-4">
            {/* Concordance Summary Banner */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
              <span className="font-bold text-emerald-950 uppercase tracking-wide text-[10px]">
                Concordance Audit Summary
              </span>
              <p className="text-emerald-900 font-medium">{comparison.comparison_analysis.summary}</p>
              <div className="text-[11px] text-emerald-800 flex items-center gap-2 mt-1">
                <span>Gap Rating: <strong className="font-semibold">{comparison.comparison_analysis.evidence_gap_rating}</strong></span>
                <span>•</span>
                <span>Traditional Reports: <strong>{comparison.traditional_use_count}</strong></span>
                <span>•</span>
                <span>Indexed Laboratory Papers: <strong>{comparison.experimental_record_count}</strong></span>
              </div>
            </div>

            {/* Side-by-Side Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Concordant indications */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concordant Indications ({comparison.comparison_analysis.concordant_indications.length})</span>
                </div>
                <div className="space-y-1.5">
                  {comparison.comparison_analysis.concordant_indications.map((ind, i) => (
                    <div key={i} className="text-xs bg-white p-2 rounded border border-slate-200/80 font-medium text-slate-800">
                      {ind}
                    </div>
                  ))}
                </div>
              </div>

              {/* Untested traditional indications */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800 mb-2">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>Untested in Indexed Repositories ({comparison.comparison_analysis.untested_traditional_indications.length})</span>
                </div>
                <div className="space-y-1.5">
                  {comparison.comparison_analysis.untested_traditional_indications.map((ind, i) => (
                    <div key={i} className="text-xs bg-white p-2 rounded border border-slate-200/80 text-slate-700">
                      {ind}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contradictions & Toxicological Warnings */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800 mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Identified Contradictions & Limits</span>
                </div>
                <div className="space-y-1.5">
                  {comparison.comparison_analysis.contradictions_identified.length > 0 ? (
                    comparison.comparison_analysis.contradictions_identified.map((c, i) => (
                      <div key={i} className="text-xs bg-rose-50 text-rose-900 p-2 rounded border border-rose-200 leading-tight">
                        {c}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No explicit toxicological contradictions flagged in current indexed entries.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Primary Evidence Registry */}
      <div className="bg-white border border-[#e5e9e4] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-[#e5e9e4] flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Indexed Scientific Evidence Records ({evidenceList.length})
          </span>
          <span className="text-[10px] text-slate-400 font-mono">PubMed Central Verified</span>
        </div>

        <div className="divide-y divide-slate-100">
          {evidenceList.map((rec) => (
            <div key={rec.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-serif italic font-bold text-sm text-[#0d281e]">
                    {rec.botanical_name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">
                    {rec.evidence_tier}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  {rec.pmid && (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${rec.pmid}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>PMID: {rec.pmid}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {rec.doi && <span>DOI: {rec.doi}</span>}
                </div>
              </div>

              <h4 className="text-xs font-semibold text-slate-900">
                {rec.publication_title} ({rec.publication_year || 'Recent'})
              </h4>

              <p className="text-xs text-slate-700 leading-relaxed">
                {rec.claim_description}
              </p>

              {rec.study_methodology && (
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
                  <strong>Methodology:</strong> {rec.study_methodology}
                </div>
              )}

              {rec.limitations && (
                <div className="text-[11px] text-amber-800 bg-amber-50/60 p-2 rounded border border-amber-200/50">
                  <strong>Methodological Limitations:</strong> {rec.limitations}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
