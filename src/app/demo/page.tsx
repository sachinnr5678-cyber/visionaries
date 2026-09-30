'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import WorkspaceView from '@/components/graph/WorkspaceView';
import { linearAlgebraDemoGraph } from '@/data/demoGraph';
import UploadModal from '@/components/upload/UploadModal';
import { useRouter } from 'next/navigation';
import { TrialService, AppAccountState } from '@/lib/services/trialService';

export default function DemoPage() {
  const router = useRouter();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [account, setAccount] = useState<AppAccountState | null>(null);

  useEffect(() => {
    setAccount(TrialService.getAccount());
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050816] text-[#F8FAFC] flex flex-col">
      {/* Explicit Interactive Demo Banner */}
      <div className="w-full bg-[#6C63FF]/20 border-b border-[#6C63FF]/40 px-4 py-2 text-xs text-white flex items-center justify-between z-40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded-full bg-[#6C63FF] text-white font-bold tracking-wider">
            INTERACTIVE DEMO
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Exploring pre-compiled showcase: <strong className="text-white">Linear Algebra → Neural Networks</strong>.
          </span>
          <span className="text-[#34D399] font-mono text-[11px] hidden md:inline">
            (Zero trial credits consumed)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Upload Real PDF</span>
          </Link>
        </div>
      </div>

      {/* Main Workspace loaded with the flagship demo graph */}
      <div className="flex-1 w-full h-full relative">
        <WorkspaceView
          graphData={linearAlgebraDemoGraph}
          onBackToLanding={() => router.push('/')}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenDirectory={() => router.push('/')}
        />
      </div>

      {/* Upload Modal (redirects to main page to run real analysis) */}
      {account && (
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onStartAnalysis={() => {
            setIsUploadOpen(false);
            router.push('/');
          }}
          account={account}
        />
      )}
    </div>
  );
}
