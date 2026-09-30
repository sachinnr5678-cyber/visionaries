'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Share2,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { TrialService } from '@/lib/services/trialService';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Create or login account with 7-Day Free Trial
    setTimeout(() => {
      const current = TrialService.getAccount();
      const updated = {
        ...current,
        user: {
          id: `usr_${Date.now()}`,
          name: name || (isSignUp ? 'STEM Student' : current.user.name),
          email: email || current.user.email,
        },
      };
      TrialService.saveAccount(updated);
      setIsLoading(false);
      router.push('/');
    }, 400);
  };

  const handleQuickDemoLogin = (demoRole: string, demoEmail: string) => {
    const current = TrialService.getAccount();
    const updated = {
      ...current,
      user: {
        id: `usr_${Date.now()}`,
        name: demoRole,
        email: demoEmail,
      },
    };
    TrialService.saveAccount(updated);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#050816] text-[#F8FAFC] selection:bg-[#6C63FF]/30 selection:text-[#22D3EE] stem-grid-bg flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 glass-panel-elevated rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Left Side: Benefits Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0B1020] via-[#0E152D] to-[#0B1020] p-8 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6C63FF]/15 blur-3xl pointer-events-none" />

          <div>
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#22D3EE] p-[1px] flex items-center justify-center shadow-lg shadow-[#6C63FF]/25">
                <div className="w-full h-full bg-[#0B1020] rounded-[11px] flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-[#22D3EE]" />
                </div>
              </div>
              <span className="font-bold text-base tracking-tight text-white">
                Visual Concept Mapper
              </span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C63FF]/20 text-[#22D3EE] text-[11px] font-mono mb-4 border border-[#6C63FF]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>7-DAY FREE TRIAL INCLUDED</span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight leading-snug mb-3">
              Explore STEM concepts through interactive 3D knowledge graphs.
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Turn dense textbook chapters into connected clarity with verifiable evidence citations.
            </p>

            {/* Trial Perks */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span><strong>7 Days Full Access</strong> — no credit card required.</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span><strong>5,000 AI Credits</strong> for real textbook PDF extraction.</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span><strong>Verifiable Citations</strong> — trace every concept back to the source page.</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-[11px] text-slate-500 font-mono">
            Prototype Auth Tier • Instant Evaluation
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 p-1 bg-white/[0.03] rounded-xl border border-white/5 w-fit">
            <button
              onClick={() => setIsSignUp(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSignUp
                  ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Start Free Trial
            </button>
            <button
              onClick={() => setIsSignUp(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isSignUp
                  ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isSignUp
                ? 'Your 7-day trial and 5,000 AI credits will activate immediately.'
                : 'Access your saved concept maps and active trial workspace.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full bg-[#050816]/70 border border-white/10 rounded-xl px-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6C63FF] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Academic or Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.rivera@university.edu"
                  className="w-full bg-[#050816]/70 border border-white/10 rounded-xl px-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6C63FF] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#050816]/70 border border-white/10 rounded-xl px-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6C63FF] transition-colors"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  University / Institution (Optional)
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Stanford University, MIT, Berkeley"
                    className="w-full bg-[#050816]/70 border border-white/10 rounded-xl px-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#6C63FF] transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#5b51ff] hover:to-[#7c4cf3] text-white transition-all shadow-lg shadow-[#6C63FF]/30 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
            >
              <span>{isSignUp ? 'Start 7-Day Free Trial' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Personas */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <span className="text-[11px] font-mono uppercase text-slate-500 block mb-2">
              Quick 1-Click Demo Profiles:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin('Jordan Taylor (Student)', 'jordan.taylor@caltech.edu')
                }
                className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-left transition-colors"
              >
                <div className="text-xs font-semibold text-white truncate">Jordan Taylor</div>
                <div className="text-[10px] text-slate-400 truncate">Undergraduate Student</div>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin('Dr. Elena Rostova', 'elena.rostova@physics.lab.edu')
                }
                className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-left transition-colors"
              >
                <div className="text-xs font-semibold text-white truncate">Dr. Elena Rostova</div>
                <div className="text-[10px] text-slate-400 truncate">STEM Researcher</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
