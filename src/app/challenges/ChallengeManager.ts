import { GameStateManager } from '../core/GameStateManager'
import { ProgressTracker } from '../core/ProgressTracker'
import type { MathQuestion } from '../core/GameStateManager'
import { ArithmeticChallenge } from './ArithmeticChallenge'
import { MentalMathChallenge } from './MentalMathChallenge'
import { FractionsChallenge } from './FractionsChallenge'
import { PercentageChallenge } from './PercentageChallenge'
import { AlgebraChallenge } from './AlgebraChallenge'
import { GeometryChallenge } from './GeometryChallenge'

export interface ChallengeType {
  id: string
  name: string
  description: string
  icon: string
  color: string
  generator: MathChallengeGenerator
}

export interface MathChallengeGenerator {
  generateQuestion(level: 'easy' | 'medium' | 'hard'): MathQuestion
  getTimeLimit(level: 'easy' | 'medium' | 'hard'): number
  validateAnswer(question: MathQuestion, userAnswer: string): boolean
}

export class ChallengeManager {
  private challenges: Map<string, ChallengeType> = new Map()
  private currentGenerator: MathChallengeGenerator | null = null

  constructor(
    private gameState: GameStateManager,
    private progressTracker: ProgressTracker
  ) {
    this.initializeChallenges()
  }

  private initializeChallenges(): void {
    const challengeTypes: ChallengeType[] = [
      {
        id: 'arithmetic',
        name: 'Basic Arithmetic',
        description: 'Addition, subtraction, multiplication, and division',
        icon: '➕',
        color: '#4F46E5',
        generator: new ArithmeticChallenge()
      },
      {
        id: 'mental-math',
        name: 'Mental Math',
        description: 'Quick calculations and number patterns',
        icon: '🧠',
        color: '#059669',
        generator: new MentalMathChallenge()
      },
      {
        id: 'fractions',
        name: 'Fractions',
        description: 'Working with fractions and decimals',
        icon: '🔢',
        color: '#DC2626',
        generator: new FractionsChallenge()
      },
      {
        id: 'percentages',
        name: 'Percentages',
        description: 'Percentage calculations and conversions',
        icon: '%',
        color: '#7C2D12',
        generator: new PercentageChallenge()
      },
      {
        id: 'algebra',
        name: 'Basic Algebra',
        description: 'Simple algebraic expressions and equations',
        icon: '🔤',
        color: '#7C3AED',
        generator: new AlgebraChallenge()
      },
      {
        id: 'geometry',
        name: 'Geometry',
        description: 'Area, perimeter, and basic shape calculations',
        icon: '📐',
        color: '#EA580C',
        generator: new GeometryChallenge()
      }
    ]

    challengeTypes.forEach(challenge => {
      this.challenges.set(challenge.id, challenge)
    })
  }

  getChallenges(): ChallengeType[] {
    return Array.from(this.challenges.values())
  }

  getChallenge(id: string): ChallengeType | null {
    return this.challenges.get(id) || null
  }

  startChallenge(challengeId: string, level: 'easy' | 'medium' | 'hard'): boolean {
    const challenge = this.challenges.get(challengeId)
    if (!challenge) {
      return false
    }

    this.currentGenerator = challenge.generator
    this.gameState.startChallenge(challengeId, level)
    
    // Generate first question
    this.generateNextQuestion()
    
    return true
  }

  generateNextQuestion(): MathQuestion | null {
    if (!this.currentGenerator) {
      return null
    }

    const state = this.gameState.getState()
    if (!state.currentChallenge || !state.isActive) {
      return null
    }

    try {
      const question = this.currentGenerator.generateQuestion(state.currentLevel)
      const timeLimit = this.currentGenerator.getTimeLimit(state.currentLevel)
      
      question.timeLimit = timeLimit
      
      this.gameState.setCurrentQuestion(question)
      
      return question
    } catch (error) {
      console.error('Failed to generate question:', error)
      return null
    }
  }

  submitAnswer(userAnswer: string): boolean {
    const state = this.gameState.getState()
    if (!state.currentQuestion || !this.currentGenerator || !state.isActive || state.isPaused) {
      return false
    }

    try {
      const isCorrect = this.currentGenerator.validateAnswer(state.currentQuestion, userAnswer)
      
      // Record the answer
      this.gameState.recordAnswer(isCorrect)
      this.progressTracker.updateStreak(isCorrect ? state.streak + 1 : 0)
      
      return isCorrect
    } catch (error) {
      console.error('Failed to validate answer:', error)
      return false
    }
  }

  endCurrentChallenge(): void {
    const state = this.gameState.getState()
    
    if (state.currentChallenge && state.isActive) {
      // Record session stats
      this.progressTracker.recordGameSession(
        state.currentChallenge,
        state.currentLevel,
        state.score,
        state.correctAnswers,
        state.totalQuestions,
        0 // TODO: Track actual time spent
      )
    }

    this.gameState.endChallenge()
    this.currentGenerator = null
  }

  getDifficultyDescription(level: 'easy' | 'medium' | 'hard'): string {
    switch (level) {
      case 'easy':
        return 'Perfect for beginners and warming up'
      case 'medium':
        return 'Moderate difficulty with more complex problems'
      case 'hard':
        return 'Challenging problems for advanced practice'
      default:
        return ''
    }
  }

  getRecommendedLevel(challengeId: string): 'easy' | 'medium' | 'hard' {
    const stats = this.progressTracker.getChallengeStats(challengeId, 'easy')
    
    if (!stats || stats.timesPlayed < 5) {
      return 'easy'
    }
    
    if (stats.bestAccuracy >= 80 && stats.timesPlayed >= 10) {
      const mediumStats = this.progressTracker.getChallengeStats(challengeId, 'medium')
      if (mediumStats && mediumStats.bestAccuracy >= 75) {
        return 'hard'
      }
      return 'medium'
    }
    
    return 'easy'
  }
} 