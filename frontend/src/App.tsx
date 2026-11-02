import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentWorkspacePage } from './pages/DocumentWorkspacePage';
import { ExtractionReviewListPage } from './pages/ExtractionReviewListPage';
import { BotanicalExplorerPage } from './pages/BotanicalExplorerPage';
import { BotanicalResolutionPage } from './pages/BotanicalResolutionPage';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage';
import { EvidenceIntelligencePage } from './pages/EvidenceIntelligencePage';
import { HistoricalMapperPage } from './pages/HistoricalMapperPage';
import { KnowledgeGapsPage } from './pages/KnowledgeGapsPage';
import { GeographicalExplorerPage } from './pages/GeographicalExplorerPage';
import { ResearchCopilotPage } from './pages/ResearchCopilotPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { AuditReviewPage } from './pages/AuditReviewPage';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showLanding, setShowLanding] = useState<boolean>(false);

  if (showLanding) {
    return <LandingPage onEnterWorkspace={() => setShowLanding(false)} />;
  }

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardPage onNavigate={(tabId) => setActiveTab(tabId)} />;
      case 'documents':
        return <DocumentWorkspacePage />;
      case 'extractions':
        return <ExtractionReviewListPage />;
      case 'botanical':
        return <BotanicalExplorerPage />;
      case 'resolution':
        return <BotanicalResolutionPage />;
      case 'graph':
        return <KnowledgeGraphPage />;
      case 'evidence':
        return <EvidenceIntelligencePage />;
      case 'historical':
        return <HistoricalMapperPage />;
      case 'gaps':
        return <KnowledgeGapsPage />;
      case 'geographic':
        return <GeographicalExplorerPage />;
      case 'copilot':
        return <ResearchCopilotPage />;
      case 'sources':
        return <DataSourcesPage />;
      case 'audit':
        return <AuditReviewPage />;
      default:
        return <DashboardPage onNavigate={(tabId) => setActiveTab(tabId)} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f7f9f6] text-[#1a2421] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showLanding={showLanding}
        setShowLanding={setShowLanding}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {renderActiveModule()}
      </main>
    </div>
  );
}

export default App;
