'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Sparkles,
  Zap,
  ArrowLeft,
  Calendar,
  Layers,
  History,
  AlertTriangle,
  RotateCcw,
  FastForward,
  CheckCircle2,
} from 'lucide-react';
import { TrialService, AppAccountState } from '@/lib/services/trialService';

export default function UsagePage() {
  const [account, setAccount] = useState<AppAccountState | null>(null);

  useEffect(() => {
    setAccount(TrialService.getAccount());
  }, []);

  if (!account) return null;

  const calc = TrialService.getTrialCalculations(account);

  const startFormatted = new Date(account.trial.startDate).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const endFormatted = new Date(account.trial.endDate).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const creditUsedPercent = Math.min(
    100,
    Math.round((account.credits.usedCredits / account.credits.totalAllowance) * 100)
  );

  const handleFastForward = (days: number) => {
    const updated = TrialService.simulateFastForwardDays(days);
    setAccount({ ...updated });
  };

  const handleReset = () => {
    const updated = TrialService.resetTrial();
    setAccount({ ...updated });
  };

  return (
    <div className="min-h-screen bg-[#050816] text-[#F8FAFC] selection:bg-[#6C63FF]/30 selection:text-[#22D3EE] stem-grid-bg p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Return to Workspace"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Usage &amp; Free Trial</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#6C63FF]/20 text-[#22D3EE] border border-[#6C63FF]/30">
                  7-DAY TRIAL
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor your trial countdown and AI token consumption allowance
              </p>
            </div>
          </div>

          <Link
            href="/subscription"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6C63FF] hover:bg-[#5b51ff] text-white transition-all shadow-md shadow-[#6C63FF]/30"
          >
            Upgrade Plan
          </Link>
        </div>

        {/* 7-Day Free Trial Overview Card */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div>
              <div className="text-[11px] font-mono text-[#22D3EE] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Subscription Status: Active Trial</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                7-Day Free Trial
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 font-mono">Time Remaining</span>
              <div className="text-xl font-bold text-white font-mono mt-0.5 flex items-center sm:justify-end gap-1.5">
                <Clock className="w-4 h-4 text-[#22D3EE]" />
                <span>{calc.formattedTimeRemaining}</span>
              </div>
            </div>
          </div>

          {/* Timeline Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Trial Started</span>
              </div>
              <div className="text-sm font-semibold text-white font-mono">
                {startFormatted}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Trial Ends</span>
              </div>
              <div className="text-sm font-semibold text-[#22D3EE] font-mono">
                {endFormatted}
              </div>
            </div>
          </div>

          {/* Time Elapsed Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span>Trial Period Duration (7 Days)</span>
              <span>{Math.round(calc.percentTimeElapsed)}% Elapsed</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-[#6C63FF] to-[#22D3EE] h-full rounded-full transition-all duration-300"
                style={{ width: `${calc.percentTimeElapsed}%` }}
              />
            </div>
          </div>
        </div>

        {/* AI Credits Consumption Card */}
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <div>
              <div className="text-[11px] font-mono text-[#8B5CF6] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>AI Computation Allowance</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                AI Credits
              </h3>
            </div>

            <div className="text-right font-mono">
              <div className="text-2xl font-bold text-white">
                {account.credits.remainingCredits.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400">
                / {account.credits.totalAllowance.toLocaleString()} remaining
              </div>
            </div>
          </div>

          {/* Credits Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span>Consumed: {account.credits.usedCredits.toLocaleString()} credits</span>
              <span>Available: {account.credits.remainingCredits.toLocaleString()} credits</span>
            </div>
            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden p-[1px] border border-white/10">
              <div
                className="bg-gradient-to-r from-[#8B5CF6] via-[#6C63FF] to-[#22D3EE] h-full rounded-full transition-all duration-300"
                style={{ width: `${100 - creditUsedPercent}%` }}
              />
            </div>
          </div>

          {/* Recent Activity Log */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Recent AI Activity</span>
            </h4>

            {account.credits.activityHistory.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-500">
                No textbook analysis performed yet during this trial session.
              </div>
            ) : (
              <div className="space-y-2">
                {account.credits.activityHistory.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{act.action}</span>
                      <span className="text-slate-400 ml-2 font-mono text-[11px]">
                        ({act.documentName})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[#34D399] font-semibold">
                        -{act.creditsConsumed.toLocaleString()} credits
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Prototype / Developer Testing Bar */}
        <div className="p-5 rounded-2xl bg-[#0B1020]/60 border border-white/10 space-y-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Prototype Trial Simulation Controls</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Test how the application behaves as the 7-day clock advances or when the trial expires:
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => handleFastForward(5)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1.5"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Fast-Forward 5 Days (&lt;48h remaining)</span>
            </button>
            <button
              onClick={() => handleFastForward(7)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-red-300 border border-red-500/30 transition-colors flex items-center gap-1.5"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Fast-Forward 7 Days (Simulate Expiry)</span>
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset 7-Day Trial</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
