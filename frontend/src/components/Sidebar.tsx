import React from 'react';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Sprout,
  Search,
  Network,
  ShieldAlert,
  History,
  AlertTriangle,
  MapPin,
  Bot,
  Database,
  SlidersHorizontal,
  Home,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showLanding: boolean;
  setShowLanding: (show: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  showLanding,
  setShowLanding
}) => {
  const navItems = [
    { id: 'overview', label: 'Research Overview', icon: LayoutDashboard },
    { id: 'documents', label: 'Document Intelligence', icon: FileText },
    { id: 'extractions', label: 'Extraction Review', icon: CheckSquare },
    { id: 'botanical', label: 'Botanical Explorer', icon: Sprout },
    { id: 'resolution', label: 'Name Resolution', icon: Search },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'evidence', label: 'Evidence Intelligence', icon: ShieldAlert },
    { id: 'historical', label: 'Historical Mapper', icon: History },
    { id: 'gaps', label: 'Knowledge Gaps', icon: AlertTriangle },
    { id: 'geographic', label: 'Geographic Explorer', icon: MapPin },
    { id: 'copilot', label: 'Research Copilot', icon: Bot },
    { id: 'sources', label: 'Data Sources Registry', icon: Database },
    { id: 'audit', label: 'Review & Audit Trail', icon: SlidersHorizontal }
  ];

  return (
    <aside className="w-64 bg-[#0d281e] text-slate-100 flex flex-col h-screen select-none border-r border-[#1a4032]">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1b533f]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <Sprout className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-base tracking-wide text-white">EthnoTrace</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 font-normal truncate">
              Scientific Ethnobotanical Intelligence
            </p>
          </div>
        </div>

        {/* Hackathon Badge */}
        <div className="mt-3 px-2 py-1 bg-emerald-950/60 border border-emerald-800/40 rounded text-[11px] text-emerald-300/90 flex items-center justify-between">
          <span>EthnoHack 2026</span>
          <span className="text-[10px] text-emerald-400 font-mono">Track 1</span>
        </div>
      </div>

      {/* Landing page toggle */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => setShowLanding(!showLanding)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
            showLanding
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-[#133e2f] hover:text-white'
          }`}
        >
          {showLanding ? <LayoutDashboard className="w-4 h-4" /> : <Home className="w-4 h-4" />}
          <span>{showLanding ? 'Enter Research Workspace' : 'Product Landing Page'}</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-emerald-400/60 uppercase">
          Workspace Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = !showLanding && activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setShowLanding(false);
                setActiveTab(item.id);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600/90 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-[#133e2f] hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400/80'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Scientific Integrity Footer */}
      <div className="p-3 border-t border-[#1b533f] bg-[#091f17] text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium mb-0.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>POWO & MPNS Grounded</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Provenanced traditional knowledge with experimental validation.
        </p>
      </div>
    </aside>
  );
};
