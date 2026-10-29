import { CodeSpace } from '../types';

export interface Achievement {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'clean' | 'gold';
  description: string;
  requirement: string;
  unlocked: boolean;
  progress: number;
  target: number;
  badgeLabel: string;
}

const STREAK_STORAGE_KEY = 'vms_commit_streak_days_v1';

/**
 * Gets or initializes the user's active streak days.
 * Defaults to 7 for the Enterprise Demo Account architect profile.
 */
export function getStoredStreakDays(): number {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    // Starts at 1 day active streak until maintained for 7 / 14 days
    localStorage.setItem(STREAK_STORAGE_KEY, '1');
    return 1;
  } catch {
    return 1;
  }
}

export function setStoredStreakDays(days: number): void {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, days.toString());
  } catch {
    // ignore
  }
}

/**
 * Evaluates all system achievements based on current workspace metrics.
 */
export function evaluateAchievements(
  codespaces: CodeSpace[],
  totalFiles: number,
  totalRevs: number,
  streakDays: number = getStoredStreakDays()
): Achievement[] {
  // 1. Bronze: Unlocked when user creates their first codespace and creates their first file or upload
  const bronzeUnlocked = codespaces.length >= 1 && (totalFiles >= 1 || totalRevs >= 1);

  // 2. Silver: When they create codespaces more than 10 (11th codespace created)
  const silverUnlocked = codespaces.length > 10;

  // 3. Clean Commit: 7-day version management streak
  const cleanCommitUnlocked = streakDays >= 7;

  // 4. Golden Commit: 14-day version management streak
  const goldenCommitUnlocked = streakDays >= 14;

  return [
    {
      id: 'vms-bronze',
      name: 'VMS - Bronze',
      tier: 'bronze',
      description: 'Created their first codespace',
      requirement: 'Create your first CodeSpace and initialize files or uploads',
      unlocked: bronzeUnlocked,
      progress: bronzeUnlocked ? 1 : codespaces.length > 0 ? 0.5 : 0,
      target: 1,
      badgeLabel: 'Bronze Tier',
    },
    {
      id: 'vms-silver',
      name: 'VMS - Silver',
      tier: 'silver',
      description: 'Created their 11th codespace',
      requirement: 'Expand workspace portfolio to more than 10 CodeSpaces',
      unlocked: silverUnlocked,
      progress: Math.min(codespaces.length, 11),
      target: 11,
      badgeLabel: 'Silver Tier',
    },
    {
      id: 'vms-clean-commit',
      name: 'VMS - Clean Commit',
      tier: 'clean',
      description: 'Maintained a 7-day version management streak',
      requirement: 'Hold version management across codespaces for 7 consecutive days',
      unlocked: cleanCommitUnlocked,
      progress: Math.min(streakDays, 7),
      target: 7,
      badgeLabel: 'Clean Commit',
    },
    {
      id: 'vms-golden-commit',
      name: 'VMS - Golden Commit',
      tier: 'gold',
      description: 'Maintained a 14-day version management streak',
      requirement: 'Hold version management across codespaces for 14 consecutive days',
      unlocked: goldenCommitUnlocked,
      progress: Math.min(streakDays, 14),
      target: 14,
      badgeLabel: 'Golden Commit',
    },
  ];
}
