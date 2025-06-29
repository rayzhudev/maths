import { GameStateManager } from './core/GameStateManager'
import { UIManager } from './ui/UIManager'
import { ChallengeManager } from './challenges/ChallengeManager'
import { ProgressTracker } from './core/ProgressTracker'
import { AudioManager } from './core/AudioManager'

export class MathPracticeApp {
  private gameState: GameStateManager
  private ui: UIManager
  private challengeManager: ChallengeManager
  private progressTracker: ProgressTracker
  private audioManager: AudioManager

  constructor() {
    this.gameState = new GameStateManager()
    this.progressTracker = new ProgressTracker()
    this.audioManager = new AudioManager()
    this.challengeManager = new ChallengeManager(this.gameState, this.progressTracker)
    this.ui = new UIManager(this.gameState, this.challengeManager, this.progressTracker, this.audioManager)
  }

  async init(): Promise<void> {
    try {
      // Initialize core systems
      await this.audioManager.init()
      await this.progressTracker.load()
      
      // Initialize UI
      this.ui.init()
      
      // Set up event listeners  
      this.setupEventListeners()
      
      console.log('Math Practice App initialized successfully!')
    } catch (error) {
      console.error('Failed to initialize app:', error)
    }
  }

  private setupEventListeners(): void {
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.ui.handleEscape()
      }
    })

    // Handle visibility change for pause/resume
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.gameState.pause()
      } else {
        this.gameState.resume()
      }
    })

    // Handle window resize for responsive updates
    window.addEventListener('resize', () => {
      this.ui.handleResize()
    })
  }
} 