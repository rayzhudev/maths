import type { MathQuestion } from '../core/GameStateManager'
import type { MathChallengeGenerator } from './ChallengeManager'

export class ArithmeticChallenge implements MathChallengeGenerator {
  generateQuestion(level: 'easy' | 'medium' | 'hard'): MathQuestion {
    const operations = ['+', '-', '*', '/']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    let num1: number, num2: number, answer: number, question: string
    
    // Set number ranges based on difficulty level
    if (level === 'easy') {
      num1 = Math.floor(Math.random() * 20) + 1
      num2 = Math.floor(Math.random() * 20) + 1
    } else if (level === 'medium') {
      num1 = Math.floor(Math.random() * 100) + 1
      num2 = Math.floor(Math.random() * 100) + 1
    } else { // hard
      num1 = Math.floor(Math.random() * 500) + 1
      num2 = Math.floor(Math.random() * 500) + 1
    }
    
    switch (operation) {
      case '+':
        answer = num1 + num2
        question = `${num1} + ${num2}`
        break
      case '-':
        // Ensure positive result
        if (num1 < num2) [num1, num2] = [num2, num1]
        answer = num1 - num2
        question = `${num1} - ${num2}`
        break
      case '*':
        // Keep numbers smaller for multiplication
        if (level === 'easy') {
          num1 = Math.floor(Math.random() * 12) + 1
          num2 = Math.floor(Math.random() * 12) + 1
        } else if (level === 'medium') {
          num1 = Math.floor(Math.random() * 25) + 1
          num2 = Math.floor(Math.random() * 25) + 1
        } else {
          num1 = Math.floor(Math.random() * 50) + 1
          num2 = Math.floor(Math.random() * 50) + 1
        }
        answer = num1 * num2
        question = `${num1} × ${num2}`
        break
      case '/':
        // Ensure clean division
        answer = level === 'easy' ? Math.floor(Math.random() * 12) + 1 :
          level === 'medium' ? Math.floor(Math.random() * 25) + 1 :
          Math.floor(Math.random() * 50) + 1
        num2 = Math.floor(Math.random() * 10) + 2
        num1 = answer * num2
        question = `${num1} ÷ ${num2}`
        break
      default:
        throw new Error('Invalid operation')
    }
    
    return {
      id: `arithmetic-${Date.now()}-${Math.random()}`,
      question: `${question} = ?`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'arithmetic'
    }
  }

  getTimeLimit(level: 'easy' | 'medium' | 'hard'): number {
    switch (level) {
      case 'easy': return 15
      case 'medium': return 10
      case 'hard': return 7
      default: return 15
    }
  }

  validateAnswer(question: MathQuestion, userAnswer: string): boolean {
    const numericAnswer = parseFloat(userAnswer.trim())
    return !isNaN(numericAnswer) && Math.abs(numericAnswer - question.answer) < 0.001
  }
} 