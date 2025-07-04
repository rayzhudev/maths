import { GameStateManager } from '../core/GameStateManager'
import { ChallengeManager } from '../challenges/ChallengeManager'
import { ProgressTracker } from '../core/ProgressTracker'
import { AudioManager } from '../core/AudioManager'
import type { GameState, MathQuestion } from '../core/GameStateManager'

export class UIManager {
  private currentScreen: 'home' | 'game' | 'results' | 'settings' | 'achievements' = 'home'
  private currentDifficulty: 'easy' | 'medium' | 'hard' = 'easy'
  private currentQuestionId: string | null = null
  private resultsKeyListener: ((e: KeyboardEvent) => void) | null = null
  private homeKeyListener: ((e: KeyboardEvent) => void) | null = null
  private restartReady = false;
  private questionStartTime: number = 0
  private totalAnswerTime: number = 60000 // Fixed 60-second challenge duration
  private lastFeedbackContent: string = ''
  
  // Cache frequently accessed DOM elements for performance
  private cachedElements: {
    feedbackArea?: HTMLElement,
    answerInput?: HTMLInputElement,
    questionText?: HTMLElement
  } = {}

  private isMobileDevice(): boolean {
    // Check for touch capability and screen size
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const smallScreen = window.innerWidth <= 768
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    return hasTouchScreen && (smallScreen || isMobileUserAgent)
  }

  constructor(
    private gameState: GameStateManager,
    private challengeManager: ChallengeManager,
    private progressTracker: ProgressTracker,
    private audioManager: AudioManager
  ) {}

