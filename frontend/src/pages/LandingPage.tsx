import React from 'react';
import {
  Sprout,
  ShieldCheck,
  Network,
  BookOpen,
  Search,
  ArrowRight,
  Database,
  FileCheck,
  Languages,
  CheckCircle2,
  Compass
} from 'lucide-react';

interface LandingPageProps {
  onEnterWorkspace: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterWorkspace }) => {
  return (
    <div className="min-h-screen bg-[#fcfcf9] text-[#1a2421]">
      {/* Top Banner */}
      <header className="border-b border-[#e5e9e4] bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-sm">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-emerald-950">EthnoTrace</span>
              <span className="text-xs text-emerald-700 ml-2 font-mono hidden sm:inline">
                EthnoHack 2026 • Track 1
              </span>
            </div>
          </div>
          <button
            onClick={onEnterWorkspace}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <span>Launch Research Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-6 border-b border-[#e5e9e4] bg-gradient-to-b from-[#f4f7f4] to-[#fcfcf9]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-medium mb-6">
            <Sprout className="w-3.5 h-3.5" />
            <span>Ethnobotanical Knowledge Mining & Taxonomic Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0d281e] tracking-tight leading-tight mb-6">
            From Traditional Knowledge <br className="hidden sm:inline" />
            <span className="text-emerald-700">to Scientific Intelligence.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-8 font-normal leading-relaxed">
            EthnoTrace is an ambiguity-aware, provenance-preserving research intelligence platform.
            We extract, resolve, cross-validate, and map fragmented ethnobotanical manuscripts,
            regional vernacular names, and historical medicinal flora to modern botanical taxonomy
            and peer-reviewed scientific evidence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterWorkspace}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <span>Explore Research Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#architecture"
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-semibold transition-all"
            >
              Methodology & Architecture
            </a>
          </div>
        </div>
      </section>

      {/* The Ethnobotanical Dilemma (Problem Statement) */}
      <section className="py-16 px-6 border-b border-[#e5e9e4]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#0d281e]">The Problem in Ethnobotanical Mining</h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto mt-2">
              Traditional medicine contains millennia of therapeutic observations, but computational translation faces critical taxonomic and provenance barriers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-3">
                <Languages className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-2">Multilingual Polysemy & Ambiguity</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The same local name frequently points to completely distinct botanical species (e.g. <em>Brahmi</em> refers to <em>Bacopa monnieri</em> in the North and <em>Centella asiatica</em> in the South).
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-3">
                <Network className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-2">Unlinked Scientific Evidence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Traditional usage records are disconnected from in-vitro and clinical trial validation, making it impossible to separate folklore from clinically confirmed bioactivity.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mb-3">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-2">Loss of Cultural Provenance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generic automated scrapers discard vital preparation methods, ethnic communities, geographic coordinates, and historical context during extraction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Innovation & Capabilities */}
      <section id="architecture" className="py-16 px-6 border-b border-[#e5e9e4] bg-[#f8faf8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#0d281e]">The EthnoTrace Solution</h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto mt-2">
              A full-stack, ambiguity-aware pipeline integrating 11 technical modules with source-grounded scientific auditing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <Search className="w-5 h-5 text-emerald-700 mb-3" />
              <h4 className="font-semibold text-sm text-slate-900 mb-1">POWO & GBIF Resolution</h4>
              <p className="text-xs text-slate-600">
                Resolves regional, historical, and synonymic names against Kew Plants of the World Online taxonomic backbone.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <Network className="w-5 h-5 text-emerald-700 mb-3" />
              <h4 className="font-semibold text-sm text-slate-900 mb-1">Neo4j Knowledge Graph</h4>
              <p className="text-xs text-slate-600">
                Models complex relationships connecting plants, local names, traditional uses, compounds, and scientific publications.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-700 mb-3" />
              <h4 className="font-semibold text-sm text-slate-900 mb-1">Evidence Classification</h4>
              <p className="text-xs text-slate-600">
                Explicitly distinguishes traditional documentation from in-vitro assays, animal models, and randomized clinical trials.
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <Compass className="w-5 h-5 text-emerald-700 mb-3" />
              <h4 className="font-semibold text-sm text-slate-900 mb-1">Research Copilot</h4>
              <p className="text-xs text-slate-600">
                Answers research inquiries strictly grounded in indexed passages with exact page numbers, DOIs, and uncertainty notices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Responsibility Statement */}
      <section className="py-16 px-6 bg-[#0d281e] text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold tracking-tight">Scientific Responsibility & Traditional Knowledge Ethics</h3>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>No Treatment or Dosage Recommendations:</strong> EthnoTrace is an ethnobotanical research platform, not a medical prescriber. It never provides dosage instructions or clinical guarantees.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Preservation of Provenance:</strong> Every extracted plant mention is linked to its exact supporting page number, original language/script, and originating publication or manuscript.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>No Invented Data:</strong> The system enforces zero-hallucination policies. Unresolved historical terms are flagged for human review rather than forced into uncertain botanical matches.</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-900/60 flex items-center justify-between">
            <span className="text-xs text-emerald-400/80">EthnoHack 2026 • Product Standard Compliance</span>
            <button
              onClick={onEnterWorkspace}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              Open Workspace
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
