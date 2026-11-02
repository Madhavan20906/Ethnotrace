import {
  DocumentItem,
  DocumentDetail,
  PlantMentionItem,
  BotanicalEntityItem,
  BotanicalResolveResponse,
  EvidenceItem,
  EvidenceCompareResponse,
  HistoricalMappingItem,
  KnowledgeGapItem,
  AnalyticsOverview,
  GraphData,
  CopilotResponse,
  DataSourceItem
} from '../types';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Analytics
  getAnalyticsOverview: () => fetchJson<AnalyticsOverview>('/analytics/overview'),

  // Documents
  getDocuments: (status?: string) => {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetchJson<DocumentItem[]>(`/documents${params}`);
  },
  getDocumentDetail: (id: string) => fetchJson<DocumentDetail>(`/documents/${id}`),
  uploadDocument: async (file: File): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Upload failed: ${err}`);
    }
    return res.json();
  },
  reprocessDocument: (id: string) => fetchJson<{ message: string; id: string }>(`/documents/${id}/process`, { method: 'POST' }),
  deleteDocument: (id: string) => fetchJson<{ message: string; id: string }>(`/documents/${id}`, { method: 'DELETE' }),

  // Extractions
  getExtractions: (params?: { status?: string; language?: string; document_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.language) q.append('language', params.language);
    if (params?.document_id) q.append('document_id', params.document_id);
    return fetchJson<{ total: number; items: PlantMentionItem[] }>(`/extractions?${q.toString()}`);
  },
  reviewExtraction: (id: string, payload: { action: string; scientific_name?: string; traditional_use?: string; reviewer_notes?: string }) =>
    fetchJson<{ message: string; status: string }>(`/extractions/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),
  approveExtraction: (id: string) => fetchJson<{ message: string }>(`/extractions/${id}/approve`, { method: 'POST' }),
  rejectExtraction: (id: string) => fetchJson<{ message: string }>(`/extractions/${id}/reject`, { method: 'POST' }),

  // Botanical
  getPlants: (params?: { family?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.family) q.append('family', params.family);
    if (params?.search) q.append('search', params.search);
    return fetchJson<{ total: number; items: BotanicalEntityItem[] }>(`/plants?${q.toString()}`);
  },
  getPlantDetail: (id: string) => fetchJson<BotanicalEntityItem>(`/plants/${id}`),
  resolvePlantName: (query: string, language: string = 'English') =>
    fetchJson<BotanicalResolveResponse>('/plants/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language })
    }),

  // Knowledge Graph
  getGraph: (centerNodeId?: string, depth: number = 1, limit: number = 150) => {
    const q = new URLSearchParams();
    if (centerNodeId) q.append('center_node_id', centerNodeId);
    q.append('depth', depth.toString());
    q.append('limit', limit.toString());
    return fetchJson<GraphData>(`/graph?${q.toString()}`);
  },
  getGraphNode: (id: string) => fetchJson<any>(`/graph/nodes/${id}`),

  // Evidence
  getEvidenceList: (tier?: string, botanicalId?: string) => {
    const q = new URLSearchParams();
    if (tier) q.append('tier', tier);
    if (botanicalId) q.append('botanical_id', botanicalId);
    return fetchJson<{ total: number; items: EvidenceItem[] }>(`/evidence?${q.toString()}`);
  },
  compareEvidence: (botanicalId: string) => fetchJson<EvidenceCompareResponse>(`/evidence/compare?botanical_id=${encodeURIComponent(botanicalId)}`),
  getKnowledgeGaps: () => fetchJson<{ total: number; items: KnowledgeGapItem[] }>('/evidence/gaps'),

  // Historical
  searchHistorical: (q?: string) => {
    const url = q ? `/historical/search?q=${encodeURIComponent(q)}` : '/historical/search';
    return fetchJson<{ total: number; items: HistoricalMappingItem[] }>(url);
  },

  // Copilot
  queryCopilot: (query: string, contextFilter?: string) =>
    fetchJson<CopilotResponse>('/copilot/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context_filter: contextFilter })
    }),
  getCopilotHistory: () => fetchJson<{ history: any[] }>('/copilot/history'),
  getCopilotSources: () => fetchJson<any>('/copilot/sources'),

  // Data Sources
  getDataSources: () => fetchJson<{ total: number; items: DataSourceItem[] }>('/sources'),

  // Review & Audit
  getPendingReviews: () => fetchJson<any>('/review/pending'),
  getAuditTrail: () => fetchJson<any>('/review/audit')
};
