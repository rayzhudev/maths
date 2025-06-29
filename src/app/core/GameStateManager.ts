export interface GameState {
  currentChallenge: string | null
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
  streak: number
  sessionTimeLeft: number
  isPaused: boolean
  isActive: boolean
  correctAnswers: number
  incorrectAnswers: number
  totalQuestions: number
  currentQuestion: MathQuestion | null
  sessionDuration: number
}

export interface MathQuestion {
  id: string
  question: string
  answer: number
  options?: number[]
  type: 'multiple-choice' | 'input'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  timeLimit?: number
}

export class GameStateManager {
  private state: GameState
  private listeners: Map<string, ((state: GameState) => void)[]> = new Map()
  private sessionTimer: number | null = null

  constructor() {
    this.state = {
      currentChallenge: null,
      currentLevel: 'beginner',
      score: 0,
      streak: 0,
      sessionTimeLeft: 0,
      isPaused: false,
      isActive: false,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalQuestions: 0,
      currentQuestion: null,
      sessionDuration: 60
    }
  }

  getState(): GameState {
    return { ...this.state }
  }

  setState(updates: Partial<GameState>): void {
    const prevState = { ...this.state }
    this.state = { ...this.state, ...updates }
    this.notifyListeners('stateChange', this.state)
    
    // Notify specific property changes
    Object.keys(updates).forEach(key => {
      if (prevState[key as keyof GameState] !== this.state[key as keyof GameState]) {
        this.notifyListeners(key, this.state)
      }
    })
  }

  startChallenge(challengeType: string, level: 'beginner' | 'intermediate' | 'advanced'): void {
    this.setState({
      currentChallenge: challengeType,
      currentLevel: level,
      score: 0,
      streak: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalQuestions: 0,
      isActive: true,
      isPaused: false,
      sessionTimeLeft: this.state.sessionDuration
    })
    
    this.startSessionTimer()
  }

  private startSessionTimer(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer)
    }

    this.sessionTimer = window.setInterval(() => {
      if (this.state.isPaused || !this.state.isActive) {
        return
      }

      const newTimeLeft = this.state.sessionTimeLeft - 1
      
      if (newTimeLeft <= 0) {
        this.endChallenge()
        this.notifyListeners('sessionTimeUp', this.state)
      } else {
        this.setState({ sessionTimeLeft: newTimeLeft })
      }
    }, 1000)
  }

  pause(): void {
    if (this.state.isActive) {
      this.setState({ isPaused: true })
    }
  }

  resume(): void {
    if (this.state.isActive) {
      this.setState({ isPaused: false })
    }
  }

  endChallenge(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer)
      this.sessionTimer = null
    }

    this.setState({
      currentChallenge: null,
      isActive: false,
      isPaused: false,
      currentQuestion: null,
      sessionTimeLeft: 0
    })
  }

  updateScore(points: number): void {
    this.setState({ score: this.state.score + points })
  }

  updateStreak(correct: boolean): void {
    if (correct) {
      this.setState({ streak: this.state.streak + 1 })
    } else {
      this.setState({ streak: 0 })
    }
  }

  setCurrentQuestion(question: MathQuestion | null): void {
    this.setState({ currentQuestion: question })
  }

  recordAnswer(correct: boolean): void {
    this.setState({
      totalQuestions: this.state.totalQuestions + 1,
      correctAnswers: correct ? this.state.correctAnswers + 1 : this.state.correctAnswers,
      incorrectAnswers: correct ? this.state.incorrectAnswers : this.state.incorrectAnswers + 1
    })
    
    this.updateStreak(correct)
    
    if (correct) {
      const basePoints = this.state.currentLevel === 'advanced' ? 15 : 
                        this.state.currentLevel === 'intermediate' ? 10 : 5
      const streakBonus = Math.min(this.state.streak, 10) * 2
      this.updateScore(basePoints + streakBonus)
    }
  }

  subscribe(event: string, callback: (state: GameState) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
    
    return () => {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  private notifyListeners(event: string, state: GameState): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(state))
    }
  }
} 