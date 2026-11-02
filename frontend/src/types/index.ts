export interface DocumentItem {
  id: string;
  filename: string;
  title: string | null;
  authors: string | null;
  publication_year: number | null;
  doi: string | null;
  language: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  file_size: number;
  file_type: string;
  upload_timestamp: string;
  error_message: string | null;
  mention_count: number;
}

export interface DocumentPage {
  id: string;
  page_number: number;
  text: string;
  paragraph_count: number;
}

export interface PlantMentionItem {
  id: string;
  document_id: string;
  document_title?: string;
  page_number: number;
  raw_mention: string;
  scientific_name: string | null;
  plant_part: string | null;
  traditional_use: string | null;
  preparation_method: string | null;
  administration_route: string | null;
  community: string | null;
  location: string | null;
  language: string;
  transliteration: string | null;
  supporting_passage: string;
  evidence_type: string;
  validation_status: string;
  reviewer_notes: string | null;
  created_at?: string;
}

export interface DocumentDetail extends DocumentItem {
  extracted_text: string | null;
  pages: DocumentPage[];
  plant_mentions: PlantMentionItem[];
}

export interface LocalNameItem {
  id?: string;
  name: string;
  language: string;
  transliteration?: string | null;
  region?: string | null;
}

export interface BotanicalCandidateItem {
  candidate_name: string;
  candidate_family: string;
  match_score: number;
  match_type: string;
  confidence: number;
  resolution_status: string;
  resolution_notes?: string | null;
}

export interface BotanicalEntityItem {
  id: string;
  accepted_scientific_name: string;
  botanical_family: string;
  authorship: string | null;
  taxonomic_rank: string;
  status: string;
  powo_id: string | null;
  gbif_id: string | null;
  mpns_id: string | null;
  description: string | null;
  native_range: string | null;
  verification_status: string;
  identity_confidence: number;
  local_names: LocalNameItem[];
  traditional_use_count?: number;
  evidence_record_count?: number;
  traditional_uses?: any[];
  scientific_evidence?: any[];
  graph_connections?: any;
}

export interface BotanicalResolveResponse {
  query: string;
  resolved: boolean;
  accepted_species: BotanicalEntityItem | null;
  candidates: BotanicalCandidateItem[];
  is_ambiguous: boolean;
  ambiguity_explanation: string | null;
}

export interface EvidenceItem {
  id: string;
  botanical_id: string;
  botanical_name: string;
  claim_description: string;
  evidence_tier: string;
  study_methodology: string | null;
  publication_title: string;
  publication_year: number | null;
  doi: string | null;
  pmid: string | null;
  plant_identity_certainty: string;
  extraction_confidence: number;
  contradictory_evidence: string | null;
  limitations: string | null;
  validation_status: string;
}

export interface EvidenceCompareResponse {
  botanical_id: string;
  botanical_name: string;
  family: string;
  traditional_use_count: number;
  experimental_record_count: number;
  traditional_uses: any[];
  evidence_records: any[];
  comparison_analysis: {
    concordant_indications: string[];
    untested_traditional_indications: string[];
    contradictions_identified: string[];
    evidence_gap_rating: string;
    summary: string;
  };
}

export interface HistoricalMappingItem {
  id: string;
  historical_name: string;
  historical_source: string;
  modern_candidate_name: string;
  modern_botanical_id: string | null;
  modern_family: string | null;
  match_confidence: number;
  temporal_period: string;
  geographical_context: string | null;
  ambiguity_notes: string | null;
  verification_status: string;
}

export interface KnowledgeGapItem {
  id: string;
  botanical_id: string;
  plant_name: string;
  family: string;
  traditional_report_count: number;
  in_vitro_count: number;
  in_vivo_count: number;
  clinical_trial_count: number;
  gap_severity: 'Critical' | 'High' | 'Moderate' | 'Well-researched';
  underrepresented_region: string | null;
  notes: string | null;
}

export interface GeoRecord {
  id: string;
  plant_name: string;
  family: string;
  condition: string;
  plant_part: string | null;
  preparation: string | null;
  community: string | null;
  location_name: string;
  latitude: number;
  longitude: number;
  supporting_passage: string;
}

export interface AnalyticsOverview {
  metrics: {
    total_documents: number;
    processed_documents: number;
    extracted_plant_mentions: number;
    verified_botanical_identities: number;
    unresolved_plant_names: number;
    traditional_use_reports: number;
    evidence_records: number;
    pending_reviews: number;
    knowledge_graph_nodes: number;
    knowledge_graph_edges: number;
  };
  distributions: {
    plant_families: { family: string; count: number }[];
    evidence_categories: { tier: string; count: number }[];
    languages: { language: string; count: number }[];
  };
  geographical_records: GeoRecord[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats?: Record<string, number>;
}

export interface CopilotCitation {
  source_title: string;
  document_id: string | null;
  page_number: number | null;
  doi_or_url: string | null;
  exact_passage: string;
  evidence_category: string;
  plant_identity_confidence: string;
}

export interface CopilotResponse {
  query: string;
  direct_answer: string;
  citations: CopilotCitation[];
  related_graph_entities: any[];
  uncertainties_and_limitations: string[];
  research_gaps_identified: string[];
}

export interface DataSourceItem {
  id: string;
  name: string;
  provider: string;
  url: string;
  license: string;
  attribution: string;
  available_fields: string;
  quality_limitations: string | null;
  record_count: number;
  last_synced: string;
}
