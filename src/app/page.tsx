'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LandingView from '@/components/landing/LandingView';
import UploadModal, { UploadPayload } from '@/components/upload/UploadModal';
import ProcessingScreen from '@/components/processing/ProcessingScreen';
import WorkspaceView from '@/components/graph/WorkspaceView';
import MapsDirectory from '@/components/dashboard/MapsDirectory';
import TrialBanner from '@/components/trial/TrialBanner';
import { KnowledgeGraphData } from '@/types/graph';
import { ProcessingUpdate } from '@/lib/ai/pipeline';
import { TrialService, AppAccountState } from '@/lib/services/trialService';
import { AlertCircle, X } from 'lucide-react';

type AppViewState = 'landing' | 'processing' | 'workspace' | 'directory';

export default function Home() {
  const router = useRouter();
  const [account, setAccount] = useState<AppAccountState | null>(null);
  const [viewState, setViewState] = useState<AppViewState>('landing');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeGraph, setActiveGraph] = useState<KnowledgeGraphData | null>(null);
  const [userMaps, setUserMaps] = useState<KnowledgeGraphData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real Processing State
  const [processingDocName, setProcessingDocName] = useState('Document.pdf');
  const [processingUpdate, setProcessingUpdate] = useState<ProcessingUpdate>({
    stage: 'reading',
    progress: 0,
    statusMessage: 'Preparing document for PyMuPDF extraction...',
    discoveredConcepts: [],
    discoveredRelationships: [],
  });

  useEffect(() => {
    setAccount(TrialService.getAccount());
    try {
      const stored = localStorage.getItem('docpulse_user_maps');
      if (stored) {
        setUserMaps(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load saved user maps:', e);
    }
  }, []);

  // Handler for starting REAL analysis from Upload Modal via SSE stream
  const handleStartAnalysis = async (payload: UploadPayload) => {
    setIsUploadOpen(false);
    setErrorMessage(null);
    setProcessingDocName(payload.name);
    setProcessingUpdate({
      stage: 'reading',
      progress: 5,
      statusMessage: `Uploading "${payload.name}" to extraction server...`,
      discoveredConcepts: [],
      discoveredRelationships: [],
    });
    setViewState('processing');

    try {
      const formData = new FormData();
      if (payload.file) {
        formData.append('file', payload.file);
      } else if (payload.samplePath) {
        formData.append('samplePath', payload.samplePath);
      }

      const response = await fetch('/api/analyze/stream', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to open streaming response reader.');

      const decoder = new TextDecoder();
      let buffer = '';
      let receivedGraph: KnowledgeGraphData | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const jsonStr = trimmed.replace(/^data:\s*/, '');
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.stage === 'error') {
              throw new Error(event.error || 'Pipeline execution failed.');
            }

            // Map server stage to UI stage
            let uiStage: ProcessingUpdate['stage'] = 'reading';
            if (event.stage === 'ai_extraction') uiStage = 'extracting_concepts';
            else if (event.stage === 'resolving_entities') uiStage = 'discovering_relations';
            else if (event.stage === 'building_graph') uiStage = 'building_graph';
            else if (event.stage === 'completed') uiStage = 'completed';

            setProcessingUpdate((prev) => ({
              stage: uiStage,
              progress: event.progress || prev.progress,
              statusMessage: event.message || prev.statusMessage,
              discoveredConcepts: event.discoveredConcepts
                ? event.discoveredConcepts.map((c: any, i: number) => ({
                    id: `c_${i}`,
                    label: c.name,
                    type: c.type || 'Definition',
                  }))
                : prev.discoveredConcepts,
              discoveredRelationships: event.discoveredRelationships
                ? event.discoveredRelationships.map((r: any, i: number) => ({
                    id: `r_${i}`,
                    source: r.source,
                    target: r.target,
                    relation: r.relation,
                  }))
                : prev.discoveredRelationships,
            }));

            if (event.stage === 'completed' && event.graph) {
              receivedGraph = event.graph;
            }
          } catch (parseErr: any) {
            if (parseErr.message && !parseErr.message.includes('JSON')) {
              throw parseErr;
            }
          }
        }
      }

      if (!receivedGraph) {
        throw new Error('Processing ended without a finalized knowledge graph.');
      }

      // Deduct actual credits consumed and log activity
      const updatedAccount = TrialService.consumeCredits(
        'PDF Concept Extraction',
        payload.name,
        payload.estimatedCredits
      );
      setAccount({ ...updatedAccount });

      setActiveGraph(receivedGraph);
      setUserMaps((prev) => {
        const next = [receivedGraph!, ...prev.filter((m) => m.id !== receivedGraph!.id)];
        try {
          localStorage.setItem('docpulse_user_maps', JSON.stringify(next));
        } catch (e) {
          console.warn('Failed to persist user maps to localStorage:', e);
        }
        return next;
      });
      setViewState('workspace');
    } catch (err: any) {
      console.error('Real pipeline error:', err);
      setErrorMessage(
        err.message ||
          'Failed to extract knowledge graph. Please ensure the document is a valid STEM textbook with selectable text.'
      );
      setViewState('landing');
    }
  };

  // Dedicated demo flow: routes to /demo
  const handleStartDemo = () => {
    router.push('/demo');
  };

  if (!account) return null;

  return (
    <div className="relative min-h-screen bg-[#050816] text-[#F8FAFC] flex flex-col">
      {/* Dynamic 7-Day Free Trial Banner */}
      <TrialBanner account={account} />

      {/* Error Alert Toast */}
      {errorMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full p-4 mx-4">
          <div className="bg-red-950/90 border border-red-500/50 rounded-2xl p-4 text-xs text-white shadow-2xl flex items-start justify-between gap-3 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-red-200 block mb-0.5">
                  Document Analysis Error
                </strong>
                <span className="text-slate-300 leading-relaxed">{errorMessage}</span>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <div className="flex-1 w-full relative">
        {/* 1. Landing View */}
        {viewState === 'landing' && (
          <LandingView
            onStartDemo={handleStartDemo}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenWorkspace={() => setViewState('directory')}
            account={account}
          />
        )}

        {/* 2. Real Processing Screen */}
        {viewState === 'processing' && (
          <ProcessingScreen
            fileName={processingDocName}
            update={processingUpdate}
          />
        )}

        {/* 3. Main Concept Map Workspace (Only real generated graph data!) */}
        {viewState === 'workspace' && activeGraph && (
          <WorkspaceView
            graphData={activeGraph}
            onBackToLanding={() => setViewState('landing')}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenDirectory={() => setViewState('directory')}
          />
        )}

        {/* 4. My Concept Maps Directory */}
        {viewState === 'directory' && (
          <MapsDirectory
            onSelectMap={(map) => {
              setActiveGraph(map);
              setViewState('workspace');
            }}
            onNewMap={() => setIsUploadOpen(true)}
            onBackToGraph={() => {
              if (activeGraph) setViewState('workspace');
              else setViewState('landing');
            }}
            userMaps={userMaps}
          />
        )}
      </div>

      {/* Real Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onStartAnalysis={handleStartAnalysis}
        account={account}
      />
    </div>
  );
}
