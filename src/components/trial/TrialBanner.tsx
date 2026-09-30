'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Zap,
  User,
} from 'lucide-react';
import { TrialService, AppAccountState } from '@/lib/services/trialService';

interface TrialBannerProps {
  account: AppAccountState;
  onOpenPlans?: () => void;
}

export default function TrialBanner({ account, onOpenPlans }: TrialBannerProps) {
  const calc = TrialService.getTrialCalculations(account);

  const trialEndFormatted = new Date(account.trial.endDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (calc.status === 'EXPIRED') {
    return (
      <div className="w-full bg-gradient-to-r from-red-950/80 via-rose-900/60 to-red-950/80 border-b border-red-500/30 px-4 py-2.5 text-xs text-white flex items-center justify-between shadow-lg relative z-40">
        <div className="flex items-center gap-2.5 max-w-2xl truncate">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
          <span className="font-semibold text-red-200">Your 7-day free trial has ended.</span>
          <span className="text-slate-300 hidden sm:inline">
            Existing concept maps remain viewable. Upgrade to continue creating new AI concept maps.
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/login"
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors flex items-center gap-1.5"
            title={`Account: ${account.user.name} (${account.user.email})`}
          >
            <User className="w-3 h-3 text-red-300" />
            <span className="hidden sm:inline max-w-[100px] truncate">{account.user.name}</span>
          </Link>
          <Link
            href="/subscription"
            className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-red-500/30"
          >
            <span>View Plans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const isExpiringSoon = calc.status === 'EXPIRING_SOON';

  return (
    <div
      className={`w-full border-b px-4 py-2 text-xs transition-colors relative z-40 flex items-center justify-between ${
        isExpiringSoon
          ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
          : 'bg-[#0B1020]/90 backdrop-blur-md border-white/5 text-slate-300'
      }`}
    >
      <div className="flex items-center gap-3 truncate">
        <div className="flex items-center gap-1.5">
          {isExpiringSoon ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />
          )}
          <span className="font-semibold text-white">Free Trial</span>
        </div>

        <span className="text-white/20">•</span>

        <div className="flex items-center gap-1 text-slate-300 truncate">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{calc.formattedTimeRemaining}</span>
          <span className="text-slate-500 text-[11px] hidden md:inline">
            (ends {trialEndFormatted})
          </span>
        </div>

        <span className="text-white/20 hidden sm:inline">•</span>

        <div className="hidden sm:flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-[#22D3EE]" />
          <span>
            <strong className="text-white font-mono">
              {account.credits.remainingCredits.toLocaleString()}
            </strong>{' '}
            / {account.credits.totalAllowance.toLocaleString()} AI credits left
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
        <Link
          href="/login"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-[11px] transition-all border border-white/5"
          title={`Signed in as ${account.user.name} (${account.user.email}) - Click to manage or switch account`}
        >
          <User className="w-3 h-3 text-[#22D3EE]" />
          <span className="hidden sm:inline max-w-[110px] truncate">{account.user.name}</span>
          <span className="sm:hidden">Account</span>
        </Link>

        <Link
          href="/usage"
          className="text-[11px] text-slate-400 hover:text-white transition-colors hidden lg:inline"
        >
          Usage Details
        </Link>

        <Link
          href="/subscription"
          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#6C63FF] text-white font-medium text-[11px] transition-all flex items-center gap-1 border border-white/10 hover:border-[#6C63FF]"
        >
          <span>View Plans</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
