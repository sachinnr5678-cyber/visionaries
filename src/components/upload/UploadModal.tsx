'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Zap,
} from 'lucide-react';
import { TrialService, AppAccountState } from '@/lib/services/trialService';
import TrialLimitModal from '../trial/TrialLimitModal';

export interface UploadPayload {
  file?: File;
  samplePath?: string;
  name: string;
  size: number;
  estimatedCredits: number;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAnalysis: (payload: UploadPayload) => void;
  account: AppAccountState;
}

export const REAL_SAMPLE_CHAPTERS = [
  {
    id: 'ch-linear-alg',
    title: 'Linear Algebra: Spectral Theory',
    subject: 'Pure Mathematics',
    author: 'Chapter 5 (Eigenvalues, SVD & Spectral Theorem)',
    samplePath: 'samples/Linear_Algebra_Spectral_Theory_Ch5.pdf',
    filename: 'Linear_Algebra_Spectral_Theory_Ch5.pdf',
    estimatedCredits: 1250,
  },
  {
    id: 'ch-quantum-mech',
    title: 'Quantum Mechanics: Wavefunctions',
    subject: 'Theoretical Physics',
    author: 'Chapter 3 (Schrödinger Equation, Superposition & Born)',
    samplePath: 'samples/Quantum_Mechanics_Wavefunctions_Ch3.pdf',
    filename: 'Quantum_Mechanics_Wavefunctions_Ch3.pdf',
    estimatedCredits: 1380,
  },
  {
    id: 'ch-ml-opt',
    title: 'Machine Learning: Optimization',
    subject: 'Computer Science & AI',
    author: 'Chapter 8 (SGD, Loss Surfaces & Adam)',
    samplePath: 'samples/Machine_Learning_Optimization_Ch8.pdf',
    filename: 'Machine_Learning_Optimization_Ch8.pdf',
    estimatedCredits: 1450,
  },
];

export default function UploadModal({
  isOpen,
  onClose,
  onStartAnalysis,
  account,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSample, setSelectedSample] = useState<(typeof REAL_SAMPLE_CHAPTERS)[0] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [limitModal, setLimitModal] = useState<{
    open: boolean;
    reason: 'TRIAL_EXPIRED' | 'INSUFFICIENT_CREDITS';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setSelectedSample(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSelectedSample(null);
    }
  };

  const selectSample = (sample: (typeof REAL_SAMPLE_CHAPTERS)[0]) => {
    setSelectedSample(sample);
    setSelectedFile(null);
  };

  const activeName = selectedFile?.name || selectedSample?.filename || '';
  const activeSize = selectedFile?.size || 1.8 * 1024 * 1024;
  const estimatedCredits = selectedFile
    ? Math.max(800, Math.min(3000, Math.round((selectedFile.size / 1024) * 0.8)))
    : selectedSample?.estimatedCredits || 1200;

  const handleConfirm = () => {
    // Validate trial status & remaining credit allowance
    const check = TrialService.canPerformAnalysis(estimatedCredits);
    if (!check.allowed) {
      setLimitModal({
        open: true,
        reason: check.reason || 'TRIAL_EXPIRED',
      });
      return;
    }

    if (selectedFile) {
      onStartAnalysis({
        file: selectedFile,
        name: selectedFile.name,
        size: selectedFile.size,
        estimatedCredits,
      });
    } else if (selectedSample) {
      onStartAnalysis({
        samplePath: selectedSample.samplePath,
        name: selectedSample.filename,
        size: activeSize,
        estimatedCredits,
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
        <div className="relative w-full max-w-2xl glass-panel-elevated rounded-3xl p-6 sm:p-8 text-[#F8FAFC] shadow-2xl border border-white/10">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close upload modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C63FF]/15 text-[#22D3EE] text-xs font-mono mb-3 border border-[#6C63FF]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>REAL DOCUMENT EXTRACTION</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Upload Textbook Chapter
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Extract real concepts, definitions, and relationships directly from the document text.
            </p>
          </div>

          {/* Upload Drop Zone */}
          {!selectedFile && !selectedSample ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#22D3EE] bg-[#22D3EE]/10 scale-[1.01]'
                  : 'border-white/15 hover:border-[#6C63FF]/60 hover:bg-[#6C63FF]/5 bg-[#050816]/60'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-[#6C63FF]/15 border border-[#6C63FF]/30 mx-auto flex items-center justify-center text-[#22D3EE] mb-4 shadow-lg shadow-[#6C63FF]/20">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">
                Drop your textbook chapter here
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                PDF, DOCX or TXT • Up to 50 MB
              </p>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                Browse Computer
              </button>
            </div>
          ) : (
            /* Selected File Preview Card */
            <div className="rounded-2xl border border-[#6C63FF]/40 bg-[#0B1020]/90 p-5 mb-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/20 border border-[#6C63FF]/40 flex items-center justify-center text-[#22D3EE]">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white max-w-sm truncate">
                      {activeName}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Ready for PyMuPDF parsing &amp; AI extraction
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setSelectedSample(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Remove selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Estimated Usage Badge */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#22D3EE]">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Estimated AI usage: ~{estimatedCredits.toLocaleString()} credits</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">
                  {account.credits.remainingCredits.toLocaleString()} available
                </span>
              </div>
            </div>
          )}

          {/* Quick Preloaded Real STEM Chapters */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Or analyze a real STEM sample textbook chapter:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {REAL_SAMPLE_CHAPTERS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => selectSample(sample)}
                  className={`p-3 text-left rounded-xl border transition-all group ${
                    selectedSample?.id === sample.id
                      ? 'bg-[#6C63FF]/20 border-[#6C63FF] text-white shadow-md'
                      : 'border-white/5 hover:border-[#6C63FF]/40 bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#22D3EE] mb-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{sample.subject}</span>
                  </div>
                  <div className="text-xs font-semibold text-white group-hover:text-[#22D3EE] transition-colors truncate">
                    {sample.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    ~{sample.estimatedCredits} credits
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedFile && !selectedSample}
              className={`px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg ${
                selectedFile || selectedSample
                  ? 'bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white hover:from-[#5b51ff] hover:to-[#7c4cf3] shadow-[#6C63FF]/30 hover:scale-[1.02]'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Analyze Chapter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trial Expiry / Limit Warning Modal */}
      {limitModal && (
        <TrialLimitModal
          isOpen={limitModal.open}
          onClose={() => setLimitModal(null)}
          reason={limitModal.reason}
          estimatedCredits={estimatedCredits}
          remainingCredits={account.credits.remainingCredits}
        />
      )}
    </>
  );
}
