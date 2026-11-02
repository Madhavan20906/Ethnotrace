import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Download,
  Filter,
  TrendingDown,
  Info,
  CheckCircle2,
  FileSpreadsheet,
  MapPin,
  Clock,
  FlaskConical
} from 'lucide-react';
import { api } from '../services/api';
import { KnowledgeGapItem } from '../types';

export const KnowledgeGapsPage: React.FC = () => {
  const [gaps, setGaps] = useState<KnowledgeGapItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  useEffect(() => {
    loadGaps();
  }, []);

  const loadGaps = async () => {
    try {
      setLoading(true);
      const res = await api.getKnowledgeGaps();
      setGaps(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGaps = severityFilter === 'all'
    ? gaps
    : gaps.filter(g => g.gap_severity.toLowerCase() === severityFilter.toLowerCase());

  const exportCSV = () => {
    const headers = ['Plant Name', 'Family', 'Traditional Reports', 'In Vitro Count', 'In Vivo Count', 'Clinical Trials', 'Gap Severity', 'Underrepresented Region', 'Notes'];
    const rows = filteredGaps.map(g => [
      g.plant_name,
      g.family,
      g.traditional_report_count,
      g.in_vitro_count,
      g.in_vivo_count,
      g.clinical_trial_count,
      g.gap_severity,
      `"${g.underrepresented_region || ''}"`,
      `"${g.notes || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ethnotrace_research_gaps.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e5e9e4]">
        <div>
          <h1 className="text-2xl font-bold text-[#0d281e]">Ethnobotanical Knowledge Gap Discovery</h1>
          <p className="text-xs text-slate-600 mt-1">
            Systematic identification of high-usage traditional taxa lacking peer-reviewed clinical trials or comprehensive regional exploration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Gap</option>
            <option value="high">High Gap</option>
            <option value="moderate">Moderate</option>
          </select>

          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Scientific Limitation Disclosure Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900">Scientific Context & Repository Boundaries:</span>
          <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
            These metrics represent gaps in the <strong>currently indexed ethnobotanical dataset</strong> and connected PubMed literature, not definitive proof that no experimental work exists globally. They highlight high-priority candidates for modern bioassay and clinical validation.
          </p>
        </div>
      </div>

      {/* Gap Table / Matrix */}
      <div className="bg-white border border-[#e5e9e4] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Species / Taxon</th>
                <th className="p-3.5">Botanical Family</th>
                <th className="p-3.5 text-center">Traditional Reports</th>
                <th className="p-3.5 text-center">In Vitro / In Vivo</th>
                <th className="p-3.5 text-center">Clinical Trials</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Underrepresented Region</th>
                <th className="p-3.5">Research Opportunity Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Computing evidence gap matrices...
                  </td>
                </tr>
              ) : filteredGaps.map((gap) => (
                <tr key={gap.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-emerald-950 font-serif italic whitespace-nowrap">
                    {gap.plant_name}
                  </td>
                  <td className="p-3.5 text-slate-600">{gap.family}</td>
                  <td className="p-3.5 text-center font-mono font-bold text-amber-800">
                    {gap.traditional_report_count}
                  </td>
                  <td className="p-3.5 text-center font-mono text-slate-700">
                    {gap.in_vitro_count} / {gap.in_vivo_count}
                  </td>
                  <td className="p-3.5 text-center font-mono">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        gap.clinical_trial_count <= 2
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {gap.clinical_trial_count} RCTs
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                        gap.gap_severity === 'Critical'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : gap.gap_severity === 'High'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {gap.gap_severity}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 whitespace-nowrap">
                    {gap.underrepresented_region || 'National'}
                  </td>
                  <td className="p-3.5 text-slate-700 max-w-sm leading-relaxed">
                    {gap.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
