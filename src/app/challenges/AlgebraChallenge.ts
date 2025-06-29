import type { MathQuestion } from '../core/GameStateManager'
import type { MathChallengeGenerator } from './ChallengeManager'

export class AlgebraChallenge implements MathChallengeGenerator {
  generateQuestion(level: 'easy' | 'medium' | 'hard'): MathQuestion {
    const operations = ['solve-linear', 'evaluate', 'simplify', 'word-problem']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    switch (operation) {
      case 'solve-linear':
        return this.generateLinearEquation(level)
      case 'evaluate':
        return this.generateEvaluation(level)
      case 'simplify':
        return this.generateSimplification(level)
      case 'word-problem':
        return this.generateWordProblem(level)
      default:
        return this.generateLinearEquation(level)
    }
  }
  
  private generateLinearEquation(level: 'easy' | 'medium' | 'hard'): MathQuestion {
    let answer: number, equation: string
    
    if (level === 'easy') {
      // Simple equations: x + a = b or x - a = b
      answer = Math.floor(Math.random() * 20) + 1
      const a = Math.floor(Math.random() * 20) + 1
      const isAddition = Math.random() < 0.5
      
      if (isAddition) {
        const b = answer + a
        equation = `x + ${a} = ${b}`
      } else {
        const b = answer + a
        equation = `x - ${a} = ${b}`
      }
    } else if (level === 'medium') {
      // ax + b = c or ax - b = c
      answer = Math.floor(Math.random() * 15) + 1
      const a = Math.floor(Math.random() * 5) + 2
      const b = Math.floor(Math.random() * 20) + 1
      const isAddition = Math.random() < 0.5
      
      if (isAddition) {
        const c = a * answer + b
        equation = `${a}x + ${b} = ${c}`
      } else {
        const c = a * answer - b
        equation = `${a}x - ${b} = ${c}`
      }
    } else {
      // More complex: ax + b = cx + d
      answer = Math.floor(Math.random() * 10) + 1
      const a = Math.floor(Math.random() * 5) + 2
      const b = Math.floor(Math.random() * 20) + 1
      const c = Math.floor(Math.random() * 3) + 1
      const d = a * answer + b - c * answer
      
      equation = `${a}x + ${b} = ${c}x + ${d}`
    }
    
    return {
      id: `algebra-linear-${Date.now()}`,
      question: `Solve for x: ${equation}`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'algebra'
    }
  }
  
  private generateEvaluation(level: 'easy' | 'medium' | 'hard'): MathQuestion {
    const x = Math.floor(Math.random() * 10) + 1
    let expression: string, answer: number
    
    if (level === 'easy') {
      // Simple: 2x + 3, x - 5, etc.
      const a = Math.floor(Math.random() * 5) + 1
      const b = Math.floor(Math.random() * 10) + 1
      const isAddition = Math.random() < 0.5
      
      if (isAddition) {
        expression = `${a}x + ${b}`
        answer = a * x + b
      } else {
        expression = `${a}x - ${b}`
        answer = a * x - b
      }
    } else if (level === 'medium') {
      // Quadratic: ax² + bx + c
      const a = Math.floor(Math.random() * 3) + 1
      const b = Math.floor(Math.random() * 5) + 1
      const c = Math.floor(Math.random() * 10) + 1
      
      expression = `${a}x² + ${b}x + ${c}`
      answer = a * x * x + b * x + c
    } else {
      // More complex: ax² + bx + c with negative terms
      const a = Math.floor(Math.random() * 3) + 1
      const b = Math.floor(Math.random() * 5) + 1
      const c = Math.floor(Math.random() * 10) + 1
      const isNegB = Math.random() < 0.5
      const isNegC = Math.random() < 0.5
      
      expression = `${a}x² ${isNegB ? '-' : '+'} ${b}x ${isNegC ? '-' : '+'} ${c}`
      answer = a * x * x + (isNegB ? -b : b) * x + (isNegC ? -c : c)
    }
    
    return {
      id: `algebra-evaluate-${Date.now()}`,
      question: `Evaluate ${expression} when x = ${x}`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'algebra'
    }
  }
  
