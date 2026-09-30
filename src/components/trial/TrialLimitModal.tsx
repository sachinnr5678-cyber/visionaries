'use client';

import React from 'react';
import Link from 'next/link';
import { X, ShieldAlert, ZapOff, ArrowRight } from 'lucide-react';

interface TrialLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: 'TRIAL_EXPIRED' | 'INSUFFICIENT_CREDITS';
  estimatedCredits?: number;
  remainingCredits?: number;
}

export default function TrialLimitModal({
  isOpen,
  onClose,
  reason,
  estimatedCredits = 1500,
  remainingCredits = 0,
}: TrialLimitModalProps) {
  if (!isOpen) return null;

  const isExpired = reason === 'TRIAL_EXPIRED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel-elevated rounded-3xl p-6 sm:p-8 text-center text-[#F8FAFC] border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5 ${
            isExpired
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}
        >
          {isExpired ? (
            <ShieldAlert className="w-7 h-7" />
          ) : (
            <ZapOff className="w-7 h-7" />
          )}
        </div>

        {/* Heading */}
        <h3 className="text-xl font-bold text-white mb-2">
          {isExpired ? 'Your free trial has ended' : 'AI credits exhausted'}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          {isExpired ? (
            <>
              Your 7-day free trial has expired. Upgrade your subscription to continue creating
              new AI-powered concept maps from textbooks.
              <br />
              <span className="text-slate-400 mt-2 block text-xs">
                Your existing concept maps remain fully interactive and accessible.
              </span>
            </>
          ) : (
            <>
              This analysis requires approximately{' '}
              <strong className="text-white font-mono">{estimatedCredits.toLocaleString()}</strong> credits,
              but your trial balance has{' '}
              <strong className="text-amber-300 font-mono">{remainingCredits.toLocaleString()}</strong> remaining.
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Explore Existing Maps
          </button>
          <Link
            href="/subscription"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#5b51ff] hover:to-[#7c4cf3] text-white transition-all shadow-lg shadow-[#6C63FF]/30 flex items-center justify-center gap-2"
          >
            <span>View Plans</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
