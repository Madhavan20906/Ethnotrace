import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Check,
  X,
  Edit2,
  FileText,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { PlantMentionItem } from '../types';

export const ExtractionReviewListPage: React.FC = () => {
  const [mentions, setMentions] = useState<PlantMentionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingMention, setEditingMention] = useState<PlantMentionItem | null>(null);
  const [editScientific, setEditScientific] = useState<string>('');
  const [editUse, setEditUse] = useState<string>('');

  useEffect(() => {
    loadExtractions();
  }, [statusFilter]);

  const loadExtractions = async () => {
    try {
      setLoading(true);
      const res = await api.getExtractions({
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      setMentions(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approveExtraction(id);
      loadExtractions();
    } catch (err) {
      alert('Approval failed');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.rejectExtraction(id);
      loadExtractions();
    } catch (err) {
      alert('Rejection failed');
    }
  };

  const openEditModal = (m: PlantMentionItem) => {
    setEditingMention(m);
    setEditScientific(m.scientific_name || '');
    setEditUse(m.traditional_use || '');
  };

  const submitEdit = async () => {
    if (!editingMention) return;
    try {
      await api.reviewExtraction(editingMention.id, {
        action: 'edited',
        scientific_name: editScientific,
        traditional_use: editUse,
        reviewer_notes: 'Edited via Extraction Review table'
      });
      setEditingMention(null);
      loadExtractions();
    } catch (err) {
      alert('Save failed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e5e9e4]">
        <div>
          <h1 className="text-2xl font-bold text-[#0d281e]">Extraction Review & Verification</h1>
          <p className="text-xs text-slate-600 mt-1">
            Audit machine-extracted plant entities, traditional medicinal indications, and source citations.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700"
        >
          <option value="all">All Verification Statuses</option>
          <option value="Pending review">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e5e9e4] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Plant Mention</th>
                <th className="p-3.5">Resolved Scientific Binomial</th>
                <th className="p-3.5">Plant Part</th>
                <th className="p-3.5">Documented Use</th>
                <th className="p-3.5">Source & Page</th>
                <th className="p-3.5">Supporting Passage</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Loading extracted mentions...
                  </td>
                </tr>
              ) : mentions.length > 0 ? (
                mentions.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {m.raw_mention}
                      {m.transliteration && m.transliteration !== m.raw_mention && (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          ({m.transliteration})
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-serif italic text-emerald-950 font-bold whitespace-nowrap">
                      {m.scientific_name || <span className="text-slate-400 font-sans italic text-[11px]">Unresolved</span>}
                    </td>
                    <td className="p-3.5 text-slate-600 whitespace-nowrap">{m.plant_part || '—'}</td>
                    <td className="p-3.5 text-slate-800 font-medium">{m.traditional_use || '—'}</td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      Page {m.page_number}
                    </td>
                    <td className="p-3.5 text-slate-600 italic font-botanical-serif max-w-xs truncate">
                      "{m.supporting_passage}"
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                          m.validation_status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.validation_status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.validation_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(m.id)}
                          title="Approve"
                          className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(m.id)}
                          title="Reject"
                          className="p-1 text-rose-700 hover:bg-rose-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(m)}
                          title="Edit"
                          className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No extraction records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingMention && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-[#0d281e]">Edit Extracted Record</h3>
            <p className="text-xs text-slate-500">Mention: <strong>{editingMention.raw_mention}</strong></p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Scientific Binomial</label>
                <input
                  type="text"
                  value={editScientific}
                  onChange={(e) => setEditScientific(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Traditional Medicinal Use</label>
                <input
                  type="text"
                  value={editUse}
                  onChange={(e) => setEditUse(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingMention(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="px-4 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium"
              >
                Save Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