  private generateSimplification(level: 'easy' | 'medium' | 'hard'): MathQuestion {
    if (level === 'easy') {
      // Combine like terms: 3x + 2x = ?
      const a = Math.floor(Math.random() * 5) + 1
      const b = Math.floor(Math.random() * 5) + 1
      const answer = a + b
      
      return {
        id: `algebra-simplify-${Date.now()}`,
        question: `Simplify: ${a}x + ${b}x (coefficient only)`,
        answer,
        type: 'input',
        difficulty: level,
        category: 'algebra'
      }
    } else if (level === 'medium') {
      // Mixed terms: ax + b + cx + d
      const a = Math.floor(Math.random() * 5) + 1
      const b = Math.floor(Math.random() * 10) + 1
      const c = Math.floor(Math.random() * 5) + 1
      const d = Math.floor(Math.random() * 10) + 1
      
      const xCoeff = a + c
      const constant = b + d
      
      return {
        id: `algebra-simplify-${Date.now()}`,
        question: `Simplify: ${a}x + ${b} + ${c}x + ${d}. Enter x coefficient then constant (e.g., 5,7)`,
        answer: parseFloat(`${xCoeff}.${constant}`), // Creative encoding
        type: 'input',
        difficulty: level,
        category: 'algebra'
      }
    } else {
      // Distribute: a(bx + c)
      const a = Math.floor(Math.random() * 5) + 2
      const b = Math.floor(Math.random() * 5) + 1
      const c = Math.floor(Math.random() * 10) + 1
      
      const xCoeff = a * b
      const constant = a * c
      
      return {
        id: `algebra-simplify-${Date.now()}`,
        question: `Expand: ${a}(${b}x + ${c}). Enter x coefficient then constant (e.g., 5,7)`,
        answer: parseFloat(`${xCoeff}.${constant}`),
        type: 'input',
        difficulty: level,
        category: 'algebra'
      }
    }
  }
  
  private generateWordProblem(level: 'easy' | 'medium' | 'hard'): MathQuestion {
    const problems = this.getWordProblems(level)
    const problem = problems[Math.floor(Math.random() * problems.length)]
    
    return {
      id: `algebra-word-${Date.now()}`,
      question: problem.question,
      answer: problem.answer,
      type: 'input',
      difficulty: level,
      category: 'algebra'
    }
  }
  
  private getWordProblems(level: 'easy' | 'medium' | 'hard') {
    if (level === 'easy') {
      const x = Math.floor(Math.random() * 15) + 5
      return [
        {
          question: `A number plus 7 equals ${x + 7}. What is the number?`,
          answer: x
        },
        {
          question: `Three times a number is ${x * 3}. What is the number?`,
          answer: x
        },
        {
          question: `A number minus 4 equals ${x - 4}. What is the number?`,
          answer: x
        }
      ]
    } else if (level === 'medium') {
      const x = Math.floor(Math.random() * 10) + 5
      return [
        {
          question: `The sum of two consecutive numbers is ${x + (x + 1)}. What is the smaller number?`,
          answer: x
        },
        {
          question: `John has ${x} apples. Mary has 3 times as many. Together they have ${x + 3 * x} apples. How many does John have?`,
          answer: x
        },
        {
          question: `A rectangle's length is twice its width. If the perimeter is ${2 * (x + 2 * x)}, what is the width?`,
          answer: x
        }
      ]
    } else {
      const x = Math.floor(Math.random() * 8) + 3
      return [
        {
          question: `The sum of three consecutive odd numbers is ${(2*x-1) + (2*x+1) + (2*x+3)}. What is the middle number?`,
          answer: 2*x+1
        },
        {
          question: `A number increased by 25% equals ${x * 1.25}. What is the original number?`,
          answer: x
        },
        {
          question: `If 2x - 5 = x + ${x - 5}, what is x?`,
          answer: x
        }
      ]
    }
  }
  
  getTimeLimit(level: 'easy' | 'medium' | 'hard'): number {
    switch (level) {
      case 'easy': return 30
      case 'medium': return 25
      case 'hard': return 20
      default: return 25
    }
  }
  
  validateAnswer(question: MathQuestion, userAnswer: string): boolean {
    const numAnswer = parseFloat(userAnswer.trim())
    return !isNaN(numAnswer) && Math.abs(numAnswer - question.answer) < 0.01
  }
} 