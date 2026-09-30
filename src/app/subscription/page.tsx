'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Check,
  Sparkles,
  Zap,
  ArrowLeft,
  Shield,
  Layers,
  GraduationCap,
  Crown,
  Info,
} from 'lucide-react';
import { TrialService, AppAccountState } from '@/lib/services/trialService';

export default function SubscriptionPage() {
  const [account, setAccount] = useState<AppAccountState | null>(null);
  const [prototypeModal, setPrototypeModal] = useState<string | null>(null);

  useEffect(() => {
    setAccount(TrialService.getAccount());
  }, []);

  const handleUpgradeClick = (planName: string) => {
    setPrototypeModal(planName);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-[#F8FAFC] selection:bg-[#6C63FF]/30 selection:text-[#22D3EE] stem-grid-bg p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-10">
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
                <span>Subscription Plans</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#6C63FF]/20 text-[#22D3EE] border border-[#6C63FF]/30">
                  PLANS &amp; PRICING
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Scale your STEM concept mapping and AI synthesis capabilities
              </p>
            </div>
          </div>

          <Link
            href="/usage"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10"
          >
            View Usage
          </Link>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Free Trial (Current) */}
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-[#22D3EE]/40 flex flex-col justify-between relative shadow-xl">
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#22D3EE] text-slate-950 text-[10px] font-mono font-bold uppercase tracking-wider shadow-md">
              Current Plan
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#22D3EE] mb-2">
                <Sparkles className="w-4 h-4" />
                <span>EVALUATION TIER</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">7-Day Free Trial</h3>
              <p className="text-xs text-slate-400 mb-6">
                Full core concept mapping for undergraduate STEM coursework.
              </p>

              <div className="mb-6 pb-6 border-b border-white/5">
                <div className="text-3xl font-bold text-white font-mono">$0</div>
                <span className="text-xs text-slate-400">7 days access</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22D3EE] shrink-0" />
                  <span>5,000 AI Credits included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22D3EE] shrink-0" />
                  <span>Real PDF text extraction</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22D3EE] shrink-0" />
                  <span>Interactive 2D &amp; 3D knowledge graphs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#22D3EE] shrink-0" />
                  <span>Verbatim textbook evidence citations</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <button
                disabled
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/10 text-slate-400 cursor-default border border-white/5"
              >
                Active on your account
              </button>
            </div>
          </div>

          {/* Plan 2: Student */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-[#6C63FF]/50 transition-all flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#6C63FF] mb-2">
                <GraduationCap className="w-4 h-4" />
                <span>STUDENT TIER</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Student</h3>
              <p className="text-xs text-slate-400 mb-6">
                For active university students tackling multiple STEM courses.
              </p>

              <div className="mb-6 pb-6 border-b border-white/5">
                <div className="text-3xl font-bold text-white font-mono">
                  $9<span className="text-base text-slate-400 font-sans font-normal"> /mo</span>
                </div>
                <span className="text-xs text-slate-400">Billed semesterly or monthly</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6C63FF] shrink-0" />
                  <span>35,000 AI Credits / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6C63FF] shrink-0" />
                  <span>Cross-chapter curriculum connections</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6C63FF] shrink-0" />
                  <span>Unlimited concept map exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6C63FF] shrink-0" />
                  <span>High-speed AI model priority</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => handleUpgradeClick('Student Plan')}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#6C63FF] hover:bg-[#5b51ff] text-white transition-all shadow-md shadow-[#6C63FF]/30"
              >
                Upgrade to Student
              </button>
            </div>
          </div>

          {/* Plan 3: Pro */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-[#8B5CF6]/50 transition-all flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#8B5CF6] mb-2">
                <Crown className="w-4 h-4" />
                <span>RESEARCH &amp; PRO TIER</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Pro Researcher</h3>
              <p className="text-xs text-slate-400 mb-6">
                For graduate researchers, teaching assistants, and STEM labs.
              </p>

              <div className="mb-6 pb-6 border-b border-white/5">
                <div className="text-3xl font-bold text-white font-mono">
                  $24<span className="text-base text-slate-400 font-sans font-normal"> /mo</span>
                </div>
                <span className="text-xs text-slate-400">Unlimited full textbooks</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                  <span>150,000 AI Credits / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                  <span>Large 500+ page textbook chunking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                  <span>Custom LLM endpoint connectivity</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                  <span>Collaborative graph sharing</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => handleUpgradeClick('Pro Researcher Plan')}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#5b51ff] hover:to-[#7c4cf3] text-white transition-all shadow-md shadow-[#8B5CF6]/30"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        {/* Prototype Payment Modal */}
        {prototypeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
            <div className="relative w-full max-w-md glass-panel-elevated rounded-3xl p-6 sm:p-8 text-center text-[#F8FAFC] border border-white/10 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#6C63FF]/20 border border-[#6C63FF]/40 mx-auto flex items-center justify-center text-[#22D3EE]">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Prototype Mode: {prototypeModal}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Payments will be available soon. For this prototype, all core concept mapping
                functionality is active on your 7-day free trial.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setPrototypeModal(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
