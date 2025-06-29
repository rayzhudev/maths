import type { MathQuestion } from '../core/GameStateManager'
import type { MathChallengeGenerator } from './ChallengeManager'

export class MentalMathChallenge implements MathChallengeGenerator {
  generateQuestion(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const questionTypes = ['sequence', 'quick-calc', 'pattern', 'estimation']
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)]
    
    switch (type) {
      case 'sequence':
        return this.generateSequenceQuestion(level)
      case 'quick-calc':
        return this.generateQuickCalcQuestion(level)
      case 'pattern':
        return this.generatePatternQuestion(level)
      case 'estimation':
        return this.generateEstimationQuestion(level)
      default:
        return this.generateQuickCalcQuestion(level)
    }
  }
  
  private generateSequenceQuestion(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const sequences = [
      { pattern: 'add', step: 2, start: 2 },
      { pattern: 'add', step: 3, start: 3 },
      { pattern: 'add', step: 5, start: 5 },
      { pattern: 'multiply', step: 2, start: 2 },
      { pattern: 'square', step: 1, start: 1 }
    ]
    
    const seq = sequences[Math.floor(Math.random() * sequences.length)]
    const length = level === 'beginner' ? 4 : level === 'intermediate' ? 5 : 6
    
    const series = []
    let current = seq.start
    
    for (let i = 0; i < length; i++) {
      series.push(current)
      switch (seq.pattern) {
        case 'add':
          current += seq.step
          break
        case 'multiply':
          current *= seq.step
          break
        case 'square':
          current = (i + 2) * (i + 2)
          break
      }
    }
    
    const answer = series[series.length - 1]
    const questionSeries = series.slice(0, -1)
    
    return {
      id: `mental-math-sequence-${Date.now()}`,
      question: `What comes next? ${questionSeries.join(', ')}, ?`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'mental-math'
    }
  }
  
  private generateQuickCalcQuestion(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const operations = [
      () => this.generateDoubleHalf(level),
      () => this.generateNearTen(level),
      () => this.generateSquarePattern(level)
    ]
    
    const operation = operations[Math.floor(Math.random() * operations.length)]
    return operation()
  }
  
  private generateDoubleHalf(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const isDouble = Math.random() < 0.5
    const baseRange = level === 'beginner' ? 50 : level === 'intermediate' ? 100 : 200
    const num = Math.floor(Math.random() * baseRange) + 1
    
    const question = isDouble ? `Double ${num}` : `Half of ${num * 2}`
    const answer = isDouble ? num * 2 : num
    
    return {
      id: `mental-math-double-half-${Date.now()}`,
      question: `${question} = ?`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'mental-math'
    }
  }
  
  private generateNearTen(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const base = level === 'beginner' ? 10 : level === 'intermediate' ? 100 : 1000
    const near = Math.floor(Math.random() * 9) + 1
    const isAdd = Math.random() < 0.5
    
    const num1 = isAdd ? base - near : base + near
    const num2 = Math.floor(Math.random() * 20) + 1
    
    const question = `${num1} + ${num2}`
    const answer = num1 + num2
    
    return {
      id: `mental-math-near-ten-${Date.now()}`,
      question: `${question} = ?`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'mental-math'
    }
  }
  
  private generateSquarePattern(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const maxBase = level === 'beginner' ? 12 : level === 'intermediate' ? 20 : 25
    const base = Math.floor(Math.random() * maxBase) + 1
    const answer = base * base
    
    return {
      id: `mental-math-square-${Date.now()}`,
      question: `${base}² = ?`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'mental-math'
    }
  }
  
  private generatePatternQuestion(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const patterns = [
      { name: 'fibonacci', values: [1, 1, 2, 3, 5, 8, 13, 21] },
      { name: 'prime', values: [2, 3, 5, 7, 11, 13, 17, 19] },
      { name: 'triangle', values: [1, 3, 6, 10, 15, 21, 28, 36] }
    ]
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)]
    const length = level === 'beginner' ? 4 : level === 'intermediate' ? 5 : 6
    const series = pattern.values.slice(0, length)
    const answer = pattern.values[length]
    
    return {
      id: `mental-math-pattern-${Date.now()}`,
      question: `Continue the pattern: ${series.join(', ')}, ?`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'mental-math'
    }
  }
  
  private generateEstimationQuestion(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const num1 = level === 'beginner' ? Math.floor(Math.random() * 100) + 10 :
                level === 'intermediate' ? Math.floor(Math.random() * 500) + 50 :
                Math.floor(Math.random() * 1000) + 100
    
    const num2 = level === 'beginner' ? Math.floor(Math.random() * 100) + 10 :
                level === 'intermediate' ? Math.floor(Math.random() * 500) + 50 :
                Math.floor(Math.random() * 1000) + 100
    
    const exactAnswer = num1 + num2
    const roundedAnswer = Math.round(exactAnswer / 10) * 10
    
    return {
      id: `mental-math-estimation-${Date.now()}`,
      question: `Estimate: ${num1} + ${num2} (round to nearest 10)`,
      answer: roundedAnswer,
      type: 'input',
      difficulty: level,
      category: 'mental-math'
    }
  }
  
  getTimeLimit(level: 'beginner' | 'intermediate' | 'advanced'): number {
    switch (level) {
      case 'beginner': return 12
      case 'intermediate': return 8
      case 'advanced': return 5
      default: return 12
    }
  }
  
  validateAnswer(question: MathQuestion, userAnswer: string): boolean {
    const numAnswer = parseFloat(userAnswer.trim())
    return !isNaN(numAnswer) && Math.abs(numAnswer - question.answer) < 0.001
  }
} 