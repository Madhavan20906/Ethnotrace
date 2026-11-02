import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  AlertTriangle,
  History,
  Check,
  X
} from 'lucide-react';
import { api } from '../services/api';

export const AuditReviewPage: React.FC = () => {
  const [pendingData, setPendingData] = useState<any | null>(null);
  const [auditData, setAuditData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pending, audit] = await Promise.all([
        api.getPendingReviews(),
        api.getAuditTrail()
      ]);
      setPendingData(pending);
      setAuditData(audit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approveExtraction(id);
      loadData();
    } catch (err) {
      alert('Approval failed');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.rejectExtraction(id);
      loadData();
    } catch (err) {
      alert('Rejection failed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#e5e9e4]">
        <h1 className="text-2xl font-bold text-[#0d281e]">Human-in-the-Loop Review & Audit Trail</h1>
        <p className="text-xs text-slate-600 mt-1">
          Traceable scientific review environment distinguishing machine-extracted entities from expert human verification.
        </p>
      </div>

      {/* Grid: Pending Reviews & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pending Mentions for Review */}
        <div className="bg-white border border-[#e5e9e4] rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-[#e5e9e4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Pending Expert Reviews ({pendingData?.pending_mentions?.length || 0})
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
              Verification Required
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {pendingData?.pending_mentions && pendingData.pending_mentions.length > 0 ? (
              pendingData.pending_mentions.map((m: any) => (
                <div key={m.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sm text-[#0d281e]">
                        {m.scientific_name || m.raw_mention}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">[{m.language}]</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
                      Page {m.page_number}
                    </span>
                  </div>

                  {m.traditional_use && (
                    <div className="text-xs text-slate-700">
                      Documented Use: <strong>{m.traditional_use}</strong>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 italic font-botanical-serif bg-white p-2 rounded border border-slate-200">
                    "{m.supporting_passage}"
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                    <button
                      onClick={() => handleApprove(m.id)}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(m.id)}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-xs font-medium flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                All extracted entities have passed validation thresholds.
              </div>
            )}
          </div>
        </div>

        {/* Right: Revision History & Audit Events */}
        <div className="bg-white border border-[#e5e9e4] rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-[#e5e9e4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-700" />
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Audit Trail Log ({auditData?.total_audit_events || 0})
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Immutable History
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {auditData?.events && auditData.events.length > 0 ? (
              auditData.events.map((ev: any) => (
                <div key={ev.id} className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span className="capitalize">{ev.reviewer_name}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(ev.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Action: <span className="font-mono font-bold text-emerald-800">{ev.action}</span> • Target: {ev.entity_type}
                  </div>
                  {ev.comments && (
                    <p className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-100 mt-1">
                      {ev.comments}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No audit events recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
