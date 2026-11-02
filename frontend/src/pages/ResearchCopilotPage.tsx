import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  Network,
  Download,
  Copy,
  Check,
  HelpCircle,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { CopilotResponse } from '../types';

export const ResearchCopilotPage: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; responseData?: CopilotResponse }>>([
    {
      role: 'assistant',
      content:
        'Greetings. I am the EthnoTrace Research Copilot. I synthesize ethnobotanical inquiries strictly grounded in indexed primary literature, Kew taxonomic records, and knowledge graph links. How may I assist your pharmacognostic or ethnobotanical research today?'
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const suggestedQueries = [
    'What medicinal plants are documented in Tamil Nadu for fever?',
    'Which plants have ambiguous botanical names?',
    'What traditional remedies are documented for digestive complaints?',
    'What contradictory findings exist between traditional claims and modern trials?',
    'What are the documented relationships between plants and their active compounds?'
  ];

  const handleSend = async (questionText: string) => {
    const text = questionText.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.queryCopilot(text);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.direct_answer,
          responseData: res
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Inquiry retrieval error: ${err.message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-1rem)] flex flex-col p-4 max-w-5xl mx-auto space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e5e9e4]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0d281e]">EthnoTrace Research Copilot</h1>
            <p className="text-xs text-slate-600">
              Grounded multi-source synthesis: Knowledge Graph traversal + exact passage retrieval + citation auditing.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-medium">
          Zero-Hallucination Policy
        </span>
      </div>

      {/* Suggested Queries Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-medium text-slate-400 shrink-0">Preset Inquiries:</span>
        {suggestedQueries.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 bg-white border border-[#e5e9e4] rounded-xl space-y-4 shadow-xs">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-3xl p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-800 text-white font-medium'
                  : 'bg-[#fcfcf9] border border-slate-200 text-slate-800 shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Grounded Citations Box */}
              {msg.responseData && msg.responseData.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Verified Primary Source Citations ({msg.responseData.citations.length})</span>
                  </div>

                  <div className="space-y-2">
                    {msg.responseData.citations.map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span className="truncate max-w-[280px]">{cite.source_title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Page {cite.page_number || 1} • {cite.evidence_category}
                          </span>
                        </div>
                        <p className="text-slate-600 italic font-botanical-serif text-[11px]">
                          "{cite.exact_passage}"
                        </p>
                        {cite.doi_or_url && (
                          <div className="text-[10px] text-emerald-700 font-mono">
                            DOI/Ref: {cite.doi_or_url}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Knowledge Graph Entities */}
              {msg.responseData && msg.responseData.related_graph_entities.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Network className="w-3 h-3 text-emerald-700" />
                    <span>Graph Nodes:</span>
                  </span>
                  {msg.responseData.related_graph_entities.map((node, nIdx) => (
                    <span
                      key={nIdx}
                      className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium"
                    >
                      {node.label} ({node.type})
                    </span>
                  ))}
                </div>
              )}

              {/* Uncertainties and Limitations */}
              {msg.responseData && msg.responseData.uncertainties_and_limitations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-amber-800 space-y-0.5 bg-amber-50/50 p-2 rounded">
                  <strong className="block text-[11px] text-amber-900">Uncertainties & Limitations:</strong>
                  {msg.responseData.uncertainties_and_limitations.map((u, uIdx) => (
                    <div key={uIdx}>• {u}</div>
                  ))}
                </div>
              )}

              {/* Copy message button */}
              {msg.role === 'assistant' && (
                <div className="mt-2 flex items-center justify-end">
                  <button
                    onClick={() => handleCopy(msg.content, i)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    {copiedIndex === i ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === i ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-4 text-xs text-slate-500 font-mono">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>Traversing Knowledge Graph & querying semantic index...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(query);
        }}
        className="flex items-center gap-2 p-2 bg-white border border-[#e5e9e4] rounded-xl shadow-xs"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a scientific ethnobotanical question (e.g. digestive flora in Western Ghats)..."
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Inquire</span>
        </button>
      </form>
    </div>
  );
};
