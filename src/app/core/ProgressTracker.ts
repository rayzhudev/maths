export interface UserProgress {
  totalScore: number
  totalQuestions: number
  totalCorrect: number
  bestStreak: number
  challengeStats: Map<string, ChallengeStats>
  achievements: Achievement[]
  lastPlayed: Date
  totalPlayTime: number
}

export interface ChallengeStats {
  challengeType: string
  level: 'easy' | 'medium' | 'hard'
  timesPlayed: number
  bestScore: number
  bestAccuracy: number
  averageTime: number
  totalQuestions: number
  totalCorrect: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
  category: 'streak' | 'accuracy' | 'speed' | 'milestone'
}

export class ProgressTracker {
  private progress: UserProgress
  private storageKey = 'math-practice-progress'

  constructor() {
    this.progress = this.getDefaultProgress()
  }

  async load(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.progress = {
          ...data,
          challengeStats: new Map(data.challengeStats || []),
          achievements: data.achievements || [],
          lastPlayed: new Date(data.lastPlayed || Date.now())
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
      this.progress = this.getDefaultProgress()
    }
  }

  async save(): Promise<void> {
    try {
      const dataToStore = {
        ...this.progress,
        challengeStats: Array.from(this.progress.challengeStats.entries()),
        lastPlayed: new Date().toISOString()
      }
      localStorage.setItem(this.storageKey, JSON.stringify(dataToStore))
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  getProgress(): UserProgress {
    return { ...this.progress }
  }

  recordGameSession(challengeType: string, level: 'easy' | 'medium' | 'hard', 
                   score: number, correct: number, total: number, timeSpent: number): void {
    // Update overall stats
    this.progress.totalScore += score
    this.progress.totalQuestions += total
    this.progress.totalCorrect += correct
    this.progress.totalPlayTime += timeSpent

    // Update challenge-specific stats
    const key = `${challengeType}-${level}`
    const existing = this.progress.challengeStats.get(key) || {
      challengeType,
      level,
      timesPlayed: 0,
      bestScore: 0,
      bestAccuracy: 0,
      averageTime: 0,
      totalQuestions: 0,
      totalCorrect: 0
    }

    const accuracy = total > 0 ? (correct / total) * 100 : 0
    const avgTime = total > 0 ? timeSpent / total : 0

    existing.timesPlayed += 1
    existing.bestScore = Math.max(existing.bestScore, score)
    existing.bestAccuracy = Math.max(existing.bestAccuracy, accuracy)
    existing.totalQuestions += total
    existing.totalCorrect += correct
    existing.averageTime = (existing.averageTime * (existing.timesPlayed - 1) + avgTime) / existing.timesPlayed

    this.progress.challengeStats.set(key, existing)

    // Check for new achievements
    this.checkAchievements()
    
    // Save progress
    this.save()
  }

  updateStreak(currentStreak: number): void {
    if (currentStreak > this.progress.bestStreak) {
      this.progress.bestStreak = currentStreak
      this.checkStreakAchievements(currentStreak)
    }
  }

  private checkAchievements(): void {
    const newAchievements: Achievement[] = []

    // Milestone achievements
    if (this.progress.totalQuestions >= 100 && !this.hasAchievement('century')) {
      newAchievements.push({
        id: 'century',
        name: 'Century',
        description: 'Answered 100 questions',
        icon: '💯',
        unlockedAt: new Date(),
        category: 'milestone'
      })
    }

    if (this.progress.totalQuestions >= 1000 && !this.hasAchievement('millennium')) {
      newAchievements.push({
        id: 'millennium',
        name: 'Millennium',
        description: 'Answered 1000 questions',
        icon: '🎯',
        unlockedAt: new Date(),
        category: 'milestone'
      })
    }

    // Accuracy achievements
    const overallAccuracy = this.progress.totalQuestions > 0 ? 
      (this.progress.totalCorrect / this.progress.totalQuestions) * 100 : 0

    if (overallAccuracy >= 90 && this.progress.totalQuestions >= 50 && !this.hasAchievement('sharpshooter')) {
      newAchievements.push({
        id: 'sharpshooter',
        name: 'Sharpshooter',
        description: '90% accuracy over 50+ questions',
        icon: '🎪',
        unlockedAt: new Date(),
        category: 'accuracy'
      })
    }

    this.progress.achievements.push(...newAchievements)
  }

  private checkStreakAchievements(streak: number): void {
    const achievements = [
      { threshold: 5, id: 'fire-starter', name: 'Fire Starter', description: 'Get 5 in a row', icon: '🔥' },
      { threshold: 10, id: 'on-fire', name: 'On Fire', description: 'Get 10 in a row', icon: '🚀' },
      { threshold: 25, id: 'unstoppable', name: 'Unstoppable', description: 'Get 25 in a row', icon: '⚡' },
      { threshold: 50, id: 'legendary', name: 'Legendary', description: 'Get 50 in a row', icon: '👑' }
    ]

    achievements.forEach(ach => {
      if (streak >= ach.threshold && !this.hasAchievement(ach.id)) {
        this.progress.achievements.push({
          id: ach.id,
          name: ach.name,
          description: ach.description,
          icon: ach.icon,
          unlockedAt: new Date(),
          category: 'streak'
        })
      }
    })
  }

  private hasAchievement(id: string): boolean {
    return this.progress.achievements.some(ach => ach.id === id)
  }

  getRecentAchievements(): Achievement[] {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return this.progress.achievements.filter(ach => ach.unlockedAt > oneWeekAgo)
  }

  getChallengeStats(challengeType: string, level: 'easy' | 'medium' | 'hard'): ChallengeStats | null {
    return this.progress.challengeStats.get(`${challengeType}-${level}`) || null
  }

  private getDefaultProgress(): UserProgress {
    return {
      totalScore: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      bestStreak: 0,
      challengeStats: new Map(),
      achievements: [],
      lastPlayed: new Date(),
      totalPlayTime: 0
    }
  }

  reset(): void {
    this.progress = this.getDefaultProgress()
    localStorage.removeItem(this.storageKey)
  }
} 