  init(): void {
    this.setupEventListeners()
    this.gameState.subscribe('stateChange', (state) => this.handleStateChange(state))
    this.gameState.subscribe('sessionTimeUp', () => this.handleSessionTimeUp())
    this.setupUI()
    this.showHomeScreen()
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e))
  }

  private setupUI(): void {
    const app = document.querySelector('#app')!
    app.innerHTML = `
      <div id="main-container" class="main-container">
        ${this.isMobileDevice() ? `
          <div class="mobile-header">
            <button class="hamburger-btn" id="hamburger-btn">
              <span></span>
              <span></span>
              <span></span>
            </button>
            <h1 class="mobile-title">Math Practice</h1>
          </div>
        ` : ''}
        
        <div id="sidebar" class="sidebar">
          ${this.isMobileDevice() ? `
            <div class="sidebar-header">
              <div class="app-title">
                <h1>Math</h1>
              </div>
              <button class="close-sidebar-btn" id="close-sidebar-btn">×</button>
            </div>
          ` : `
            <div class="app-title">
              <h1>Math</h1>
            </div>
          `}
          
          <div class="challenges-list">
            <!-- Challenges will be populated here -->
          </div>
          
          <div class="difficulty-selector-bottom">
            <button id="difficulty-btn" class="difficulty-btn current-difficulty">
              <span class="difficulty-icon">🌱</span>
              <span class="difficulty-text">Easy</span>
            </button>
          </div>
        </div>
        
        ${this.isMobileDevice() ? '<div class="sidebar-overlay" id="sidebar-overlay"></div>' : ''}
        
        <main id="main-content" class="main-content">
          <!-- Content will be dynamically loaded here -->
        </main>
        
        <div id="notification-container" class="notification-container"></div>
      </div>
    `
    
    this.populateChallengesList()
    this.setupSidebarListeners()
    
    if (this.isMobileDevice()) {
      this.setupMobileMenu()
    }
  }

  private populateChallengesList(): void {
    const challengesList = document.querySelector('.challenges-list')!
    const challenges = this.challengeManager.getChallenges()
    
    challengesList.innerHTML = challenges.map(challenge => `
      <button class="challenge-item" data-challenge="${challenge.id}">
        <span class="challenge-icon">${challenge.icon}</span>
        <div class="challenge-info">
          <span class="challenge-name">${challenge.name}</span>
          <span class="challenge-desc">${challenge.description}</span>
        </div>
      </button>
    `).join('')
  }

  private setupSidebarListeners(): void {
    // Challenge selection
    document.querySelectorAll('.challenge-item').forEach(button => {
      button.addEventListener('click', (e) => {
        const challengeId = (e.currentTarget as HTMLElement).dataset.challenge!
        this.startChallenge(challengeId, this.currentDifficulty)
      })
    })
    
    // Difficulty selector
    document.getElementById('difficulty-btn')?.addEventListener('click', () => {
      this.showDifficultyMenu()
    })
  }

  private setupMobileMenu(): void {
    const hamburgerBtn = document.getElementById('hamburger-btn')
    const closeSidebarBtn = document.getElementById('close-sidebar-btn')
    const sidebarOverlay = document.getElementById('sidebar-overlay')
    const sidebar = document.getElementById('sidebar')

    const openSidebar = () => {
      sidebar?.classList.add('sidebar-open')
      sidebarOverlay?.classList.add('overlay-visible')
    }

    const closeSidebar = () => {
      sidebar?.classList.remove('sidebar-open')
      sidebarOverlay?.classList.remove('overlay-visible')
    }

    hamburgerBtn?.addEventListener('click', openSidebar)
    closeSidebarBtn?.addEventListener('click', closeSidebar)
    sidebarOverlay?.addEventListener('click', closeSidebar)

    // Close sidebar when challenge is selected on mobile
    document.querySelectorAll('.challenge-item').forEach(button => {
      button.addEventListener('click', () => {
        // Small delay to allow navigation to complete
        setTimeout(closeSidebar, 100)
      })
    })
  }

  private showDifficultyMenu(): void {
    const button = document.getElementById('difficulty-btn')!
    const rect = button.getBoundingClientRect()
    
    // Remove existing menu if it exists
    document.querySelector('.difficulty-menu')?.remove()
    
    const menu = document.createElement('div')
    menu.className = 'difficulty-menu'
    menu.innerHTML = `
      <button class="difficulty-option" data-level="easy">
        <div class="difficulty-icon">🌱</div>
        <span class="difficulty-name">Easy</span>
      </button>
      <button class="difficulty-option" data-level="medium">
        <div class="difficulty-icon">🔥</div>
        <span class="difficulty-name">Medium</span>
      </button>
      <button class="difficulty-option" data-level="hard">
        <div class="difficulty-icon">⚡</div>
        <span class="difficulty-name">Hard</span>
      </button>
    `
    
    menu.style.position = 'absolute'
    menu.style.bottom = `${window.innerHeight - rect.top + 10}px`
    menu.style.left = `${rect.left}px`
    
    document.body.appendChild(menu)
    
    // Add click listeners to options
    menu.querySelectorAll('.difficulty-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const level = (e.currentTarget as HTMLElement).dataset.level as 'easy' | 'medium' | 'hard'
        this.setDifficulty(level)
        menu.remove()
      })
    })
    
    // Close menu when clicking outside
    setTimeout(() => {
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target as Node) && e.target !== button) {
          menu.remove()
        }
      }, { once: true })
    }, 0)
  }

  private setDifficulty(level: 'easy' | 'medium' | 'hard'): void {
    // Check if there's an active game or challenge
    const state = this.gameState.getState()
    const wasInGame = state.isActive || this.currentScreen === 'game'
    
    // End any current challenge
    if (state.isActive) {
      this.challengeManager.endCurrentChallenge()
    }
    
    // Update the difficulty level
    this.currentDifficulty = level
    
    // Update the difficulty button display
    const button = document.getElementById('difficulty-btn')!
    const icon = level === 'easy' ? '🌱' : level === 'medium' ? '🔥' : '⚡'
    const text = level.charAt(0).toUpperCase() + level.slice(1)
    
    button.innerHTML = `
      <span class="difficulty-icon">${icon}</span>
      <span class="difficulty-text">${text}</span>
    `
    
    // Always refresh the home screen to show new difficulty
    this.showHomeScreen()
  }

  private cleanupResultsListeners(): void {
    if (this.resultsKeyListener) {
      document.removeEventListener('keydown', this.resultsKeyListener)
      this.resultsKeyListener = null
    }
  }

  showHomeScreen(): void {
    this.cleanupResultsListeners()
    this.cleanupHomeListeners()
    this.currentScreen = 'home'
    
    // Clear cached elements when leaving game screen
    this.cachedElements = {}
    
    // Default to arithmetic challenge for instant play
    this.showArithmeticReady()
  }

  private cleanupHomeListeners(): void {
    if (this.homeKeyListener) {
      document.removeEventListener('keydown', this.homeKeyListener)
      this.homeKeyListener = null
    }
  }

  private showArithmeticReady(): void {
    const mainContent = document.getElementById('main-content')!
    
    const progress = this.progressTracker.getProgress()
    
    mainContent.innerHTML = `
      <div class="ready-screen" style="display: flex; flex-direction: column; height: 100%; min-height: 400px;">
        <div class="ready-header" style="text-align: center; margin-top: 2rem;">
          <h1>Arithmetic</h1>
          <div class="difficulty-display">
            <span class="difficulty-badge difficulty-${this.currentDifficulty}">${this.currentDifficulty}</span>
          </div>
        </div>
                 <div class="ready-content touch-start-area" style="flex: 1; display: flex; align-items: center; justify-content: center; margin-top: -26vh; cursor: pointer;">
           <div class="start-prompt" style="width: 100%;">
                            <div class="start-action" style="display: flex; align-items: center; justify-content: center;">
                 <div class="start-text" style="font-size: 1.5rem; text-align: center;">
                   ${this.isMobileDevice() ? 
                     'Tap anywhere to start!' : 
                     'Press <kbd>Space</kbd> or <kbd>Enter</kbd> to start!'
                   }
                 </div>
               </div>
           </div>
         </div>
      </div>
    `
    
    this.setupReadyScreenListeners()
  }

  private setupReadyScreenListeners(): void {
    const startGame = () => {
      this.startChallenge('arithmetic', this.currentDifficulty)
    }
    
    // Touch/click to start anywhere on ready screen
    const touchStartArea = document.querySelector('.touch-start-area')
    if (touchStartArea) {
      touchStartArea.addEventListener('click', startGame)
      touchStartArea.addEventListener('touchend', (e) => {
        e.preventDefault()
        startGame()
      })
    }

    // Button click
    document.getElementById('start-btn')?.addEventListener('click', startGame)
    
    // Other buttons
    document.getElementById('achievements-btn')?.addEventListener('click', () => {
      this.showAchievements()
    })
    
    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.showSettings()
    })
    
    // Keyboard listener for instant start
    const handleHomeKeydown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        startGame()
      }
    }
    
    document.addEventListener('keydown', handleHomeKeydown)
    
    // Store reference to remove later
    this.homeKeyListener = handleHomeKeydown
  }

  private startChallenge(challengeId: string, level: 'easy' | 'medium' | 'hard'): void {
    this.cleanupResultsListeners()
    this.cleanupHomeListeners()
    this.currentQuestionId = null // Reset to ensure first question gets displayed
    this.lastFeedbackContent = '' // Clear previous feedback for fresh start
    this.challengeManager.startChallenge(challengeId, level)
    
    // Always show game screen for new challenges (this will clear feedback for fresh starts)
    this.showGameScreen()
  }

  showGameScreen(): void {
    this.currentScreen = 'game'
    const mainContent = document.getElementById('main-content')!
    
    mainContent.innerHTML = `
      <div class="game-screen">
        <div class="game-header">
          <div class="game-info">
            <span id="challenge-name" class="challenge-name"></span>
            <span id="difficulty-badge" class="difficulty-badge"></span>
          </div>
          <div class="session-timer">
            <span class="timer-label">Time:</span>
            <span id="session-timer" class="session-timer-value">60s</span>
          </div>
        </div>
        
        <div class="game-stats">
          <div class="stat-item">
            <span class="stat-label">Correct:</span>
            <span id="correct-count" class="stat-value correct">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Incorrect:</span>
            <span id="incorrect-count" class="stat-value incorrect">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Streak:</span>
            <span id="current-streak" class="stat-value">0</span>
          </div>
        </div>
        
        <div class="question-area">
          <div id="feedback" class="feedback">${this.lastFeedbackContent}</div>
          <div id="question-text" class="question-text"></div>
          <div class="answer-section">
            <input type="text" id="answer-input" class="answer-input" placeholder="">
            <button id="submit-btn" class="submit-btn">Submit</button>
          </div>
        </div>
        
        <div class="progress-info">
          <div class="questions-answered">
            Question <span id="current-question-num">1</span>
          </div>
        </div>
      </div>
    `
    
    this.setupGameListeners()
    
    // Cache DOM elements for performance
    this.cachedElements.feedbackArea = document.getElementById('feedback')!
    this.cachedElements.answerInput = document.getElementById('answer-input') as HTMLInputElement
    this.cachedElements.questionText = document.getElementById('question-text')!
    
    this.updateGameUI()
  }

  private setupGameListeners(): void {
    document.getElementById('submit-btn')?.addEventListener('click', () => {
      this.submitCurrentAnswer()
    })
    
    // Note: All keyboard input is now handled globally via handleGlobalKeydown
    // This includes Enter/Space for submission and number keys for automatic input
  }

  private submitCurrentAnswer(): void {
    if (this.cachedElements.answerInput) {
      const answer = this.cachedElements.answerInput.value.trim()
      
      if (answer) {
        this.submitAnswer(answer)
      }
    }
  }

  private updateGameUI(): void {
    const state = this.gameState.getState()
    
    document.getElementById('current-streak')!.textContent = state.streak.toString()
    document.getElementById('correct-count')!.textContent = state.correctAnswers.toString()
    document.getElementById('incorrect-count')!.textContent = state.incorrectAnswers.toString()
    
    // Update session timer
    const sessionTimer = document.getElementById('session-timer')!
    sessionTimer.textContent = `${state.sessionTimeLeft}s`
    
    // Add warning class when time is low
    if (state.sessionTimeLeft <= 5) {
      sessionTimer.classList.add('warning')
    } else {
      sessionTimer.classList.remove('warning')
    }
    
    const challengeName = this.challengeManager.getChallenges()
      .find(c => c.id === state.currentChallenge)?.name || ''
    document.getElementById('challenge-name')!.textContent = challengeName
    
    const difficultyBadge = document.getElementById('difficulty-badge')!
    difficultyBadge.textContent = state.currentLevel
    difficultyBadge.className = `difficulty-badge difficulty-${state.currentLevel}`
    
    // Update current question number
    document.getElementById('current-question-num')!.textContent = (state.totalQuestions + 1).toString()
    
    // Only display question if it's a new question (not just a UI update)
    if (state.currentQuestion && state.currentQuestion.id !== this.currentQuestionId) {
      this.displayQuestion(state.currentQuestion)
      this.currentQuestionId = state.currentQuestion.id
    }
  }

  private displayQuestion(question: MathQuestion): void {
    // Use cached elements for better performance
    if (this.cachedElements.questionText) {
      this.cachedElements.questionText.innerHTML = `
        <div class="question-display">
          <h3>${question.question}</h3>
        </div>
      `
    }
    
    if (this.cachedElements.answerInput) {
      this.cachedElements.answerInput.value = ''
    }
    
    this.questionStartTime = Date.now()
  }

  private submitAnswer(answer: string): boolean {
    const state = this.gameState.getState()
    const currentQuestion = state.currentQuestion
    const isCorrect = this.challengeManager.submitAnswer(answer)
    
    // Show brief feedback with correct answer
    this.showBriefFeedback(currentQuestion?.question, isCorrect, currentQuestion?.answer, answer)
    
    // Play audio feedback
    if (isCorrect) {
      this.audioManager.playCorrect()
      const newState = this.gameState.getState()
      if (newState.streak > 0 && newState.streak % 5 === 0) {
        this.audioManager.playStreak()
      }
    } else {
      this.audioManager.playIncorrect()
    }

    // Generate next question immediately for maximum speed
    const updatedState = this.gameState.getState()
    if (updatedState.isActive && updatedState.sessionTimeLeft > 0) {
      setTimeout(() => {
        this.challengeManager.generateNextQuestion()
        this.updateGameUI()
      }, 50) // Minimal delay for feedback visibility
    }

    return isCorrect
  }

  private showBriefFeedback(question: string | undefined, isCorrect: boolean, correctAnswer?: number, answer?: string): void {
    // Clean up question by removing "= ?" from the end
    const cleanQuestion = question?.replace(/\s*=\s*\??\s*$/, '') || 'Unknown question'
    
    const feedbackHTML = isCorrect ? `
        <div class="brief-feedback correct">
          <span class="feedback-icon">✅</span>
          <span class="feedback-text">${correctAnswer}</span>
        </div>
      ` : `
        <div class="brief-feedback incorrect">
          <span class="feedback-icon">❌</span>
          <span class="feedback-text">${answer || 'No answer'}</span>
          <span class="feedback-icon">☑️</span>
          <span class="feedback-text">${cleanQuestion} = ${correctAnswer}</span>
        </div>
      `
    
    this.lastFeedbackContent = feedbackHTML
    
    // Use cached element for better performance
    if (this.cachedElements.feedbackArea) {
      this.cachedElements.feedbackArea.innerHTML = feedbackHTML
    }
  }

  private handleSessionTimeUp(): void {
    this.showResults()
  }

  showResults(): void {
    this.currentScreen = 'results'
    const mainContent = document.getElementById('main-content')!
    const state = this.gameState.getState()

    const currentChallenge = state.currentChallenge
    const currentLevel = state.currentLevel

    const accuracy = state.totalQuestions > 0 ? Math.round((state.correctAnswers / state.totalQuestions) * 100) : 0
    const avgTimePerQuestion = state.totalQuestions > 0 ? (this.totalAnswerTime / state.totalQuestions / 1000).toFixed(3) : '0.000'
    const challengeName = this.challengeManager.getChallenges()
      .find(c => c.id === state.currentChallenge)?.name || 'Challenge'
    
    mainContent.innerHTML = `
      <div class="results-screen">
        <div class="results-header">
          <h2>🎯 Challenge Complete!</h2>
          <h3>${challengeName} - ${state.currentLevel}</h3>
        </div>
        
        <div class="results-stats">
          <div class="result-card">
            <div class="result-value">${state.correctAnswers}</div>
            <div class="result-label">Correct Answers</div>
          </div>
          <div class="result-card">
            <div class="result-value">${state.incorrectAnswers}</div>
            <div class="result-label">Incorrect Answers</div>
          </div>
          <div class="result-card">
            <div class="result-value">${accuracy}%</div>
            <div class="result-label">Accuracy</div>
          </div>
          <div class="result-card">
            <div class="result-value">${state.streak}</div>
            <div class="result-label">Best Streak</div>
          </div>
          <div class="result-card">
            <div class="result-value">${avgTimePerQuestion}s</div>
            <div class="result-label">Avg Question Time</div>
          </div>
        </div>
        
        <div class="results-actions">
          <button id="play-again-btn" class="primary-btn">Play Again</button>
        </div>
        
        <div class="keyboard-hint">
          Press <kbd>Space</kbd> or <kbd>Enter</kbd> to play again
        </div>
      </div>
    `
    
    const playAgain = () => {
      if (currentChallenge && currentLevel) {
        this.startChallenge(currentChallenge, currentLevel)
      } else {
        this.startChallenge(currentChallenge || 'arithmetic', this.currentDifficulty)
      }
    }
    
    document.getElementById('play-again-btn')?.addEventListener('click', playAgain)
    
    this.resultsKeyListener = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'Enter') && this.restartReady) {
        e.preventDefault()
        playAgain()
      }
    }
    
    document.addEventListener('keydown', this.resultsKeyListener)

    this.restartReady = false
    setTimeout(() => { this.restartReady = true }, 1000)
  }

  showSettings(): void {
    this.cleanupResultsListeners()
    const mainContent = document.getElementById('main-content')!
    
    mainContent.innerHTML = `
      <div class="settings-screen">
        <div class="section-header">
          <h2>Settings</h2>
        </div>
        
        <div class="settings-content">
          <div class="setting-group">
            <h3>Audio</h3>
            <div class="setting-item">
              <label class="setting-label">
                <input type="checkbox" id="sound-toggle" ${this.audioManager.isEnabled() ? 'checked' : ''}>
                Sound Effects
              </label>
            </div>
            <div class="setting-item">
              <label class="setting-label">Volume</label>
              <input type="range" id="volume-slider" min="0" max="100" value="${this.audioManager.getVolume() * 100}">
            </div>
          </div>
          
          <div class="setting-group">
            <h3>Data</h3>
            <div class="setting-item">
              <button id="reset-progress-btn" class="danger-btn">Reset All Progress</button>
              <p class="setting-description">This will delete all your progress and achievements.</p>
            </div>
          </div>
        </div>
      </div>
    `
    
    this.setupSettingsListeners()
  }

  private setupSettingsListeners(): void {
    document.getElementById('sound-toggle')?.addEventListener('change', (e) => {
      const enabled = (e.target as HTMLInputElement).checked
      this.audioManager.setEnabled(enabled)
    })
    
    document.getElementById('volume-slider')?.addEventListener('input', (e) => {
      const volume = parseInt((e.target as HTMLInputElement).value) / 100
      this.audioManager.setVolume(volume)
    })
    
    document.getElementById('reset-progress-btn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        this.progressTracker.reset()
        this.showNotification('Progress reset successfully!')
        this.showHomeScreen()
      }
    })
  }

  showAchievements(): void {
    this.cleanupResultsListeners()
    const mainContent = document.getElementById('main-content')!
    const progress = this.progressTracker.getProgress()
    
    mainContent.innerHTML = `
      <div class="achievements-screen">
        <div class="section-header">
          <h2>Achievements</h2>
        </div>
        
        <div class="achievements-grid">
          ${progress.achievements.map(achievement => `
            <div class="achievement-card unlocked">
              <div class="achievement-icon">${achievement.icon}</div>
              <div class="achievement-info">
                <h3 class="achievement-name">${achievement.name}</h3>
                <p class="achievement-description">${achievement.description}</p>
                <div class="achievement-date">Unlocked: ${achievement.unlockedAt.toLocaleDateString()}</div>
              </div>
            </div>
          `).join('')}
          
          ${this.getLockedAchievements().map(achievement => `
            <div class="achievement-card locked">
              <div class="achievement-icon">🔒</div>
              <div class="achievement-info">
                <h3 class="achievement-name">${achievement.name}</h3>
                <p class="achievement-description">${achievement.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  private getLockedAchievements(): { name: string, description: string }[] {
    const unlockedIds = this.progressTracker.getProgress().achievements.map(a => a.id)
    const allAchievements = [
      { id: 'century', name: 'Century', description: 'Answer 100 questions' },
      { id: 'millennium', name: 'Millennium', description: 'Answer 1000 questions' },
      { id: 'sharpshooter', name: 'Sharpshooter', description: '90% accuracy over 50+ questions' },
      { id: 'fire-starter', name: 'Fire Starter', description: 'Get 5 in a row' },
      { id: 'on-fire', name: 'On Fire', description: 'Get 10 in a row' },
      { id: 'unstoppable', name: 'Unstoppable', description: 'Get 25 in a row' },
      { id: 'legendary', name: 'Legendary', description: 'Get 50 in a row' }
    ]
    
    return allAchievements.filter(a => !unlockedIds.includes(a.id))
  }

  private renderRecentAchievements(): string {
    const recent = this.progressTracker.getRecentAchievements()
    if (recent.length === 0) return ''
    
    return `
      <div class="recent-achievements-section">
        <h3>Recent Achievements</h3>
        <div class="recent-achievements-list">
          ${recent.map(achievement => `
            <div class="recent-achievement">
              <span class="achievement-icon">${achievement.icon}</span>
              <span class="achievement-name">${achievement.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  private handleStateChange(state: GameState): void {
    if (this.currentScreen === 'game') {
      this.updateGameUI()
    }
  }

  private handleGlobalKeydown(e: KeyboardEvent): void {
    // Handle Escape key globally
    if (e.key === 'Escape') {
      this.handleEscape()
      return
    }
    
    // Auto-focus and input for game screen
    if (this.currentScreen === 'game') {
      this.handleGameKeydown(e)
    }
  }

  private handleGameKeydown(e: KeyboardEvent): void {
    const state = this.gameState.getState()
    if (!state.isActive || state.isPaused) {
      return
    }

    // Use cached element for better performance
    const answerInput = this.cachedElements.answerInput
    if (!answerInput) {
      return
    }

    // Check if the key is a number, decimal point, or minus sign
    const isNumberKey = /^[0-9]$/.test(e.key)
    const isDecimalPoint = e.key === '.' || e.key === ','
    const isMinusSign = e.key === '-'
    const isBackspace = e.key === 'Backspace'
    const isEnterOrSpace = e.key === 'Enter' || e.key === ' '

    // Handle submission keys
    if (isEnterOrSpace) {
      e.preventDefault()
      this.submitCurrentAnswer()
      return
    }

    // Handle number input keys
    if (isNumberKey || isDecimalPoint || isMinusSign || isBackspace) {
      // Focus the input if it's not already focused
      if (document.activeElement !== answerInput) {
        answerInput.focus()
      }

      // For backspace, let it work naturally if input is focused
      if (isBackspace) {
        return // Let the default backspace behavior work
      }

      // For number keys, decimal point, and minus sign
      if (isNumberKey || isDecimalPoint || isMinusSign) {
        e.preventDefault()
        
        // Handle decimal point conversion (some keyboards use comma)
        const keyToAdd = e.key === ',' ? '.' : e.key
        
        // Add the character to the input
        const currentValue = answerInput.value
        const selectionStart = answerInput.selectionStart || 0
        const selectionEnd = answerInput.selectionEnd || 0
        
        // Insert the character at the cursor position
        const newValue = currentValue.substring(0, selectionStart) + 
                        keyToAdd + 
                        currentValue.substring(selectionEnd)
        
        answerInput.value = newValue
        
        // Set cursor position after the inserted character
        answerInput.setSelectionRange(selectionStart + 1, selectionStart + 1)
      }
    }
  }

  handleEscape(): void {
    if (this.currentScreen === 'game') {
      this.showHomeScreen()
    } else if (this.currentScreen !== 'home') {
      this.showHomeScreen()
    }
  }

  handleResize(): void {
    // Handle responsive updates if needed
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const container = document.getElementById('notification-container')!
    
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.textContent = message
    
    container.appendChild(notification)
    
    setTimeout(() => {
      notification.classList.add('show')
    }, 100)
    
    setTimeout(() => {
      notification.classList.remove('show')
      setTimeout(() => {
        container.removeChild(notification)
      }, 300)
    }, 3000)
  }
} 