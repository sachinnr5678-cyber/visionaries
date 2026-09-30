'use client';

export type TrialStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface TrialState {
  startDate: string; // ISO string
  endDate: string; // ISO string
  durationDays: number;
}

export interface CreditActivity {
  id: string;
  timestamp: string;
  action: string;
  documentName: string;
  creditsConsumed: number;
}

export interface CreditState {
  totalAllowance: number;
  usedCredits: number;
  remainingCredits: number;
  activityHistory: CreditActivity[];
}

export interface SubscriptionState {
  plan: 'trial' | 'student' | 'pro';
  status: 'active' | 'canceled' | 'past_due';
}

export interface AppAccountState {
  user: UserProfile;
  trial: TrialState;
  credits: CreditState;
  subscription: SubscriptionState;
}

const STORAGE_KEY = 'vcm_trial_account_v2';
const DEFAULT_TRIAL_DAYS = 7;
const DEFAULT_CREDIT_ALLOWANCE = 5000;

export class TrialService {
  private static getInitialState(): AppAccountState {
    const now = new Date();
    const endDate = new Date(now.getTime() + DEFAULT_TRIAL_DAYS * 24 * 60 * 60 * 1000);

    return {
      user: {
        id: 'usr_stem_learner_01',
        name: 'Alex Rivera',
        email: 'alex.rivera@university.edu',
      },
      trial: {
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        durationDays: DEFAULT_TRIAL_DAYS,
      },
      credits: {
        totalAllowance: DEFAULT_CREDIT_ALLOWANCE,
        usedCredits: 0,
        remainingCredits: DEFAULT_CREDIT_ALLOWANCE,
        activityHistory: [],
      },
      subscription: {
        plan: 'trial',
        status: 'active',
      },
    };
  }

  static getAccount(): AppAccountState {
    if (typeof window === 'undefined') {
      return this.getInitialState();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const initial = this.getInitialState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load trial account state:', e);
      return this.getInitialState();
    }
  }

  static saveAccount(state: AppAccountState): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save trial account state:', e);
    }
  }

  static getTrialCalculations(state: AppAccountState) {
    const now = new Date().getTime();
    const end = new Date(state.trial.endDate).getTime();
    const start = new Date(state.trial.startDate).getTime();

    const msRemaining = Math.max(0, end - now);
    const totalDurationMs = Math.max(1, end - start);

    const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
    const daysRemaining = Math.floor(hoursRemaining / 24);
    const leftoverHours = hoursRemaining % 24;

    let status: TrialStatus = 'ACTIVE';
    if (msRemaining <= 0) {
      status = 'EXPIRED';
    } else if (hoursRemaining <= 48) {
      status = 'EXPIRING_SOON';
    }

    return {
      msRemaining,
      daysRemaining,
      leftoverHours,
      totalHoursRemaining: hoursRemaining,
      status,
      formattedTimeRemaining:
        daysRemaining > 0
          ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} ${leftoverHours}h remaining`
          : `${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} remaining`,
      percentTimeElapsed: Math.min(100, Math.max(0, ((now - start) / totalDurationMs) * 100)),
    };
  }

  static canPerformAnalysis(estimatedCredits: number): {
    allowed: boolean;
    reason?: 'TRIAL_EXPIRED' | 'INSUFFICIENT_CREDITS';
    message?: string;
  } {
    const account = this.getAccount();
    const { status } = this.getTrialCalculations(account);

    if (status === 'EXPIRED') {
      return {
        allowed: false,
        reason: 'TRIAL_EXPIRED',
        message: 'Your 7-day free trial has ended. Upgrade to continue creating AI concept maps.',
      };
    }

    if (account.credits.remainingCredits < estimatedCredits) {
      return {
        allowed: false,
        reason: 'INSUFFICIENT_CREDITS',
        message: `Your AI credits are exhausted. You need ${estimatedCredits} credits, but have ${account.credits.remainingCredits} remaining.`,
      };
    }

    return { allowed: true };
  }

  static consumeCredits(
    actionName: string,
    documentName: string,
    creditsToConsume: number
  ): AppAccountState {
    const account = this.getAccount();
    const actualConsume = Math.min(account.credits.remainingCredits, Math.max(0, creditsToConsume));

    const newRemaining = Math.max(0, account.credits.remainingCredits - actualConsume);
    const newUsed = account.credits.usedCredits + actualConsume;

    const activity: CreditActivity = {
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: actionName,
      documentName,
      creditsConsumed: actualConsume,
    };

    const updated: AppAccountState = {
      ...account,
      credits: {
        ...account.credits,
        usedCredits: newUsed,
        remainingCredits: newRemaining,
        activityHistory: [activity, ...account.credits.activityHistory].slice(0, 30),
      },
    };

    this.saveAccount(updated);
    return updated;
  }

  // Developer / Testing simulation helpers:
  static simulateFastForwardDays(days: number): AppAccountState {
    const account = this.getAccount();
    const currentEnd = new Date(account.trial.endDate).getTime();
    const newEnd = new Date(currentEnd - days * 24 * 60 * 60 * 1000);

    const updated: AppAccountState = {
      ...account,
      trial: {
        ...account.trial,
        endDate: newEnd.toISOString(),
      },
    };
    this.saveAccount(updated);
    return updated;
  }

  static resetTrial(): AppAccountState {
    const initial = this.getInitialState();
    this.saveAccount(initial);
    return initial;
  }
}
