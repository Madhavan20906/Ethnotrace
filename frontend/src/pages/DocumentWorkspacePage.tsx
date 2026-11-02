import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  RefreshCw,
  Sparkles,
  Check,
  X,
  FileCode
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, DocumentDetail, PlantMentionItem } from '../types';

export const DocumentWorkspacePage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDocDetail, setSelectedDocDetail] = useState<DocumentDetail | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [highlightText, setHighlightText] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [filterStatus]);

  useEffect(() => {
    if (selectedDocId) {
      loadDocumentDetail(selectedDocId);
    }
  }, [selectedDocId]);

  const loadDocuments = async () => {
    try {
      const docs = await api.getDocuments(filterStatus === 'all' ? undefined : filterStatus);
      setDocuments(docs);
      if (docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0].id);
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  const loadDocumentDetail = async (id: string) => {
    try {
      setLoadingDetail(true);
      const detail = await api.getDocumentDetail(id);
      setSelectedDocDetail(detail);
      setActivePage(1);
      setHighlightText(null);
    } catch (err) {
      console.error('Failed to load document detail', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploaded = await api.uploadDocument(files[0]);
      await loadDocuments();
      setSelectedDocId(uploaded.id);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApprove = async (mentionId: string) => {
    try {
      await api.approveExtraction(mentionId);
      if (selectedDocId) loadDocumentDetail(selectedDocId);
    } catch (err) {
      alert('Approval failed');
    }
  };

  const handleReject = async (mentionId: string) => {
    try {
      await api.rejectExtraction(mentionId);
      if (selectedDocId) loadDocumentDetail(selectedDocId);
    } catch (err) {
      alert('Rejection failed');
    }
  };

  const currentPageData = selectedDocDetail?.pages.find((p) => p.page_number === activePage);

  return (
    <div className="h-[calc(100vh-1rem)] flex flex-col p-4 max-w-[1700px] mx-auto space-y-3">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e9e4]">
        <div>
          <h1 className="text-xl font-bold text-[#0d281e]">Ethnodocument Intelligence Workspace</h1>
          <p className="text-xs text-slate-600">
            Page-level provenance extraction, multilingual NLP recognition, and passage-level verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.docx,.doc,.txt,.csv,.json"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Processing File...' : 'Upload Document'}</span>
          </button>
          <button
            onClick={loadDocuments}
            className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs"
            title="Refresh documents"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Left Document Browser & Viewer (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white border border-[#e5e9e4] rounded-xl overflow-hidden shadow-xs">
          {/* Document Selector Header */}
          <div className="p-3 bg-slate-50 border-b border-[#e5e9e4] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <span className="text-xs font-semibold text-slate-700 shrink-0">Source Document:</span>
              <select
                value={selectedDocId || ''}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 truncate"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename} ({d.mention_count} mentions)
                  </option>
                ))}
              </select>
            </div>

            {selectedDocDetail && selectedDocDetail.pages.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <button
                  onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                  disabled={activePage === 1}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs">
                  Page {activePage} of {selectedDocDetail.pages.length}
                </span>
                <button
                  onClick={() => setActivePage((p) => Math.min(selectedDocDetail.pages.length, p + 1))}
                  disabled={activePage === selectedDocDetail.pages.length}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Document Content View */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcf9] font-botanical-serif text-sm leading-relaxed text-[#1a2421]">
            {loadingDetail ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-400 font-sans">
                Loading document content...
              </div>
            ) : selectedDocDetail ? (
              <div>
                <div className="mb-4 pb-3 border-b border-slate-200 font-sans">
                  <h3 className="font-bold text-base text-emerald-950 font-serif">
                    {selectedDocDetail.title || selectedDocDetail.filename}
                  </h3>
                  {selectedDocDetail.authors && (
                    <p className="text-xs text-slate-600 mt-0.5">Authors: {selectedDocDetail.authors}</p>
                  )}
                  {selectedDocDetail.doi && (
                    <p className="text-xs text-emerald-700 font-mono mt-0.5">DOI: {selectedDocDetail.doi}</p>
                  )}
                </div>

                {/* Page text with passage highlighting */}
                <div className="whitespace-pre-wrap leading-relaxed select-text">
                  {currentPageData ? (
                    highlightText && currentPageData.text.includes(highlightText) ? (
                      <div>
                        {currentPageData.text.split(highlightText).map((part, index, arr) => (
                          <React.Fragment key={index}>
                            {part}
                            {index < arr.length - 1 && (
                              <mark className="passage-highlight font-medium">
                                {highlightText}
                              </mark>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      currentPageData.text
                    )
                  ) : (
                    selectedDocDetail.extracted_text || 'No text extracted from this document.'
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-500 font-sans">
                <FileText className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-medium">No document selected</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Upload an ethnobotanical publication, survey CSV, or select one from the repository list.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Extracted Entities & Verification Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white border border-[#e5e9e4] rounded-xl overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50 border-b border-[#e5e9e4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="font-semibold text-xs text-slate-800">
                Extracted Entities & Grounded Claims
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
              {selectedDocDetail?.plant_mentions.length || 0} discovered
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {selectedDocDetail?.plant_mentions && selectedDocDetail.plant_mentions.length > 0 ? (
              selectedDocDetail.plant_mentions.map((mention) => {
                const isSelected = highlightText === mention.supporting_passage;
                return (
                  <div
                    key={mention.id}
                    onClick={() => {
                      setHighlightText(mention.supporting_passage);
                      setActivePage(mention.page_number);
                    }}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="font-bold text-sm text-[#0d281e]">
                          {mention.scientific_name || mention.raw_mention}
                        </span>
                        {mention.transliteration && (
                          <span className="text-xs text-slate-500 ml-1.5 font-normal">
                            ({mention.transliteration})
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-semibold ${
                          mention.validation_status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : mention.validation_status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {mention.validation_status}
                      </span>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2 text-[11px]">
                      {mention.plant_part && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                          Part: {mention.plant_part}
                        </span>
                      )}
                      {mention.traditional_use && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/50 rounded font-medium">
                          Use: {mention.traditional_use}
                        </span>
                      )}
                      {mention.community && (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                          Community: {mention.community}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono rounded">
                        Page {mention.page_number}
                      </span>
                    </div>

                    {/* Supporting Text Passage */}
                    <div className="p-2 bg-slate-50 rounded text-xs text-slate-700 italic border-l-2 border-emerald-600 mb-2.5">
                      "{mention.supporting_passage}"
                    </div>

                    {/* Verification Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">Click to locate passage</span>
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleApprove(mention.id)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-medium flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(mention.id)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-medium flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 text-xs text-slate-400">
                No entities extracted from this document yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
